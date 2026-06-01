"use client";
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { usePathname } from 'next/navigation' 

export default function ProfileMenu() {
  const session = useSession();
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const baseClass = "rounded-xl p-2 flex justify-start pl-4 text-xl transition-all duration-200";
    const activeClass = "bg-[#3D234D] text-white font-medium shadow-md shadow-[#1a0c24]";
    const inactiveClass = "text-gray-400 hover:bg-[#3D234D]/30 hover:text-white";

    return `${baseClass} ${pathname === href ? activeClass : inactiveClass}`;
  };

  return (
    <div className='hidden md:flex flex flex-col gap-3 mr-10 bg-[#23122E] p-5 h-auto rounded-2xl w-64 border border-[#3d276b]/30 text-white'>
      
      {/*Админ-панель */}
      {session?.data?.user?.role === "admin" && (
        <Link 
          href="/account/admin" 
          className={`text-yellow-400 font-bold border border-yellow-500/30 rounded-xl p-2 flex justify-start pl-4 text-xl transition-all
            ${pathname === "/account/admin" ? "bg-yellow-500/10 border-yellow-400" : "hover:bg-yellow-500/5"}`}
        >
          Admin Panel
        </Link>
      )}
        
      {/*Личные данные */}
      <Link href="/account/profile" className={getLinkClass("/account/profile")}>
        Personal
      </Link>

      {/*Кошелек */}
      <Link href="/account/transctions" className={getLinkClass("/account/transctions")}>
        Transactions
      </Link>

      
      {/* Настройки на данный момент нету
      <Link href="/account/settings" className={getLinkClass("/account/settings")}>
        Settings
      </Link> */}

      {/*Разделитель */}
      <hr className="border-[#3D234D]/50 my-1" />

      {/*Выход */}
      <Link 
        href="#" 
        className='rounded-xl p-2 flex justify-start pl-4 text-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium' 
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign Out
      </Link>

    </div>
  )
}