"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); 

  const isLoginActive = pathname === "/register/login";
  const isSignUpActive = pathname === "/register/sign-up";
  const activeStyles = "bg-[#9343E7] text-white font-semibold shadow-[0_0_20px_rgba(147,67,231,0.3)]";
  const inactiveStyles = "bg-[#23122E] border border-purple-500/10 text-white/60 hover:bg-[#321b40] hover:text-white";

  return (
    <div className="mt-10 mb-10 w-full flex flex-col items-center justify-center px-4 min-h-[calc(100vh-120px)]">
      
      {/* Контейнер для кнопок */}
      <div className="w-full max-w-md flex justify-between items-center gap-4 mb-6">
        
        {/* Кнопка Log In */}
        <Link
          href="/register/login" 
          className={`font-inder text-lg md:text-xl py-3.5 rounded-2xl flex-1 text-center transition-all active:scale-[0.98] ${
            isLoginActive ? activeStyles : inactiveStyles
          }`}
        >
          Log In
        </Link>
        
        {/* Кнопка Sign Up */}
        <Link 
          href="/register/sign-up" 
          className={`font-inder text-lg md:text-xl py-3.5 rounded-2xl flex-1 text-center transition-all active:scale-[0.98] ${
            isSignUpActive ? activeStyles : inactiveStyles
          }`}
        >
          Sign Up
        </Link>
        
      </div>

      {/* Контейнер для динамических страниц (Login / SignUp) */}
      <main className="w-full max-w-md flex flex-col justify-center rounded-2xl">
        {children}
      </main>

    </div>
  );
}