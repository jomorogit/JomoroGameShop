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

    // ОПЕРАЦИЯ: ПОПОЛНЕНИЕ БАЛАНСА ПОЛЬЗОВАТЕЛЯ
    if (paymentType === 'refill') {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Инкремент баланса пользователя в модели User
          await tx.user.update({
            where: { id: Number(userId) },
            data: {
              balance_eur: {
                increment: amountTotal 
              }
            }
          });

          // 2. Логирование финансовой операции в таблице транзакций
          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id,
              amount_eur: amountTotal,
              payment_type: 'Deposit', 
            },
          });
        });

        console.log(`Users #${userId} balance has been successfully topped up by ${amountTotal}€`);
        return NextResponse.json({ received: true }, { status: 200 });

      } catch (dbError) {
        console.error('❌ Error while replenishing balance in the database:', dbError);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }

    // ОПЕРАЦИЯ: ПРЯМАЯ ПОКУПКА ОДНОЙ ИГРЫ
    if (paymentType === 'single_purchase') {
      try {
        const gameId = session.metadata?.gameId;

        await prisma.$transaction(async (tx) => {
          // 1. Получение данных об игре для фиксации стоимости на момент покупки
          const game = await tx.game.findUnique({ 
            where: { id: Number(gameId) } 
          });
          
          if (!game) throw new Error("Game not found in webhook");

          // 2. Добавление игры в цифровую библиотеку пользователя
          await tx.library.create({
            data: {
              user_id: Number(userId),
              game_id: Number(game.id),
              purchase_price_eur: Number(game.price_eur),
            }
          });
          
          await tx.cart.deleteMany({
              where: {
                  game_id: Number(gameId),
                  user_id: Number(userId),
              }
          });
          // 3. Создание финансовой транзакции и атомарное связывание с купленной игрой
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

          // 4. Асинхронная отправка email-чека внутри контекста транзакции
          if (customerEmail) {
            sendPurchaseReceiptEmail(customerEmail, session.id, [
              { title: game.title, priceEur: Number(game.price_eur) }
            ])
            .then(() => console.log(`Check for the game ${game.title}successfully sent to ${customerEmail}`))
            .catch((err) => console.error("Failed to send check:", err));
          }
        });

        return NextResponse.json({ received: true }, { status: 200 });

      } catch (error) {
        return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
      }
    }

    // ОПЕРАЦИЯ: ЧАСТИЧНАЯ ОПЛАТА С ВНЕШНЕЙ КАРТЫ С ОБНУЛЕНИЕМ ВНУТРЕННЕГО БАЛАНСА
    if (paymentType === 'partial_balance_purchase') {
      try {
         const gameId = session.metadata?.gameId;

         await prisma.$transaction(async (tx) => {
           // 1. Получение целевой игры
           const game = await tx.game.findUnique({ 
            where: { id: Number(gameId) } 
          });

          if (!game) throw new Error("Game not found in webhook");

          // 2. Регистрация игры в библиотеке пользователя
          await tx.library.create({
            data: {
              user_id: Number(userId),
              game_id: Number(game.id),
              purchase_price_eur: Number(game.price_eur),
            }
          });
          
          await tx.cart.deleteMany({
              where: {
                  game_id: Number(gameId),
                  user_id: Number(userId),
              }
          });
          // 3. Фиксация транзакции (сумма отражает только доплату через Stripe)
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

          // 4. Обнуление баланса пользователя, так как остаток стоимости был списан со счета
          await tx.user.update({
            where: {
              id: Number(userId),
            },
            data: {
              balance_eur: 0.00
            }
          });

          // 5. Отправка email-уведомления о покупке
          if (customerEmail) {
            sendPurchaseReceiptEmail(customerEmail, session.id, [
              { title: game.title, priceEur: Number(game.price_eur) }
            ])
            .then(() => console.log(` Check for the game ${game.title} successfully sent to ${customerEmail}`))
            .catch((err) => console.error("Failed to send check:", err));
          }
         });
         
         return NextResponse.json({ received: true }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
 
    // ОПЕРАЦИЯ: ГРУППОВАЯ ПОКУПКА ИГР ИЗ КОРЗИНЫ
    if (paymentType === 'purchase') {
      let purchasedItemsForEmail: { title: string; priceEur: number }[] = [];

      try {
        await prisma.$transaction(async (tx) => {
          // 1. Извлечение текущего содержимого корзины пользователя до совершения деструктивных операций
          const cartItems = await tx.cart.findMany({
            where: { user_id: Number(userId) },
            include: {
              game: {
                select: {
                  title: true,
                  price_eur: true, 
                },
              },
            },
          });

          if (cartItems.length === 0) {
            return;
          }
          
          await tx.cart.deleteMany({
              where: {
                  user_id: Number(userId),
              }
          });
          // Формирование массива данных для отправки отчета на email
          purchasedItemsForEmail = cartItems.map(item => ({
            title: item.game?.title || "Unknown Game",
            priceEur: item.game?.price_eur ? Number(item.game.price_eur) : 0
          }));

          // 2. Множественное добавление купленных позиций в библиотеку
          await tx.library.createMany({
            data: cartItems.map((item) => ({
              user_id: Number(userId),
              game_id: item.game_id,
              purchase_price_eur: item.game?.price_eur ? Number(item.game.price_eur) : 0,
            })),
          });

          // 3. Создание агрегирующей транзакции со списком всех оплаченных позиций
          await tx.transaction.create({
            data: {
              user_id: Number(userId),
              stripe_session_id: session.id, 
              amount_eur: amountTotal, 
              payment_type: 'Purchase', 
              transaction_games: {
                createMany: {
                  data: cartItems.map((item) => ({
                    game_id: item.game_id,
                    price_paid_eur: item.game?.price_eur ? Number(item.game.price_eur) : 0, 
                  })),
                },
              },
            },
          });

          // 4. Очистка корзины пользователя после успешного импорта в библиотеку
          await tx.cart.deleteMany({
            where: { user_id: Number(userId) },
          });
        });

        // 5. Отправка сводного email-чека по всем позициям из корзины
        if (customerEmail && purchasedItemsForEmail.length > 0) {
          sendPurchaseReceiptEmail(customerEmail, session.id, purchasedItemsForEmail)
            .then(() => console.log(`The check has been successfully sent to ${customerEmail}`))
            .catch(() => console.error(" Failed to send check"));
        } else {
          console.warn(`⚠️ Shipment cancelled: recipient address missing or product list empty.`);
        }

      } catch (error) {
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}