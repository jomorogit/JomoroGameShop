"use client";

import React, { useState } from 'react';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react'; 
import { useToast } from '@/app/components/Toast'; 
import { useSession } from "next-auth/react";
import { RefilMoney } from '@/app/action/payment';

export default function AddMoney() {
  const [amount, setAmount] = useState<string>("5");
  const { data: session } = useSession(); 
  const { showToast } = useToast(); 
  const [loading, setLoading] = useState(false);

  const presets = ["5", "10", "25", "50", "100"];

  const handlePresetClick = (val: string) => {
    if (loading) return;
    setAmount(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    // Разрешаем только цифры
    const value = e.target.value.replace(/\D/g, "");
    setAmount(value);
  };
  
  const handleRefill = async () => {
    const finalAmount = Number(amount);
    
    if (!finalAmount || finalAmount <= 0) {
      showToast("❌ Please enter a valid amount");
      return;
    }

    if (!session?.user?.email) {
      showToast("Please log in to purchase games!", "/register/login", "Log In");
      return;
    }

    try {
      setLoading(true);
      const result = await RefilMoney(finalAmount);

      if (result?.error) {
        showToast(`❌ ${result.error}`);
        return;
      }

      if (result?.url) {
        showToast("🔄 Redirecting to secure payment...");
        window.location.href = result.url; 
      }
    } catch (error) {
      console.error(error);
      showToast("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl px-4 text-white">
      {/* Заголовок страницы */}
      <div className="flex items-center gap-3 mb-8">
        <Wallet className="text-[#a855f7] w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-tight">Refill the balance</h1>
      </div>

      <div className="bg-[#23122E] border border-[#3b1d4e] rounded-2xl p-6 shadow-xl space-y-8">
        
        {/* Секция быстрых пресетов */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Select Amount
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={loading}
                onClick={() => handlePresetClick(preset)}
                className={`py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 cursor-pointer text-center border ${
                  amount === preset
                    ? "bg-[#572b76] border-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20"
                    : "bg-[#170b20] border-transparent hover:border-[#572b76] text-gray-300 hover:text-white"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {preset}€
              </button>
            ))}
          </div>
        </div>

        {/* Секция ручного ввода суммы */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Or enter custom amount
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={amount}
              disabled={loading}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full bg-[#170b20] border border-[#3b1d4e] rounded-xl py-4 pl-5 pr-12 text-2xl font-bold text-white focus:outline-none focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/20 transition-all placeholder-gray-600 disabled:opacity-50"
            />
            <span className="absolute right-5 text-2xl font-bold text-gray-400 pointer-events-none">
              €
            </span>
          </div>
        </div>

        <hr className="border-[#3b1d4e]" />

        {/* Итоговая плашка и кнопка оплаты */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1b0d24] p-4 rounded-xl border border-[#3b1d4e]">
          <div className="text-center sm:text-left">
            <span className="text-sm text-gray-400 block">Total to pay:</span>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {amount ? amount : "0"}€
            </span>
          </div>

          <button
            onClick={handleRefill}
            disabled={loading}
            className={`w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-lg shadow-green-900/30 active:scale-95 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <span>Processing...</span>
                <Loader2 size={20} className="animate-spin mt-0.5" /> 
              </>
            ) : (
              <>
                <span>Refill Now</span>
                <ArrowRight size={20} className="mt-0.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}