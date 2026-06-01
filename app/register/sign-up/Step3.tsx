"use client";

import React, { useState, useEffect } from "react";
import { ISignUpData } from "@/lib/types";
import { sendOTP } from "@/app/action/register";

interface Step3Props {
  formData: ISignUpData; // Получаем весь объект данных
  setFormData: React.Dispatch<React.SetStateAction<ISignUpData>>;
  onVerify: (code: string) => void; 
  onBack: () => void;
}

export default function Step3({ formData, setFormData, onVerify, onBack }: Step3Props) {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [createCode, setCreateCode] = useState<number>(0);
  
  // Достаем email из formData для отображения пользователю
  const email = formData.email;
 
  const createFirstCode = () => {
    setCreateCode((prev) => prev + 10);
    try{
      sendOTP(formData.email)
    }catch(error){
      console.log(error);
    }
  };
  //таймер для того чтобы отправить код снова
 useEffect(() => {
  if (timer > 0) {
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  } else {
    sendOTP(formData.email)
  }
}, [timer]);

  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      // 2. Сначала обновляем состояние, затем вызываем проверку
      setFormData((prev) => ({ ...prev, code: code })); 
      onVerify(code); 
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 h-full">
      <h1 className="text-3xl text-white font-bold tracking-tight text-center">
        Verify Your Identity 📧
      </h1>
      <p className="text-purple-400/80 text-sm mt-2 mb-8 text-center px-4">
        We&apos;ve sent a 6-digit code to <span className="text-white font-medium">{email}</span>. 
        Check your inbox to secure your code
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col w-full items-center">
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="text-center text-4xl tracking-[1rem] p-6 mb-8 bg-white/5 border border-white/10 rounded-2xl text-purple-400 outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all w-full font-mono"
        />
        {createCode < 1 ? (
          <button
              onClick={createFirstCode}
              className="w-full bg-[#9343E7] hover:bg-[#a55cf0] disabled:opacity-50 disabled:hover:bg-[#9343E7] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] mb-6"
            >
              Create Code
        </button>
        ) : (
        <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full bg-[#9343E7] hover:bg-[#a55cf0] disabled:opacity-50 disabled:hover:bg-[#9343E7] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] mb-6"
                >
                  Confirm Code
                </button>
        )}
        
        

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-white/30 text-xs">Resend code in {timer}s ⏳</p>
          ) : (
            <button 
              type="button" 
              onClick={() => setTimer(60)}
              
              className="text-purple-400 hover:text-purple-300 text-xs underline underline-offset-4"
            >
              Didn&apos;t get the code? Resend 🔄
            </button>
          )}
        </div>
      </form>

      <button 
        onClick={onBack}
        className="mt-10 text-white/50 hover:text-white text-sm transition-colors"
      >
        ← Use different email
      </button>
    </div>
  );
}