import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authConfig } from "../configs/auth";
import { prisma } from "@/lib/prisma";
import Stripe from 'stripe';
import { Check } from 'lucide-react';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams?.session_id;

  if (!sessionId) {
    redirect('/cart?error=missing_session');
  }

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.payment_method'],
    });

    if (stripeSession.payment_status !== 'paid') {
      redirect('/cart?error=not_paid');
    }

    const userSession = await getServerSession(authConfig);
    const currentUserId = userSession?.user?.id;

    if (!currentUserId || stripeSession.metadata?.userId !== String(currentUserId)) {
      redirect('/cart?error=wrong_user');
    }
    const isRefill = stripeSession.metadata?.type === 'refill';

    const paymentIntent = stripeSession.payment_intent as Stripe.PaymentIntent;
    const paymentMethod = paymentIntent?.payment_method as Stripe.PaymentMethod;

    let paymentType = 'Card';
    if (paymentMethod?.type === 'card') {
      const brand = paymentMethod.card?.brand ? paymentMethod.card.brand.toUpperCase() : 'CARD';
      const wallet = paymentMethod.card?.wallet?.type;
      
      if (wallet === 'apple_pay') paymentType = `${brand} (Apple Pay)`;
      else if (wallet === 'google_pay') paymentType = `${brand} (Google Pay)`;
      else paymentType = `${brand} •••• ${paymentMethod.card?.last4 || ''}`;
    }

    let bankInfo = 'International Bank';
    if (paymentMethod?.type === 'card' && paymentMethod.card) {
      const funding = paymentMethod.card.funding === 'debit' ? 'Debit' : 'Credit';
      bankInfo = `${funding} Card`;
    }

    const amountPaid = stripeSession.amount_total 
      ? (stripeSession.amount_total / 100).toFixed(2) 
      : '0.00';

    return (
        <div className='w-full h-screen flex items-center justify-center text-white'>
            <div className='h-[80%] w-[30%] min-w-96 bg-[#23122E] rounded-2xl border-2 border-purple-950 flex flex-col justify-between p-6 shadow-2xl'>
                
                <div>
                  {/* Галочка */}
                  <div className='w-full mt-4 flex justify-center'>
                      <div className="flex items-center justify-center w-20 h-20 bg-[#2ecc71] text-white rounded-full shadow-lg shadow-green-900/30">
                          <Check className="w-12 h-12 stroke-[3]" />
                      </div>
                  </div>
                  
                  {/* Текст заголовка 📝 */}
                  <div className='w-full flex flex-col items-center mt-6 gap-1'>
                      <p className='text-[#2ecc71] text-3xl font-bold'>Payment successful</p>
                      <p className='text-gray-400 text-sm'>
                        {isRefill ? "Your wallet has been topped up" : "Thank you for your order!"}
                      </p>
                  </div>
                  
                  {/* Информация */}
                  <div className='w-full mt-8 space-y-4 px-2'>
                      <div className='w-full flex justify-between'>
                          <span className='text-gray-500'>Payment type</span>
                          <span className='text-white font-medium'>{paymentType}</span>
                      </div>

                      <div className='w-full flex justify-between'>
                          <span className='text-gray-500'>Bank</span>
                          <span className='text-white font-medium'>{bankInfo}</span>
                      </div>

                      <div className='w-full flex justify-between'>
                          <span className='text-gray-500'>Email</span>
                          <span className='text-white font-medium'>{userSession?.user?.email}</span>
                      </div>

                      {/* Сумма в ЕВРО 💶 */}
                      <div className='w-full flex justify-between pt-2 border-t border-purple-950/50'>
                          <span className='text-gray-500 text-xl'>Amount paid</span>
                          <span className='text-xl text-[#2ecc71] font-bold'>{amountPaid} €</span>
                      </div>

                      <div className='w-full flex justify-between items-center'>
                          <span className='text-gray-500'>Transaction ID</span>
                          <span className='text-slate-300 font-mono text-xs max-w-[180px] truncate bg-[#170b20] px-2 py-1 rounded border border-purple-950'>
                            {paymentIntent?.id || sessionId}
                          </span>
                      </div>
                  </div>
                </div>

                {/* Навигационные кнопки */}
                <div className='w-full mb-4'>
                    {isRefill ? (
                      <Link href="/"
                        className='block w-full p-4 border-2 border-purple-900 rounded-2xl bg-purple-700 hover:bg-purple-600 active:bg-purple-500 text-xl font-bold text-center transition-all'
                      >
                        Ok
                      </Link>
                    ) : (
                      <Link href="/library"
                        className='block w-full p-4 border-2 border-green-900 rounded-2xl bg-green-700 hover:bg-green-600 active:bg-green-500 text-xl font-bold text-center transition-all'
                      >
                        Go to Library
                      </Link>
                    )}
                </div>

            </div>
        </div>
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    redirect('/cart?error=verification_failed');
  }
}