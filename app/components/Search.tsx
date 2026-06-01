'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generateGameHref } from '@/app/utils/formatters';
import SeacthImg from '../icons/search.svg';

// Описываем тип того, что вернет API
interface SearchedGame {
  id: number;
  title: string;
  card_img?: string;
  main_img?: string;
}

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchedGame[]>([]);
    const [isLoading, setIsLoading] = useState(false);

  
    useEffect(() => {
        // Если инпут пустой, очищаем результаты и никуда не стучимся
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);

        // Устанавливаем таймер на 400мс. Запрос улетит, только если юзер сделал паузу во вводе
        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Ошибка при поиске:", error);
            } finally {
                setIsLoading(false);
            }
        }, 400); //  Время задержки в миллисекундах

        // Сбрасываем таймер, если пользователь нажал следующую букву до истечения 400мс
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        // min-w-[50%] max-w-[75%]
        <div className="bg-[#23122E] w-[70%] md:w-[46%] lg:w-[40%] h-auto rounded-3xl fixed z-50 top-5 border border-white/10 shadow-2xl overflow-hidden">
            {/* Строка инпута */}
            <div className='h-16 md:h-22  flex items-center justify-between pr-5'>
                <input 
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games..." 
                    className="w-[90%] bg-transparent outline-none p-2 pl-4 xs:p-5 font-inder text-[15px] md:text-xl text-white"
                /> 
                <Image 
                    src={SeacthImg} 
                    alt="icon" 
                    width={45} 
                    height={45} 
                    // Базово (на самых маленьких) делаем h-8 w-8 (32px), а от xs и выше — возвращаем оригинальные 45px
                    className={`w-8 h-8 xs:w-[45px] xs:h-[45px] ${isLoading ? "animate-pulse" : ""}`} 
                    />
            </div>

            {/* Выпадающий блок результатов */}
            {results.length > 0 && (
                <div className="bg-[#1b0d24] border-t border-white/5 max-h-[650px] overflow-y-auto p-2 flex flex-col gap-1">
                    {results.map((game) => (
                        <Link 
                            key={game.id}
                            href={generateGameHref(game.id, game.title)}
                            onClick={() => setSearchQuery('')} // Закрываем поиск при клике на игру
                            className="flex items-center gap-4 p-3 hover:bg-[#341b44] rounded-xl transition-colors group"
                        >
                            {game.card_img && (
                                <div className="relative w-40 h-48 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image 
                                        src={game.card_img || game.main_img || ''} 
                                        alt={game.title || "game cover"} 
                                        fill 
                                        sizes="144px" 
                                        className="object-cover" 
                                    />
                                </div>
                            )}
                            <span className="text-white font-medium text-lg truncate group-hover:text-purple-400 transition-colors">
                                {game.title}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Если ничего не нашли */}
            {searchQuery.trim() !== '' && results.length === 0 && !isLoading && (
                <div className="bg-[#1b0d24] border-t border-white/5 p-5 text-center text-gray-400">
                   No games with this name were found.
                </div>
            )}
        </div>
    );
}