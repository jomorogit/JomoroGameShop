'use server';

import { authConfig } from "../configs/auth";
import { getServerSession } from "next-auth";
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceiptEmail } from "@/lib/mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';


 //1. ОПЛАТА ВСЕЙ КОРЗИНЫ

export async function createCheckoutSession() {
  try {
     const session = await getServerSession(authConfig);
     if (!session?.user?.email || !session?.user?.id) {
        return { error: "User not authorized" };
     }

     const cartItems = await prisma.cart.findMany({
        where: { user_id: Number(session.user.id) },
        include: {
            game: { select: { price_eur: true } }
         }
     });

     if (cartItems.length === 0) {
        return { error: "Your cart is empty" };
     }

     const totalEuro = cartItems.reduce((acc, current) => {
        const price = current.game?.price_eur ? current.game.price_eur.toNumber() : 0; 
        return acc + price;
     }, 0);

     const amountInCents = Math.round(totalEuro * 100);

     // Создаем сессию в Stripe
     const stripeSession = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       mode: 'payment',
       currency: 'eur', 
       line_items: [
         {
           price_data: {
             currency: 'eur',
             product_data: {
               name: `GameShop Order for User #${session.user.id}`,
             },
             unit_amount: amountInCents,
           },
           quantity: 1,
         },
       ],
       metadata: {
         userId: session.user.id,
         type: 'purchase',
         //ЗАЩИТА: Фиксируем ID игр в Stripe, чтобы их нельзя было подменить в процессе оплаты
         gameIds: JSON.stringify(cartItems.map(item => item.game_id)), 
       },
       success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${baseUrl}/cart`,
     });

     return { url: stripeSession.url };

  } catch (error) {
     console.error('Stripe session creation error:', error);
     return { error: 'Failed to create payment' };
  }
}


 // 2. ПОПОЛНЕНИЕ ВНУТРЕННЕГО БАЛАНСА КОШЕЛЬКА
 
export async function RefilMoney(finalAmount: number) {
  try {
    const session = await getServerSession(authConfig);
     if (!session?.user?.email || !session?.user?.id) {
        return { error: "User not authorized" };
     }
     if (!finalAmount || finalAmount < 2) {
      return { error: "Not valid value"};
     }
     const amountInCents = Math.round(finalAmount * 100);

     const stripeSession = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       mode: 'payment',
       currency: 'eur',
       line_items: [
         {
           price_data: {
             currency: 'eur',
             product_data: {
               name: `GameShop refill for User #${session.user.id}`,
             },
             unit_amount: amountInCents, 
           },
           quantity: 1,
         },
       ],
       metadata: {
         userId: session.user.id,
         type: 'refill',
       },
       success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${baseUrl}/account/addmoney`,
     });
     return { url: stripeSession.url };

  } catch(error) {
    return { error: "error" }
  }
}

 // 3. ПРЯМАЯ ПОКУПКА ОДНОЙ ИГРЫ (БЕЗ БАЛАНСА)
 
export async function createCheckoutSessionGame(game_id: number) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email || !session?.user?.id) {
       return { error: "User not authorized" };
    }

    const isGame = await prisma.game.findUnique({
     where: { id: game_id }
    });

    if (!isGame) {
      return { error: "Game not found" };
    }

    const amountInCents = Math.round(Number(isGame.price_eur) * 100);

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'eur',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${isGame.title} - GameShop`, 
            },
            unit_amount: amountInCents, 
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        gameId: String(game_id),
        type: 'single_purchase',
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return { url: stripeSession.url };
  } catch (error) {
     console.error(error);
     return { error: "Failed to process single-game payment" };
  }
}


 // 4. ОПЛАТА ИГРЫ С БАЛАНСА ИЛИ ЧАСТИЧНАЯ ДОПЛАТА КАРТОЙ
 
export async function PayGameWithBalance(gameId: number) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email || !session?.user?.id) {
       return { error: "User not authorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id), email: session.user.email }
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!user || !game) {
      return { error: "User or Game not found" };
    }

    const userBalance = Number(user.balance_eur);
    const gamePrice = Number(game.price_eur);

   // Вариант А: Баланса хватает на полную покупку
   if (userBalance >= gamePrice) {
    const transaction = await prisma.$transaction(async (tx) => {
      
      const newTransaction = await tx.transaction.create({
        data: {
          amount_eur: new Prisma.Decimal(gamePrice),
          payment_type: "Purchase",
          stripe_session_id: `balance_${crypto.randomUUID()}`,
          user_id: Number(session.user.id), 
          transaction_games: {
            create: {
              game_id: gameId,
              price_paid_eur: new Prisma.Decimal(gamePrice),
            },
          },
        },
      });

      await tx.library.upsert({
        where: {
          game_id_user_id: { game_id: gameId, user_id: Number(session.user.id) },
        },
        update: { purchase_price_eur: new Prisma.Decimal(gamePrice) },
        create: {
          game_id: gameId,
          user_id: Number(session.user.id),
          purchase_price_eur: new Prisma.Decimal(gamePrice),
        },
      });

      // Используем безопасный deleteMany, чтобы избежать падения, если товара нет в корзине
      await tx.cart.deleteMany({
        where: { user_id: Number(session.user.id), game_id: Number(gameId) },
      });
      
      await tx.user.update({
        where: { id: Number(session.user.id) },
        data: {
          balance_eur: { decrement: new Prisma.Decimal(gamePrice) }
        }
      });

      return newTransaction; 
    });

    if (session?.user?.email) {
      try {
        await sendPurchaseReceiptEmail(session.user.email, `bal_${transaction.id}`, [
          { title: game.title, priceEur: gamePrice }
        ]);
      } catch (mailError) {
        console.error(" Email failed:", mailError);
      }
    }
    return { success: "The purchase was successful", paymentType: "AccountBalance" };
  }
  
  // Вариант Б: Баланса не хватает, генерируем сессию доплаты через Stripe
  if (userBalance < gamePrice) {
    const paySum = gamePrice - userBalance;
    const amountInCents = Math.round(paySum * 100);
      
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'eur',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${game.title} - Partial Balance Payment`, 
            },
            unit_amount: amountInCents, 
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        gameId: String(game.id),
        type: 'partial_balance_purchase',
        // ЗАЩИТА: Фиксируем точную сумму списания с баланса, чтобы не обнулить кошелек «вслепую»
        balanceToDecrement: String(userBalance), 
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return { url: stripeSession.url };
    }
    
  } catch (error) {
    console.error("Payment error log:", error); 
    return { error: "Failed to process payment" };
  }
}