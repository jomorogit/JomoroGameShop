"use client";
import { useState } from "react";
import React from "react";
import { ISignUpData } from "@/lib/types";

// 1. Описываем, какие пропсы этот компонент ожидает получить от родителя
interface Step1Props {
  formData: ISignUpData; // Сами данные
  setFormData: React.Dispatch<React.SetStateAction<ISignUpData>>; // Функция для их изменения
  onNext: () => void; // Сигнал к переключению
}

export default function Step2({ formData, setFormData, onNext }: Step1Props) {
  
 const [error, setError] = useState<string | null>(null);

  // 2. Универсальный обработчик ввода
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name — это "email" или "username", value — это то, что ввел юзер
    
    // Вызываем функцию родителя!
    setFormData((prev) => ({ 
      ...prev,         // "..." — копируем всё, что было в объекте, чтобы не стереть
      [name]: value    // Обновляем только то поле, в котором сейчас печатаем
    }));
    // Убираем ошибку, когда пользователь начинает исправлять поля
    if (error) setError(null);
  };
  

  // 3. Обработчик нажатия на кнопку
  // 3. Обработчик нажатия на кнопку
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Запрещаем браузеру перезагружать страницу
    
    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
      
      if (formData.password && formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      // Используем const, как просит линтер, и проверяем заглавную букву одной регуляркой
      const passwordText = formData.password || "";
      const hasCapitalLetter = /[A-Z]/.test(passwordText);

      if (!hasCapitalLetter) {
        setError("The password must contain at least 1 capital letter.");
        return; 
      }
      
      // Описываем функцию проверки латиницы
      const checkLatin = (text: string): boolean => {
        return /^[A-Za-z0-9.,!?]*$/.test(text);
      };

      // Пароль только из латиницы, цифр и символов
      const isValid = checkLatin(passwordText);
      if (!isValid) {
        setError("Password must contain only Latin characters, numbers and symbols.");
        return;
      }

      onNext();
     
    } catch (error) {
      console.log(error);
    }
  };

  
   
  

  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 h-full">
      <h1 className="font-inder text-3xl text-white font-bold tracking-tight">Create Account</h1>
      <p className="text-purple-400/80 text-sm mt-2 mb-8"></p>
      
      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        {/* Поле Paswword */}
        <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Password</label>
        <input 
          name="password"           
          type="password" 
          placeholder="Create a strong password"
          autoComplete="new-password" 
          value={formData.password} 
          onChange={handleChange}
          required 
          className="p-4 mb-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
        />

        {/* Поле Confirm password */}
        <label className="mb-2 text-white/50 text-xs uppercase tracking-widest ml-1">Confirm Password</label>
        <input 
          name="confirmPassword"       
          type="password" 
          placeholder="Repeat your password" 
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required 
          maxLength={20}
          className="p-4 mb-10 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 focus:bg-purple-500/5 transition-all"
        />
        {/* 1. Если error не равен null, рисуем параграф */}
        {error && (
          <p className="text-red-500 text-xs mt-2 mb-4 animate-pulse font-medium flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
        {/* Кнопка продолжения */}
        <button 
          type="submit"
          className="bg-[#9343E7] hover:bg-[#a55cf0] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(147,67,231,0.3)]"
        >
          Continue
        </button>
      </form>

      {/* Маленький футер формы */}
      <div className="mt-8 flex items-center gap-4 w-full">
        <div className="h-[1px] bg-white/10 flex-1"></div>
        <span className="text-white/20 text-xs uppercase italic">GameShop ID</span>
        <div className="h-[1px] bg-white/10 flex-1"></div>
      </div>
    </div>
  );
}