"use client";

import { useState } from "react";
import { checkUserAvailability } from "@/app/action/register";
import React from "react";
import { ISignUpData } from "@/lib/types";
import Link from "next/link";
import { Check } from "lucide-react";
interface Step1Props {
  formData: ISignUpData;
  setFormData: React.Dispatch<React.SetStateAction<ISignUpData>>;
  onNext: () => void;
}

export default function Step1({ formData, setFormData, onNext }: Step1Props) {
  // Новые состояния для UX
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null); 
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await checkUserAvailability(formData.email, formData.username);

      if (result && 'error' in result) {
        setError(result.error as string);
        setIsLoading(false);
        return; 
      }

  
      onNext();
    
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  const [isAccepted, setIsAccepted] = useState(false);
  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 h-full">
      <h1 className="font-inder text-3xl text-white font-bold tracking-tight text-center">Create Account</h1>
      <p className="text-purple-400/80 text-sm mt-2 mb-8 text-center">Start your journey in GameShop</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {/* Вывод ошибки */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs text-center animate-shake">
            {error}
          </div>
        )}


        {/* Инпуты ввода емейла и пароля */}
        <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Email Address</label>
        <input 
          name="email"
          type="email" 
          placeholder="your@email.com" 
          value={formData.email}
          onChange={handleChange}
          required 
          disabled={isLoading}
          className="p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50"
        />

        <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Username</label>
        <input 
          name="username"
          type="text" 
          placeholder="LegendaryGamer" 
          value={formData.username}
          onChange={handleChange}
          required 
          maxLength={20}
          disabled={isLoading}
          className="p-4 mb-10 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all disabled:opacity-50"
        />
        
        <div className="flex items-center gap-3 mb-8 ml-1 select-none">
          <label className="relative flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="peer sr-only"
            />
            {/* Кастомный квадратный контейнер чекбокса */}
            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-md transition-all flex items-center justify-center peer-checked:bg-[#9343E7] peer-checked:border-[#9343E7]">
              {/* Иконка Check из lucide-react с плавной анимацией масштабирования */}
              <Check 
                className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
                  isAccepted ? "scale-100" : "scale-0"
                }`} 
                strokeWidth={3.5} // Делаем галочку чуть жирнее для лучшей видимости
              />
            </div>
          </label>
          <span className="text-gray-400 text-[16px] tracking-wide">
            I agree to the{" "}
            <Link 
              href="/privacy" 
              target="_blank" 
              className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors font-medium"
            >
              GameShop Privacy Policy.
            </Link>
          </span>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !isAccepted}
          className="bg-[#9343E7] hover:bg-[#a55cf0] disabled:bg-purple-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)] flex justify-center items-center"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Continue to Password"
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4 w-full">
        <div className="h-[1px] bg-white/10 flex-1"></div>
        <span className="text-white/20 text-xs uppercase italic">GameShop ID</span>
        <div className="h-[1px] bg-white/10 flex-1"></div>
      </div>
    </div>
  );
}