import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from "@/lib/prisma";
import { sendPurchaseReceiptEmail } from "@/lib/mail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Верификация подписи вебхука Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err}`);
    return NextResponse.json({ error: `Webhook Error: ${err}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const paymentType = session.metadata?.type; 
    const customerEmail = session.customer_details?.email;
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0; 

    if (!userId) {
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
    }

    // Проверка на дублирование транзакций
    const alreadyProcessed = await prisma.transaction.findFirst({
      where: { stripe_session_id: session.id }
    });
    if (alreadyProcessed) {
      console.log(`Transaction ${session.id} already processed. Skipping...`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    
    // ОПЕРАЦИЯ: ПОПОЛНЕНИЕ БАЛАНСА ПОЛЬЗОВАТЕЛЯ
     
    if (paymentType === 'refill') {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: Number(userId) },
            data: { balance_eur: { increment: amountTotal } }
          });

          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id,
              amount_eur: amountTotal,
              payment_type: 'Deposit', 
            },
          });
        });

        console.log(`User #${userId} balance topped up by ${amountTotal}€`);
        return NextResponse.json({ received: true }, { status: 200 });
      } catch (dbError) {
        console.error('Error during balance refill transaction:', dbError);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }

   
     // ОПЕРАЦИЯ: ПРЯМАЯ ПОКУПКА ОДНОЙ ИГРЫ
    
    if (paymentType === 'single_purchase') {
      try {
        const gameId = session.metadata?.gameId;

        await prisma.$transaction(async (tx) => {
          const game = await tx.game.findUnique({ 
            where: { id: Number(gameId) } 
          });
          
          if (!game) throw new Error("Game not found in webhook");

          await tx.library.create({
            data: {
              user_id: Number(userId),
              game_id: Number(game.id),
              purchase_price_eur: Number(game.price_eur),
            }
          });
          
          await tx.cart.deleteMany({
              where: { game_id: Number(gameId), user_id: Number(userId) }
          });

          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id,
              amount_eur: amountTotal,
              payment_type: 'Purchase',
              transaction_games: {
                create: {
                  game_id: Number(game.id),
                  price_paid_eur: Number(game.price_eur),
                }
              }
            }
          });

          if (customerEmail) {
            sendPurchaseReceiptEmail(customerEmail, session.id, [
              { title: game.title, priceEur: Number(game.price_eur) }
            ]).catch((err) => console.error("Email error:", err));
          }
        });

        return NextResponse.json({ received: true }, { status: 200 });
      } catch (error) {
        console.error('Single purchase transaction failed:', error);
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
      }
    }

 
     // ОПЕРАЦИЯ: ЧАСТИЧНАЯ ОПЛАТА С КАРТЫ С УМЕНЬШЕНИЕМ БАЛАНСА
    
    if (paymentType === 'partial_balance_purchase') {
      try {
         const gameId = session.metadata?.gameId;
         const balanceToDecrement = Number(session.metadata?.balanceToDecrement || 0);

         await prisma.$transaction(async (tx) => {
           const game = await tx.game.findUnique({ 
            where: { id: Number(gameId) } 
          });

          if (!game) throw new Error("Game not found in webhook");

          await tx.library.create({
            data: {
              user_id: Number(userId),
              game_id: Number(game.id),
              purchase_price_eur: Number(game.price_eur),
            }
          });
          
          await tx.cart.deleteMany({
              where: { game_id: Number(gameId), user_id: Number(userId) }
          });

          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id,
              amount_eur: amountTotal,
              payment_type: 'Purchase',
              transaction_games: {
                create: {
                  game_id: Number(game.id),
                  price_paid_eur: Number(game.price_eur),
                }
              }
            }
          });

          // ЗАЩИТА: Безопасно вычитаем ровно зафиксированную сумму доплаты, вместо жесткого обнуления
          await tx.user.update({
            where: { id: Number(userId) },
            data: {
              balance_eur: { decrement: balanceToDecrement }
            }
          });

          if (customerEmail) {
            sendPurchaseReceiptEmail(customerEmail, session.id, [
              { title: game.title, priceEur: Number(game.price_eur) }
            ]).catch((err) => console.error("Email error:", err));
          }
         });
         
         return NextResponse.json({ received: true }, { status: 200 });
      } catch (error) {
        console.error('Partial balance purchase transaction failed:', error);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
 
    
     // ОПЕРАЦИЯ: ГРУППОВАЯ ПОКУПКА ИГР ИЗ КОРЗИНЫ
    
    if (paymentType === 'purchase') {
      try {
        // ЗАЩИТА: Извлекаем ID игр из метаданных Stripe, а не из живой корзины пользователя
        const gameIds: number[] = JSON.parse(session.metadata?.gameIds || '[]');
        
        if (gameIds.length === 0) {
          return NextResponse.json({ error: 'No games found in metadata' }, { status: 400 });
        }

        let purchasedItemsForEmail: { title: string; priceEur: number }[] = [];

        await prisma.$transaction(async (tx) => {
          // Выбираем игры, которые были зафиксированы на момент оплаты
          const games = await tx.game.findMany({
            where: { id: { in: gameIds } }
          });

          if (games.length === 0) throw new Error("No real games matched Stripe metadata IDs");

          purchasedItemsForEmail = games.map(game => ({
            title: game.title,
            priceEur: Number(game.price_eur || 0)
          }));

          // Массово создаем игры в библиотеке пользователя
          await tx.library.createMany({
            data: games.map((game) => ({
              user_id: Number(userId),
              game_id: game.id,
              purchase_price_eur: Number(game.price_eur || 0),
            })),
          });

          // Регистрируем финансовую операцию
          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id, 
              amount_eur: amountTotal, 
              payment_type: 'Purchase', 
              transaction_games: {
                createMany: {
                  data: games.map((game) => ({
                    game_id: game.id,
                    price_paid_eur: Number(game.price_eur || 0), 
                  })),
                },
              },
            },
          });

          // Очищаем из корзины пользователя ТОЛЬКО те позиции, которые он успешно оплатил
          await tx.cart.deleteMany({
            where: { user_id: Number(userId), game_id: { in: gameIds } },
          });
        });

        if (customerEmail && purchasedItemsForEmail.length > 0) {
          sendPurchaseReceiptEmail(customerEmail, session.id, purchasedItemsForEmail).catch(console.error);
        }

        return NextResponse.json({ received: true }, { status: 200 });
      } catch (error) {
        console.error('Cart group purchase transaction failed:', error);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}