'use client'
import { signOut } from "next-auth/react"
import React, { useState } from 'react'
import Image from 'next/image'
import Link from "next/link";
import { usePathname } from 'next/navigation' 
import BurgerMenu from '../icons/burgerMenu.svg';
import ShopIcon from '../icons/store.svg'
import HomeIcon from '../icons/house.svg'
import { ShoppingCart, ChevronLeft, Wallet, Library, Heart, LogOut, CircleUser } from "lucide-react"

export default function TabBar({ 
  initialBalance = "0.00", 
  initialCartCount = 0 
}: { 
  initialBalance?: string, 
  initialCartCount?: number 
}) {
    
    const pathname = usePathname();
    const [isBurger, setIsBurger] = useState<boolean>(false);

    const getMenuLinkClass = (href: string) => {
        const isActive = pathname === href;
        const baseClass = "relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ease-out group overflow-hidden pl-4";
        return `${baseClass} ${isActive ? "bg-gradient-to-r from-purple-500/20 to-transparent text-purple-200 border-l-4 border-purple-500 rounded-l-none font-semibold shadow-[inset_10px_0_15px_-10px_rgba(168,85,247,0.3)]" : "text-gray-400 hover:text-gray-100 hover:bg-white/5 active:scale-[0.98]"}`;
    };

    const getTabClass = (href: string) => {
        const isActive = pathname === href;
        return `relative p-3 rounded-xl transition-all duration-300 ease-out flex flex-col justify-center items-center gap-1 ${isActive ? "text-purple-400 -translate-y-1 bg-purple-500/10" : "text-gray-400 hover:text-gray-200 active:scale-95"}`;
    };

    const handleClick = () => setIsBurger(!isBurger);

    return (
        <>
            {/* Мобильное меню */}
            <div className={`fixed top-0 left-0 w-full h-[calc(100vh-3.5rem)] bg-[#1a0f2e] z-50 transition-all duration-300 ease-in-out overflow-y-auto ${isBurger ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                {isBurger && (
                    <button className='absolute top-6 left-4 p-2 active:scale-95 transition-transform' onClick={handleClick}>
                        <ChevronLeft size={32} className="text-gray-300 hover:text-white" />
                    </button>
                )}
                <div className='w-full h-24 bg-[#130a22] flex justify-center items-center border-b border-white/5'>
                    <h1 className='text-2xl font-semibold text-gray-200 tracking-wide'>Menu</h1>
                </div>
                
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex justify-between items-center bg-[#130a22] p-4 rounded-xl border border-white/5">
                        <Link href="/account/transctions" className="flex items-center gap-3" onClick={handleClick}>
                            <Wallet className="text-purple-400 w-5 h-5" />
                            <span className="text-base font-medium text-gray-300">Wallet</span>
                        </Link>
                        <span className="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-lg border border-emerald-500/20">
                            {initialBalance} €
                        </span>
                    </div>
                    <hr className="border-white/5" />
                    <Link href="/account/profile" className={getMenuLinkClass("/account/profile")} onClick={handleClick}><CircleUser className="w-5 h-5" /><span>Account</span></Link>
                    <Link href="/library" className={getMenuLinkClass("/library")} onClick={handleClick}><Library className="w-5 h-5" /><span>Library</span></Link>
                    <Link href="/wishlist" className={getMenuLinkClass("/wishlist")} onClick={handleClick}><Heart className="w-5 h-5" /><span>Wishlist</span></Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-4 p-3 pl-4 rounded-xl text-rose-400 hover:bg-rose-500/10"><LogOut className="w-5 h-5" /><span>Sign Out</span></button>
                </div>
            </div>

            {/* Нижняя панель */}
            <div className='fixed bottom-0 left-0 w-full bg-[#130a22]/95 backdrop-blur-md h-16 flex justify-around items-center md:hidden z-[60] border-t border-white/5'>
                <Link href="/" className={getTabClass("/")}><Image src={HomeIcon} alt="home" width={24} height={24} className="w-6 h-6 opacity-50" /></Link>
                <Link href="/store" className={getTabClass("/store")}><Image src={ShopIcon} alt="store" width={24} height={24} className="w-6 h-6 opacity-50" /></Link>
                <Link href="/cart" className={getTabClass("/cart")} aria-label="cart">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                    {initialCartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[11px] font-bold min-w-[18px] h-[18px] px-1 flex justify-center items-center rounded-full border border-[#130a22]">
                            {initialCartCount}
                        </span>
                    )}
                </Link>
                <button onClick={handleClick} className="p-3"><Image src={BurgerMenu} alt="menu" width={24} height={24} className="w-6 h-6" /></button>
            </div>
        </>
    )
}