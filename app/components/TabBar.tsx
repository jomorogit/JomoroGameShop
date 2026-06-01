'use client'
import { useSession, signOut } from "next-auth/react"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from "next/link";
import { usePathname } from 'next/navigation' 
import BurgerMenu from '../icons/burgerMenu.svg';
import ShopIcon from '../icons/store.svg'
import HomeIcon from '../icons/house.svg'
import { ShoppingCart, ChevronLeft, Wallet, Library, Heart, Newspaper, Users, User, Settings, LogOut, CircleUser } from "lucide-react"

export default function TabBar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isBurger, setIsBurger] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>("0.00");
    const [cart, setCart] = useState<number>(0);

    const getMenuLinkClass = (href: string) => {
        const isActive = pathname === href;
        const baseClass = "relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ease-out group overflow-hidden pl-4";
        const activeClass = "bg-gradient-to-r from-purple-500/20 to-transparent text-purple-200 border-l-4 border-purple-500 rounded-l-none font-semibold shadow-[inset_10px_0_15px_-10px_rgba(168,85,247,0.3)]";
        const inactiveClass = "text-gray-400 hover:text-gray-100 hover:bg-white/5 active:scale-[0.98]";
        
        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    const getTabClass = (href: string) => {
        const isActive = pathname === href;
        const baseClass = "relative p-3 rounded-xl transition-all duration-300 ease-out flex flex-col justify-center items-center gap-1";
        const activeClass = "text-purple-400 -translate-y-1 bg-purple-500/10";
        const inactiveClass = "text-gray-400 hover:text-gray-200 active:scale-95";
        
        return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
    };

    const handleClick = () => setIsBurger(!isBurger);

    // 💰 Загрузка баланса
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch('/api/balance');
                if (response.ok) {
                    const data = await response.json();
                    setBalance(Number(data.balance).toFixed(2));
                }
            } catch (error) {
                console.error("Failed to load balance:", error);
            }
        };

        if (session?.user) {
            fetchBalance();
        }
    }, [session]);

    // Живая загрузка количества товаров в корзине
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch('/api/cart');
                if (response.ok) {
                    const data = await response.json();
                    const count = Array.isArray(data) ? data.length : (data.count ?? data.quantity ?? data);
                    setCart(Number(count) || 0);
                }
            } catch (error) {
                console.error("Failed to load cart:", error);
            }
        };

        if (session?.user) {
            fetchCartItems();
        }

        // Слушаем событие добавления/удаления
        window.addEventListener('cartUpdated', fetchCartItems);

        // Очищаем слушатель при размонтировании
        return () => {
            window.removeEventListener('cartUpdated', fetchCartItems);
        };
    }, [session, pathname]);
    
    return (
        <>
            {/* 1. БОКОВОЕ МЕНЮ (МОБИЛЬНОЕ) */}
            <div className={`
                fixed top-0 left-0 w-full h-[calc(100vh-3.5rem)] bg-[#1a0f2e] z-50 transition-all duration-300 ease-in-out overflow-y-auto
                ${isBurger ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
            `}>
                {isBurger && (
                    <button className='absolute top-6 left-4 p-2 active:scale-95 transition-transform' onClick={handleClick}>
                        <ChevronLeft size={32} className="text-gray-300 hover:text-white" />
                    </button>
                )}
                
                <div className='w-full h-24 bg-[#130a22] flex justify-center items-center border-b border-white/5'>
                    <h1 className='text-2xl font-semibold text-gray-200 tracking-wide'>Menu</h1>
                </div>
                
                <div className="flex flex-col gap-4 p-5">
                    <div className="flex justify-between items-center bg-[#130a22] p-4 rounded-xl border border-white/5 transition-all active:scale-[0.99]">
                        <Link href="/account/transctions" className="flex items-center gap-3" onClick={handleClick}>
                            <Wallet className="text-purple-400 w-5 h-5" />
                            <span className="text-base font-medium text-gray-300">Wallet / Replenishment</span>
                        </Link>
                        <Link href="/account/addmoney" onClick={handleClick}>
                        <span className="text-lg font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-lg border border-emerald-500/20">
                            {balance} €
                        </span>
                        </Link>
                    </div>

                    <hr className="border-white/5 my-1" />

                    <div className="flex flex-col gap-2">
                        <Link href="/account/profile" className={getMenuLinkClass("/account/profile")} onClick={handleClick}>
                            <CircleUser className="w-5 h-5 transition-colors duration-300" />
                            <span>Account</span>
                        </Link>

                        <Link href="/library" className={getMenuLinkClass("/library")} onClick={handleClick}>
                            <Library className="w-5 h-5 transition-colors duration-300" />
                            <span>Library</span>
                        </Link>

                        <Link href="/wishlist" className={getMenuLinkClass("/wishlist")} onClick={handleClick}>
                            <Heart className="w-5 h-5 transition-colors duration-300" />
                            <span>Wishlist</span>
                        </Link>

                        {/* На данный момент нету */}
                        {/* <Link href="/news" className={getMenuLinkClass("/news")} onClick={handleClick}>
                            <Newspaper className="w-5 h-5 transition-colors duration-300" />
                            <span>News</span>
                        </Link>

                        <Link href="/community" className={getMenuLinkClass("/community")} onClick={handleClick}>
                            <Users className="w-5 h-5 transition-colors duration-300" />
                            <span>Community</span>
                        </Link> */}
                    </div>

                    <hr className="border-white/5 my-1" />

                    <div className="flex flex-col gap-2">
                        {/* на данный момент нету */}
                        {/* <Link href="/account/settings" className={getMenuLinkClass("/account/settings")} onClick={handleClick}>
                            <Settings className="w-5 h-5 transition-colors duration-300" />
                            <span>Settings</span>
                        </Link> */}

                        {session?.user?.email && (
                            <Link 
                                href="#" 
                                className="flex items-center gap-4 p-3 pl-4 rounded-xl text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-200 mt-2 font-medium" 
                                onClick={() => {
                                    signOut({ callbackUrl: "/" }); 
                                    handleClick();                
                                }}
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. НИЖНЯЯ ПАНЕЛЬ 📱 */}
            <div className='fixed bottom-0 left-0 w-full bg-[#130a22]/95 backdrop-blur-md h-16 flex justify-around items-center md:hidden z-[60] border-t border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] px-2'>
                
                <Link href="/" className={getTabClass("/")}>
                    <Image src={HomeIcon} alt="home" width={24} height={24} className={`w-6 h-6 transition-all duration-300 ${pathname === '/' ? 'brightness-125' : 'opacity-50 grayscale'}`} />
                    {pathname === '/' && <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full animate-pulse" />}
                </Link>
                
                <Link href="/store" className={getTabClass("/store")}>
                    <Image src={ShopIcon} alt="store" width={24} height={24} className={`w-6 h-6 transition-all duration-300 ${pathname === '/store' ? 'brightness-125' : 'opacity-50 grayscale'}`} />
                    {pathname === '/store' && <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full animate-pulse" />}
                </Link>
                
                {/* Корзина со счётчиком */}
                <Link href="/cart" className={getTabClass("/cart")}
                aria-label={`Go to the cart tab`}>
                    <ShoppingCart className={`w-6 h-6 transition-all duration-300 ${pathname === '/cart' ? 'text-purple-400' : 'text-gray-400 opacity-60'}`} />
                    {pathname === '/cart' && <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full animate-pulse" />}

                    {cart > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 
                                        bg-rose-600 text-white 
                                        text-[11px] font-bold 
                                        min-w-[18px] h-[18px] px-1
                                        flex justify-center items-center 
                                        rounded-full 
                                        border border-[#130a22]
                                        shadow-md transition-all duration-300">
                            {cart}
                        </span>
                    )}
                </Link>
                
                <button 
                    onClick={handleClick} 
                    className={`relative p-3 rounded-xl transition-all duration-300 ease-out flex justify-center items-center ${isBurger ? 'text-purple-400 -translate-y-1 bg-purple-500/10' : 'text-gray-400 opacity-60'}`}
                >
                    <Image src={BurgerMenu} alt="menu" width={24} height={24} className={`w-6 h-6 transition-all duration-300 ${isBurger ? 'brightness-125' : 'grayscale'}`} />
                    {isBurger && <span className="absolute bottom-1 w-1 h-1 bg-purple-500 rounded-full" />}
                </button>
            </div>
        </>
    )
}