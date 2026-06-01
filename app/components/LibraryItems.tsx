'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, generateGameHref } from '@/app/utils/formatters';
import { Star } from "lucide-react"
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

export default function LibraryItems({ 
  id, 
  title, 
  price, 
  image, 
  rating_summary, 
  initialIsInCart, 
  initialIsWished,
  initialIsLibrary,
}: GameCardProps) {
 
   const formattedPrice = formatPrice(price);
   const finalHref = generateGameHref(id, title);
   const rating = (Number(rating_summary || 0) / 2).toFixed(1);
   
   const [isOnLibrary, setIsOnLibrary] = useState(initialIsLibrary);
    return (
        <Link 
          href={finalHref} 
          className="w-75 mb-10 block rounded-t-lg hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(251,0,255,0.5)] transition-shadow duration-300"
        >
            {/* Блок с картинкой снова дома! 🏠 🖼️ */}
            <div className="relative h-70 w-full overflow-hidden rounded-t-lg"> 
                <Image
                    src={image} 
                    alt={title || "game cover"}
                    fill 
                    priority={true} 
                    className="object-cover transition-transform duration-300 hover:scale-105" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                />
            </div>
                        
            <div className="p-3 bg-[#251642] rounded-b-lg text-white border-t border-white/5 h-auto">
                <p className="font-bold truncate text-xl mb-1" title={title}>{title}</p>
                
                {/* Секция: цена и оценка */}
                <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                        <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <p className="font-medium text-xl ml-1">{rating}</p>
                    </div>
                    
                    <p className="font-medium text-xl">{formattedPrice}</p> 
                </div>
                
                {/* Секция кнопок */}
                <div className='pl-2 pr-2 mr-2 mt-2 flex justify-between items-center'>
                    {isOnLibrary ? (
                        
                           <Link 
                                href="/library" 
                                className="relative z-20 block w-full bg-green-600 flex justify-center rounded-xl p-3"
                            >
                                In your library
                            </Link>
                       
                    ) : (
                        <>
                            <div className='w-full'>
                                <AddToCartButtonMainPage gameID={id} price={price} initialIsOnCart={initialIsInCart}/>
                            </div>
                            
                            <AddToWishListMainPage gameID={id} title={title} initialIsWished={initialIsWished}/>
                        </>
                    )}
                    
                </div>
            </div>
            
        </Link>
    );
}