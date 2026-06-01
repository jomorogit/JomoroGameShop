'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice, generateGameHref } from '@/app/utils/formatters';
import { Star } from "lucide-react";
import AddToCartButtonMainPage from '../ui/AddToCartButtonMainPage';
import AddToWishListMainPage from '../ui/AddToWishListButtonMainPage';

export interface GameCardProps {
  id: number; 
  title: string;
  price: number;
  image: string;
  rating_summary?: number;
  initialIsInCart: boolean; 
  initialIsWished: boolean; 
  initialIsLibrary: boolean;
}

export default function MainPageGameCreator({ 
  id, 
  title, 
  price, 
  image, 
  rating_summary, 
  initialIsInCart, 
  initialIsWished,
  initialIsLibrary,
}: GameCardProps) {
 
   const router = useRouter(); 
   const formattedPrice = formatPrice(price);
   const finalHref = generateGameHref(id, title);
   const rating = (Number(rating_summary || 0) / 2).toFixed(1);
   
   const [isOnLibrary, setIsOnLibrary] = useState(initialIsLibrary);

   return (
        <Link 
          href={finalHref} 
          className="w-full mb-4 md:mb-10 block rounded-t-lg hover:scale-103 md:hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(251,0,255,0.5)] transition-shadow duration-300"
        >
    
            <div className="relative h-40 md:h-70 w-full overflow-hidden rounded-t-lg"> 
                <Image
                    src={image} 
                    alt={title || "game cover"}
                    fill 
                    // priority={true} 
                    className="object-cover transition-transform duration-300 hover:scale-105" 
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" 
                />
            </div>
                        
            {/* Нижняя контентная часть карточки */}
            <div className="p-2 md:p-3 bg-[#251642] rounded-b-lg text-white border-t border-white/5 h-auto flex flex-col justify-between">
                
                {/* Название игры: text-base на смартфонах, text-xl на мониторах */}
                <p className="font-bold truncate text-base md:text-xl mb-1" title={title}>{title}</p>
                
                {/* Секция: цена и оценка */}
                <div className='flex justify-between items-center mt-1'>
                    <div className='flex items-center'>
                        <Star className="text-yellow-400 fill-yellow-400 w-4 h-4 md:w-5 md:h-5" />
                        <p className="font-medium text-sm md:text-xl ml-1">{rating}</p>
                    </div>
                    
                    <p className="font-medium text-sm md:text-xl">{formattedPrice}</p> 
                </div>
                
                {/* Секция кнопок */}
                {/* Добавили gap-2 и уменьшили паддинги на мобилках, чтобы кнопки не вылезали за рамки */}
                <div className='mt-3 flex justify-between items-center gap-2'>
                    {isOnLibrary ? (
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();  
                                e.stopPropagation(); 
                                router.push("/library");
                            }}
                            className="relative font-bold z-20 block w-full bg-green-600 flex justify-center items-center text-[12px] rounded-xl p-2 md:p-3 text-xs md:text-sm text-white font-medium hover:bg-green-700 transition-colors text-center min-h-[42px]"
                        >
                            In your library
                        </button>
                    ) : (
                        <>
                            {/* Оберткам кнопок добавляем flex-управление для правильного сжатия на смартфонах */}

                            <div className='flex items-center justify-around w-full'>
                                <div className='flex-1 min-w-0' onClick={(e) => e.stopPropagation()}>
                                    <AddToCartButtonMainPage gameID={id} price={price} initialIsOnCart={initialIsInCart}/>
                                </div>
                                
                                <div className='flex-shrink-0 ml-1' onClick={(e) => e.stopPropagation()}>
                                    <AddToWishListMainPage gameID={id} title={title} initialIsWished={initialIsWished}/>
                                </div>
                            </div>
                          
                        </>
                    )}
                </div>
            </div>
        </Link>
   );
}