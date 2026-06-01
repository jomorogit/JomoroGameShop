'use client'; 

import Image from 'next/image';
import Link from "next/link";
import { usePathname } from 'next/navigation'; 
import { useState } from 'react';

import Icon from '../icons/Icon.svg';
import Home from '../icons/house.svg';
import Store from '../icons/store.svg';
import Library from '../icons/library.svg';
import WishList from '../icons/Star.svg';
import News from '../icons/newspaper.svg';
import Community from '../icons/users.svg';
import BurgerMenu from '../icons/burgerMenu.svg';

export default function Sidebar() {
    const pathname = usePathname(); 
    
    // Состояние открытия для планшетов (768px - 1024px) и ПК
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const links = [
        { href: '/', label: 'Home', icon: Home, size: 35 },
        { href: '/store', label: 'Store', icon: Store, size: 35, marginBottom: 'mb-10' },
        { href: '/library', label: 'Library', icon: Library, size: 35 },
        { href: '/wishlist', label: 'WishList', icon: WishList, size: 35, marginBottom: 'mb-10' },
        // на данный момент нету
        // { href: '/news', label: 'News', icon: News, size: 30 },
        // { href: '/community', label: 'Community', icon: Community, size: 40 },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    
    const closeMenu = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    const navLinkStyles = "flex items-center w-full h-16 rounded-tr-2xl rounded-br-2xl pl-4 transition-all duration-200 cursor-pointer group";

    return (
        <>
            {/* 1. КНОПКА БУРГЕРА: Появляется СТРОГО от 768px до 1024px */}
            {!isOpen && (
                <button 
                    onClick={toggleSidebar}
                    className="fixed top-8 left-10 z-[999] p-2.5 bg-[#9343E7] rounded-xl shadow-[0_0_20px_rgba(147,67,231,0.5)] hidden md:flex lg:hidden cursor-pointer hover:bg-[#a55cf0] transition-all active:scale-95 items-center justify-center animate-in fade-in zoom-in duration-200"
                >
                    <Image src={BurgerMenu} alt="menu" width={50} height={50} className="w-11 h-11" />
                </button>
            )} 

            {/* БЕКДРОП: Затемнение бэкграунда, на планшетах скрываем, так как меню на весь экран */}
            {isOpen && (
                <div 
                    onClick={closeMenu}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[98] hidden lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* САЙДБАР */}
            <div 
                data-sidebar-open={isOpen}
                className={`
                    h-screen bg-[#23122E] shadow-lg top-0 transition-all duration-300 flex-col fixed inset-y-0 left-0 z-[99]
                    
                    /* Меньше 768px (Мобилки): Полностью скрываем всё меню */
                    hidden
                    
                    /* От 768px до 1024px (Планшеты): НА ВЕСЬ ЭКРАН (md:w-full)  */
                    md:flex md:w-full
                    ${isOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
                    
                    /* От 1024px (ПК): Стационарный, меняет ширину (70px <-> 280px) */
                    lg:translate-x-0 
                    ${isOpen ? 'lg:w-[280px]' : 'lg:w-[70px]'}
                `}
            >
                
                {/* ХЕДЕР С ЛОГОТИПОМ И КНОПКАМИ */}
                <div className={`w-full h-30 bg-[#2C1939] rounded-xl shadow-xl flex items-center justify-center lg:justify-start p-4 relative transition-all duration-300 ${isOpen ? 'lg:px-4' : 'lg:px-[15px]'}`}>
                    
                    {/* Крестик закрытия бургера: Смещен чуть правее для удобства на полном экране (left-10) ✕ */}
                    {isOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute left-10 top-1/2 -translate-y-1/2 hidden md:flex lg:hidden bg-[#9343E7] hover:bg-[#a55cf0] text-white text-base font-bold w-12 h-12 rounded-xl shadow-md items-center justify-center transition-all active:scale-95 cursor-pointer z-50"
                        >
                            ✕
                        </button>
                    )}

                    {/* Бургер для ПК: Появляется только на экранах от 1024px */}
                    <button 
                        onClick={toggleSidebar} 
                        className="cursor-pointer hover:opacity-80 transition-opacity hidden lg:flex items-center justify-center min-w-[40px] h-10 flex-shrink-0 mr-4 lg:mr-0"
                    >
                        <Image src={BurgerMenu} alt="menu" width={40} height={40} className="w-10 h-10 flex-shrink-0" />
                    </button>

                    {/* Логотип и текст */}
                    <div className={`
                        items-center gap-3 animate-fadeIn lg:ml-4 
                        hidden
                        md:${isOpen ? 'flex' : 'hidden'}
                        lg:${isOpen ? 'flex' : 'hidden'}
                    `}>
                        <Image src={Icon} alt="icon" width={40} height={40} className="w-10 h-10" />
                        <p className='font-inder text-2xl text-white whitespace-nowrap font-semibold tracking-wide'>Game Store</p>
                    </div>
                </div>

                {/* Список ссылок */}
                <div className="w-full h-full bg-[#23122E] mt-5 flex flex-col gap-2 pr-2 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link 
                                key={link.href}
                                href={link.href} 
                                onClick={closeMenu}
                                className={`
                                    relative group
                                    ${navLinkStyles} 
                                    ${link.marginBottom || ''} 
                                    ${isActive ? 'bg-[#3D234D] shadow-inner' : 'hover:bg-[#2C1939]'}
                                `}
                            >
                                {/* Розовая неоновая полоска */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-15 bg-[#FF007A] rounded-r-full shadow-[0_0_15px_#FF007A]" />
                                )}
                                
                                {/* Иконка (На планшете сместим чуть вправо md:ml-6, чтобы кнопка закрытия её не перекрывала) */}
                                <div className="min-w-[40px] flex justify-center md:ml-6 lg:ml-0">
                                    <Image 
                                        src={link.icon} 
                                        alt={link.label} 
                                        width={link.size} 
                                        height={link.size} 
                                        className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                                    />
                                </div>
                                
                                {/* Текст ссылки */}
                                <span className={`
                                    font-inder text-2xl ml-4 whitespace-nowrap transition-transform duration-200 
                                    group-hover:scale-105 origin-left
                                    ${isActive ? 'text-white' : 'text-gray-400'}
                                    hidden
                                    md:${isOpen ? 'block' : 'hidden'}
                                    lg:${isOpen ? 'block' : 'hidden'}
                                `}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}