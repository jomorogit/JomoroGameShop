"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Settings, ChevronDown, ChevronUp } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    // Этот код выполняется только на клиенте
    const consent = localStorage.getItem("cookie_consent");

    const timer = window.setTimeout(() => {
      if (!consent) {
        setShowBanner(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Если баннер не нужно показывать, возвращаем null (в том числе при SSR)
  if (!showBanner) return null;

  // Функция сохранения при нажатии "Accept All"
  const handleAcceptAll = () => {
    localStorage.setItem("cookie_consent", "granted");
    setShowBanner(false);
    
    // TODO: Здесь лучше вызвать функцию инициализации вашей аналитики,
    // например: initializeGoogleAnalytics();
  };

  // Функция сохранения при нажатии "Decline"
  const handleDeclineAll = () => {
    localStorage.setItem("cookie_consent", "denied");
    setShowBanner(false);
  };

  // Функция сохранения только выбранных пользователем настроек
  const handleSaveCustom = () => {
    const status = analyticsAllowed ? "granted" : "denied";
    localStorage.setItem("cookie_consent", status);
    setShowBanner(false);
    
    if (analyticsAllowed) {
      // TODO: Инициализировать аналитику здесь, если она разрешена
      // например: initializeGoogleAnalytics();
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-sm w-full bg-[#120F1D] border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col gap-4 transition-all duration-300 select-none">
      {/* Главный текстовый блок */}
      <div>
        <h3 className="text-white font-bold text-base flex items-center gap-2">
          Cookie Consent 🍪
        </h3>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">
          We use cookies to enhance your gaming experience. You can manage your preferences or accept all. Read our{" "}
          <Link href="/privacy" className="text-purple-400 hover:underline">
            Privacy Policy
          </Link>.
        </p>
      </div>

      {/* Кнопка открытия/закрытия расширенных настроек */}
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-medium transition w-fit"
      >
        <Settings className="w-3.5 h-3.5" />
        Manage Preferences
        {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Панель настроек (появляется плавно при клике) */}
      {showSettings && (
        <div className="flex flex-col gap-3 border-t border-white/5 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* 1. Обязательные куки (Всегда включены) */}
          <div className="flex items-start justify-between gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div>
              <h4 className="text-white text-xs font-semibold">Strictly Necessary</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Required for auth sessions and shopping cart functionality.</p>
            </div>
            <div className="w-5 h-5 bg-[#9343E7]/20 border border-[#9343E7]/40 rounded-md flex items-center justify-center opacity-60 cursor-not-allowed">
              <Check className="w-3.5 h-3.5 text-[#9343E7]" strokeWidth={3.5} />
            </div>
          </div>

          {/* 2. Аналитические куки (Управляются пользователем) */}
          <label className="flex items-start justify-between gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.08] transition">
            <div>
              <h4 className="text-white text-xs font-semibold">Performance & Analytics</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Helps us track site traffic and conversion using Google Analytics.</p>
            </div>
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 bg-white/5 border border-white/10 rounded-md transition-all flex items-center justify-center peer-checked:bg-[#9343E7] peer-checked:border-[#9343E7]">
                <Check 
                  className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
                    analyticsAllowed ? "scale-100" : "scale-0"
                  }`} 
                  strokeWidth={3.5}
                />
              </div>
            </div>
          </label>

          {/* Кнопка сохранения кастомных настроек */}
          <button
            onClick={handleSaveCustom}
            className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition mt-1"
          >
            Save My Choices
          </button>
        </div>
      )}

      {/* Основной блок кнопок управления */}
      {!showSettings && (
        <div className="flex gap-3 justify-end w-full">
          <button 
            onClick={handleDeclineAll} 
            className="flex-1 py-2 text-xs font-medium text-gray-400 hover:text-white bg-white/5 border border-white/5 rounded-xl transition hover:bg-white/10"
          >
            Decline
          </button>
          <button 
            onClick={handleAcceptAll} 
            className="flex-1 py-2 bg-[#9343E7] hover:bg-[#a55cf0] text-white text-xs font-semibold rounded-xl transition shadow-[0_5px_15px_rgba(147,67,231,0.2)]"
          >
            Accept All
          </button>
        </div>
      )}
    </div>
  );
}