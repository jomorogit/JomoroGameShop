'use client'
import React from 'react'
import CartCardCreator from '@/app/components/CartItem';
import useSWR from 'swr'; 
import CartSkeleton from './CartSkeleton';
import Link from 'next/link';


export interface GameCardProps {
  id: number;
  title: string;
  price: number; // Это то, что ты передаешь в компонент (после Number())
  price_eur?: number | string; // Добавим для проверки в объекте
  release_date?: string | Date | null;
  image: string; // Это то, что ты передаешь в компонент
  card_img?: string | null;
  main_img?: string | null;
  rating_summary: number;
  order?: number;
  added_at?: string;
  // Исправлено: название поля должно совпадать с тем, что в API
  game_genres?: {
    genre: {
      name: string;
    };
  }[];
  // Добавлено поле, которое ты используешь в коде
  wishlist?: { added_at: string | Date }[];
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartList() {
    
    const { data, error, isLoading } = useSWR('/api/cart', fetcher);

   
    if (error) return <div className="text-white">Cart error</div>;
    if (isLoading || !data) {
        return <CartSkeleton />;
    }

    // 2. Теперь, когда мы уверены, что data существует, проверяем длину
    // Если твой API возвращает объект { games: [...] }, то проверять нужно data.games.length
    if (data.length === 0) {
        return (
            <div className="p-10 text-white text-center text-3xl mt-50 flex flex-col items-center">
                Your cart is empty
                <Link href="/store" className='block border-2 border-purple-800 rounded-2xl w-60 p-2 mt-4'>Explore Shop</Link>
            </div>
        );
    }
    return (
        <div className="w-full">

            {isLoading ? (
                <CartSkeleton />
            ) : (
                <div className="lg:w-[70%] h-full">
                    {/* data.games — это массив, который отдает наш API */}
                     {data?.games?.map((game: GameCardProps, index: number) => (
                        <CartCardCreator 
                            key={game.id}
                            id={game.id}
                            order={index + 1}
                            title={game.title}
                            rating_summary={Number(game.rating_summary || 0)}
                            gengres={game.game_genres}
                            release_date={
                                game.release_date 
                                    ? new Date(game.release_date).toLocaleDateString('de-DE') 
                                    : "TBA" 
                            }
                            added_at={
                                game.wishlist?.[0]?.added_at 
                                    ? new Date(game.wishlist[0].added_at).toLocaleDateString('de-DE') 
                                    : "Recently"
                            }
                            price={Number(game.price_eur || 0)} 
                            image={game.card_img || game.main_img || '/img/placeholder.webp'} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}