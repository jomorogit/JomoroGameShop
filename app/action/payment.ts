'use server';

import { authConfig } from "../configs/auth";
import { getServerSession } from "next-auth";
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceiptEmail } from "@/lib/mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


// Если в системе есть NEXT_PUBLIC_APP_URL (на Vercel), берем его, иначе — localhost.
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function createCheckoutSession() {
  try {
     const session = await getServerSession(authConfig);
     if (!session?.user?.email || !session?.user?.id) {
        return { error: "User not authorized" };
     }

     const res = await prisma.cart.findMany({
        where: {
            user_id: Number(session.user.id)
        },
        include: {
            game: {
                select: {
                    price_eur: true,
                }
            }
         }
     });

     if (res.length === 0) {
        return { error: "Your cart is empty" };
     }

     const totalEuro = res.reduce((acc, current) => {
        const price = current.game?.price_eur ? current.game.price_eur.toNumber() : 0; 
        return acc + price;
     }, 0);

     // перевод в центы
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
               name: `GameShop refil for User #${session.user.id}`,
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

export async function PayGameWithBalance(gameId: number) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email || !session?.user?.id) {
       return { error: "User not authorized" };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
        email: session.user.email,
      }
    });

    if (!user) {
      return { error: "User is not found" };
    }

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      }
    });

    if (!game) {
      return { error: "Game is not found" };
    }

    const userBalance = Number(user.balance_eur);
    const gamePrice = Number(game.price_eur);

   if (userBalance >= gamePrice) {
    const transaction = await prisma.$transaction(async (tx) => {
      
      // 1. Создаем чек в БД
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
          game_id_user_id: {
            game_id: gameId,
            user_id: Number(session.user.id),
          },
        },
        update: {
          purchase_price_eur: new Prisma.Decimal(gamePrice),
        },
        create: {
          game_id: gameId,
          user_id: Number(session.user.id),
          purchase_price_eur: new Prisma.Decimal(gamePrice),
        },
      });

      await tx.cart.delete({
        where: {
          user_id_game_id: {
            user_id: Number(session.user.id),
            game_id: Number(gameId),
          },
        },
      });
      
      await tx.user.update({
        where: {
          id: Number(session.user.id),
        },
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
        console.error("❌ Unable to send email, but purchase completed:", mailError);
      }
    }
    const paymentType = "AccountBalance";
    return { success: "The purchase was successful", paymentType }
  }
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
              name: `${game.title} - GameShop`, 
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
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return { url: stripeSession.url };
    }
    
  } catch (error) {
    console.error("Payment error log:", error); 
    return { error: "Failed to process single-game payment" };
  }
}