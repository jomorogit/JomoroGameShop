'use client'
import React from 'react';
import Link from 'next/link';
import { OnlytoggleWishList } from '../action/wishList';
import AddToCartButton from '../ui/AddToCartButton';
import { generateGameHref } from '@/app/utils/formatters';
import Image from 'next/image';

export interface GameCardProps {
  id: number; 
  title: string;
  price: number;
  release_date?: string | null;
  image: string;
  order: number;
  added_at: string;
  rating_summary: number;
  gengres: {
    genre: {
      name: string;
    };
  }[];
  initialIsInCart: boolean;
}

function RatingConverter(rating: number) {
    let converted = "";
    if (rating === 0) {
        return <p className='text-xs lg:text-[18px] text-gray-400'>No ratings yet</p>;
    }

    if (rating <= 2) {
       converted = "VERY NEGATIVE";
       return <p className='text-red-500 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
    else if (rating <= 4 && rating > 2) {
        converted = "MOSTLY NEGATIVE";
        return <p className='text-orange-500 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
    else if (rating <= 6.9 && rating > 4) {
        converted = "MIXED";
        return <p className='text-yellow-500 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
    else if (rating <= 7.9 && rating > 6.9) {
        converted = "MOSTLY POSITIVE";
        return <p className='text-blue-200 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
    else if (rating <= 9.4 && rating > 7.9) {
        converted = "VERY POSITIVE";
        return <p className='text-blue-300 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
    else if (rating <= 10 && rating > 9.4) {
        converted = "MASTERPIECE";
        return <p className='text-blue-400 text-xs lg:text-[18px] font-bold'>{converted}</p>;
    }
}

export default function WishListCardCreator({ 
  id, title, price, image, gengres, rating_summary, release_date, added_at, order, initialIsInCart 
}: GameCardProps) {
   const finalHref = generateGameHref(id, title);

   const handleDeleteFromWishList = async () => {
    try {
      await OnlytoggleWishList(id);
    } catch (err) {
      console.error("Failed to remove:", err);
    }
  };
          
    return (
        <div className='w-full flex flex-col sm:flex-row bg-[#23122E] h-auto items-start sm:items-stretch p-4 mb-6 rounded-xl border border-white/5 shadow-md relative gap-4'>
            
            {/* Порядковый номер */}
            <div className='absolute top-3 left-4 sm:relative sm:top-auto sm:left-auto flex items-center justify-center sm:px-2 self-start sm:self-center bg-black/30 sm:bg-transparent rounded-md w-7 h-7 sm:w-auto sm:h-auto z-10'>
                <p className='text-sm sm:text-xl font-medium text-gray-400'>{order}</p>
            </div>
            
            {/* Обложка игры */}
            <div className='w-full sm:w-auto flex justify-center sm:block pt-6 sm:pt-0 sm:pl-4 sm:border-l border-gray-700/50 flex-shrink-0'>
               <Link href={finalHref} className="relative w-full max-w-[240px] aspect-[3/4] sm:w-[150px] md:w-[180px] lg:w-[200px] rounded-lg overflow-hidden block group shadow-lg">
                   <Image
                        src={image || 'https://res.cloudinary.com/dla93ueam/image/upload/v1778947999/Gemini_Generated_Image_w233n0w233n0w233_qgcacd.png'}
                        alt="game cover"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 180px, 200px"
                        quality={85}  
                    />
                </Link> 
            </div>
            
            {/* Правая часть с основным контентом */}
            <div className='flex flex-col md:flex-row justify-between w-full gap-4 pt-2 sm:pt-0'>
                
                {/* Левая колонка инфы: Название, Жанры, Рейтинг, Релиз */}
                <div className='flex flex-col flex-1 min-w-0'>
                    <h1 className='text-xl md:text-2xl text-white font-semibold tracking-wide hover:text-purple-300 transition-colors break-words'>
                        <Link href={finalHref}>{title}</Link>
                    </h1>

                    {/* Вывод жанров */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {gengres.map(gg => (
                        <span key={gg.genre.name} className="bg-white/5 px-2 lg:px-5 py-2 rounded-md text-xs text-gray-300 border border-white/5">
                          {gg.genre.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Характеристики игры */}
                    <div className='mt-4 space-y-2 max-w-xs'>
                        {/* Рейтинг */}
                        <div className='flex justify-between items-center gap-4 text-xs lg:text-xl'>
                             <span className='text-gray-500 tracking-wider font-medium uppercase'>Reviews</span>
                             {RatingConverter(rating_summary)}
                        </div>

                        {/* Дата релиза */}
                        <div className='flex justify-between items-center gap-4 text-xs lg:text-xl'> 
                            <span className='text-gray-500 tracking-wider font-medium uppercase'>Release Date</span>
                            <span className='text-gray-300 font-medium'>{release_date || 'TBA'}</span>
                        </div>
                    </div>
                </div>

                {/* Правая колонка инфы: Дата добавления, Удаление, Кнопка Корзины */}
                <div className='flex flex-col justify-between items-stretch md:items-end gap-4 min-w-[160px] border-t md:border-t-0 border-white/5 pt-4 md:pt-0'>
                    <div className='text-left md:text-right w-full'>
                        <p className='text-xs lg:text-xl text-gray-400'>Added: <span className='text-gray-300'>{added_at}</span></p>
                        <button 
                            onClick={handleDeleteFromWishList} 
                            className='w-full md:w-auto bg-white/5 hover:bg-rose-950/40 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 px-3 py-3 lg:px-8 lg:text-xl lg:py-4 cursor-pointer rounded-lg mt-2 text-xs font-medium text-gray-300 transition-all block md:ml-auto'
                        >
                            Remove
                        </button>
                    </div>
                    
                    {/* Кнопка добавления в корзину */}
                    <div className='w-full md:w-auto mt-auto'>
                        <AddToCartButton gameID={id} price={price} initialIsOnCart={initialIsInCart}/>
                    </div>
                </div>

            </div>
        </div>
    );
}