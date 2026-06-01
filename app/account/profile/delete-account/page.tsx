"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { TriangleAlert, Trash2 } from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import { DeleteGameOTP, Validation } from '@/app/action/delete-account';

export default function DeleteAccount() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");
  const [codeBlock, setCodeBlock] = useState(true);
  const [subButton, setSubButton] = useState(false);
  const [timer, setTimer] = useState(0); 
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false); 

  // 1. Функция генерации и отправки кода на почту
  const handleCreateCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.email) return;
    setErrorMsg(""); // Сбрасываем старые ошибки

    try {
      const res = await DeleteGameOTP();
      if (res?.success) {
        setSubButton(true);   
        setCodeBlock(false);  
        setTimer(60);         
      } else {
        setErrorMsg(res?.error || "Failed to send code. Please try again.");
      }
    } catch (error) {
      console.error("Error creating OTP:", error);
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  // 2. Таймер обратного отсчета
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // 3. Валидация кода и финальное удаление
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(""); 


    if (!code) {
      setErrorMsg("Please enter the verification code.");
      return;
    }
    if (code.length !== 6) {
      setErrorMsg("The code must be exactly 6 digits.");
      return;
    }
    if (!session?.user?.email) {
      setErrorMsg("Your session has expired. Please log in again.");
      return;
    }

    try {
      setIsPending(true); 
      const res = await Validation(code);
      
      if (res?.error) {
        setErrorMsg(res.error);
        setIsPending(false);
        return;
      }
      
      if (res?.success) {
        await signOut({ callbackUrl: '/' });
      }
    } catch (error) {
      console.error("Error delete:", error);
      setErrorMsg("An error occurred during account deletion.");
      setIsPending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => router.back()}
    >
      <div 
        className="bg-[#251642] p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[450px] min-h-[300px]"
        onClick={(e) => e.stopPropagation()} 
      >
        {step === 0 && (
          <div>
            <div className="flex items-center gap-2 text-red-500 font-medium text-sm mb-4">
              <TriangleAlert className="w-5 h-5" />
              <span>Danger Zone</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-3">
              Delete Account Permanently?
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Are you sure you want to delete your account? <span className="text-red-500 font-medium">This action cannot be undone</span>. All of your data, including your profile, purchase history, and saved preferences, will be <span className="text-red-400/90">permanently erased</span> from our servers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2 order-2 sm:order-1"
                onClick={() => setStep(1)}
              >
                <Trash2 className="w-4 h-4" />
                Yes, delete my account
              </button>
              
              <button 
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2d2d3d] hover:bg-[#3d3d52] text-gray-300 hover:text-white font-medium text-sm rounded-xl transition-colors order-1 sm:order-2 text-center"
                onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <form onSubmit={handleDelete} className="flex flex-col w-full items-center">
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                disabled={codeBlock || isPending}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`text-center text-4xl tracking-[1rem] p-6 mb-4 bg-white/5 rounded-2xl border outline-none focus:bg-purple-500/5 transition-all w-full font-mono ${
                  !codeBlock 
                    ? 'border-purple-500 text-purple-400' 
                    : 'border-white/10 text-white/30'
                }`}
              />

              {/* вывод ошибки для пользователя */}
              {errorMsg && (
                <p className="text-red-500 text-xs font-medium mb-4 text-center max-w-xs animate-pulse">
                  {errorMsg}
                </p>
              )}

              {subButton === false ? (
                <button
                  type="button" 
                  onClick={handleCreateCode}
                  className='cursor-pointer p-4 border-2 border-purple-900 rounded-xl text-white hover:bg-purple-900/20 transition-colors font-medium text-sm'
                >
                  Create code
                </button>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  <button 
                    type="submit"
                    disabled={code.length !== 6 || isPending}
                    className="w-full p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center"
                  >
                    {isPending ? "Deleting account..." : "Submit Code"}
                  </button>

                  <div className="text-center">
                    {timer > 0 ? (
                      <p className="text-white/30 text-xs">Resend code in {timer}s ⏳</p>
                    ) : (
                      <button 
                        type="button" 
                        disabled={isPending}
                        onClick={handleCreateCode} 
                        className="text-purple-400 hover:text-purple-300 text-xs underline underline-offset-4 disabled:opacity-50"
                      >
                        Didn&apos;t get the code? Resend
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}