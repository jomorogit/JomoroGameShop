"use client"
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/Toast'; 
import { useSession } from "next-auth/react";
import Image from 'next/image';
import { PayGameWithBalance } from '@/app/action/payment';
import { createCheckoutSessionGame } from '@/app/action/payment';
import { Loader2 } from "lucide-react";

interface CheckoutData {
  title: string;
  price: number;      
  game_img: string;
  balance: number;    
}

export default function PayType() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = searchParams.get('id');

  const { data: session } = useSession(); 
  const { showToast } = useToast(); 
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если gameId еще не загрузился, ничего не делаем
    if (!gameId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment-data/${gameId}`);
        
        if (!response.ok) {
          throw new Error('Data loading error');
        }

        const jsonData: CheckoutData = await response.json();
        setData(jsonData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Something wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId]); //запрос повторится, как только gameId придет из URL

  let deduct = 0;
  let remaining = 0;
  let isFullPay = false;

  if (data?.balance !== undefined && data?.price !== undefined) {
    if (Number(data.balance) < Number(data.price)) {
      deduct = data.balance * -1;
      remaining = data.price - data.balance;
    } 
    if(Number(data.balance) >= Number(data.price)){
      deduct = data.price * -1;
      remaining = 0;
      isFullPay = true; 
    }
  }

  const handlePayBalance = async () => {
    if(!session?.user.email){
      showToast("Please log in to purchase games!", "/register/login", "Log In");
      return {error: "User not authorized"};
    }
    if(!gameId){
      return {error: "Chose the game"};
    }
    try{
      setLoading(true);
        const res = await PayGameWithBalance(Number(gameId));
        if(res?.error){
          showToast(`❌ ${res.error}`);
          return {error: "Server error"}
        }
        if (res?.paymentType === "AccountBalance") {
          showToast("✅Success! The game has been added to your library.");
          setTimeout(() => {
            router.push("/library");
          }, 2000);
        }
        if (res?.url) {
        showToast("Redirecting to secure payment...");
        window.location.href = res.url; 
      }
    }catch(error){
       return {error: "Server error"};
    }finally{
      setLoading(false);
    }
  }


  const handleBuyGame = async () => {
            if (!gameId) {
              showToast("❌ Please chose game");
              return;
            }
        
            if (!session?.user?.email) {
              showToast("Please log in to purchase games!", "/register/login", "Log In");
              return;
            }
        
            try {
              setLoading(true);
              const result = await createCheckoutSessionGame(Number(gameId));
        
              if (result?.error) {
                showToast(` ${result.error}`);
                return;
              }
        
              if (result?.url) {
                showToast("Redirecting to secure payment...");
                window.location.href = result.url; 
              }
            } catch (error) {
              console.error(error);
              showToast("Something went wrong. Please try again.");
            } finally {
              setLoading(false);
            }
          };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => router.back()}
    >
      <div 
        className="relative bg-[#251642] lg:max-w-[650px] p-5 sm:p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Кнопка закрытия модалки */}
        <button 
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:w-10 lg:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h1 className="text-white font-bold text-xl lg:text-2xl tracking-wide">CHECKOUT</h1>
        
        {/* Top part */}
        <div className="flex gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
          {/* Image контейнер */}
          <div className="relative w-[90px] h-[90px] shrink-0">
            {data?.game_img && (
            <Image
              src={data?.game_img}
              alt="game cover"
              fill 
              className="object-cover rounded-xl border-2 border-purple-900"
              sizes="90px"
            />  
            )} 
          </div>

          <div className="flex flex-col justify-center w-full text-base sm:text-lg lg:text-xl min-w-0">
            {/* Item name */}
            <div className="text-white flex gap-1 truncate">
              <span className="font-light opacity-80">ITEM:</span>
              <span className="font-semibold truncate">{data?.title}</span>
            </div>

            {/* Price */}
            <div className="text-white flex gap-1 mt-1">
              <span className="font-light opacity-80">PRICE:</span>
              <span className="font-semibold">{data?.price === 0 ? 'free' : `${data?.price}€`}</span>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="text-white space-y-4">
          {/* 1 option */}
          <div className="border border-white/10 bg-white/[0.02] p-4 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <h2 className="font-bold text-sm lg:text-xl sm:text-base">DIRECT FULL PAYMENT</h2>
              <span className="text-xs text-purple-300 lg:text-xl font-semibold tracking-wider">STRIPE</span>
              <p className="text-xs text-gray-400 my-2 lg:text-[18px] leading-relaxed">Pay the full securely. Your current account balance will not be used.</p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 lg:text-xl active:scale-[0.99] px-4 py-2.5 rounded-lg text-sm w-full font-semibold transition-all shadow-md shadow-purple-600/10"
            onClick={() => {
              handleBuyGame();
            }}
            disabled={loading}
            >

              Pay {data?.price}€
            </button>
          </div>

          {/* 2 option */}
          <div className="border border-white/10 bg-white/[0.02] p-4 rounded-xl">
            <h2 className="font-bold text-sm sm:text-base lg:text-xl">USE ACCOUNT BALANCE</h2>
            <span className="text-xs text-purple-300 font-semibold tracking-wider lg:text-xl">YOUR BALANCE: {data?.balance}€</span>
            
            <div className="w-full h-0.5 bg-purple-900 my-3 opacity-50"></div>
            
            <div className="space-y-1.5 my-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
              {/* deduct */}
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-400 lg:text-xl">DEDUCT BALANCE</span>
                <span className="font-mono lg:text-xl">{deduct}€</span>
              </div>
              
              {/* remaining */}
              <div className="flex justify-between text-xs lg:text-xl sm:text-sm font-bold pt-1.5 border-t border-white/5">
                <span>REMAINING DUE:</span>
                <span className="font-mono text-purple-300">{remaining !== undefined ? `${remaining.toFixed(2)}€` : 'Loading...'}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 my-2 leading-relaxed lg:text-[18px]">Use your existing first. Pay the difference securely via STRIPE</p>
            
            <button className="bg-purple-600 hover:bg-purple-700 active:scale-[0.99] lg:text-xl px-4 py-2.5 rounded-lg text-sm w-full mt-2 font-semibold transition-all shadow-md shadow-purple-600/10"
            onClick={() => {
              handlePayBalance();
            }}
            disabled={loading}
            >
              {!isFullPay ? (
                <span>Pay {remaining.toFixed(2)}€ STRIPE</span>
              ) : remaining === 0 ? (
                <span>Pay {data?.price}€ With balance</span>
              ) : (
                <span>Pay {remaining.toFixed(2)}€ With balance</span>
              )}
            </button>
          </div>
        </div>
        {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-3 bg-[#130f1d] border border-purple-500/30 p-8 rounded-3xl shadow-2xl shadow-purple-950/50">
            <Loader2 className="w-12 h-12 text-[#9343E7] animate-spin" />
            <span className="text-purple-300 font-medium tracking-wide text-sm">Please wait...</span>
          </div>
        </div>
      )}

     {error && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm transition-all duration-300 p-4">
        <div className="flex flex-col items-center text-center max-w-sm w-full gap-4 bg-[#181124] border border-red-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Иконка ошибки с красивым неоновым свечением 🚨 */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            {/* Если у тебя импортирован XCircle или AlertCircle из lucide-react, используй его: */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Текст ошибки */}
          <div className="space-y-1">
            <h2 className="text-white font-bold text-lg tracking-wide uppercase">Opps! Error occurred</h2>
            <p className="text-gray-400 text-sm leading-relaxed px-2">
              {error || "Something went wrong while processing your request."}
            </p>
          </div>

          {/* Кнопка закрытия / возврата 🔄 */}
          <button 
            onClick={() => router.back()} 
            className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-red-950/40 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    )}
      </div>
    </div>
  )
}