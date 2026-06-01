'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation' 

export default function ThisGameLinks({ id, title }: { id: number, title: string }) {
    const pathname = usePathname();
    
    const createSlug = (str: string) => {
        return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    };

    const gamePath = `/${id}-${createSlug(title)}`;

    // Логика определения активной вкладки 
    // 1. Если путь в точности равен корню игры — это Overview
    const isOverview = pathname === gamePath; 
    // 2. Если в пути есть "system-request" — это вкладка 2
    const isSystem = pathname.includes('/system-request');
    // 3. Если в пути есть "reviews" — это вкладка 3
    const isReviews = pathname.includes('/reviews');

    return (
        <div>
            {/* Ссылки */}
            <div className="flex justify-between">
                <Link href={gamePath} 
                    className={`font-inder text-xl transition-all duration-500 ${isOverview ? 'text-[#8551a5]' : 'text-white'}`}>
                    Overview
                </Link>

                <Link href={`${gamePath}/system-request/windows`} 
                    className={`font-inder text-xl transition-all duration-500 ${isSystem ? 'text-[#8551a5]' : 'text-white'}`}>
                    System Request
                </Link>

                <Link href={`${gamePath}/reviews`} 
                    className={`font-inder text-xl transition-all duration-500 ${isReviews ? 'text-[#8551a5]' : 'text-white'}`}>
                    Reviews
                </Link>
            </div>
            
            {/* Фиолетовая полоска (Bar) */}
            <div className="w-full h-4 flex justify-between bg-[#656565] mt-2 rounded-xl overflow-hidden">
                {/* Секция 1: Overview */}
                <div className={`w-[15%] rounded-xl h-full transition-all duration-500 ${isOverview ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>
                
                {/* Секция 2: System Request */}
                <div className={`w-[30%] rounded-xl h-full transition-all duration-500 ${isSystem ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>
                
                {/* Секция 3: Reviews */}
                <div className={`w-[15%] rounded-xl h-full transition-all duration-500 ${isReviews ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>
            </div>
        </div>
    )
}