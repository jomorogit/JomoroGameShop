'use client'
import React from 'react'
import CartCardCreator from '@/app/components/CartItem';
import useSWR from 'swr'; 
import CartSkeleton from './CartSkeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartList() {
    
    const { data, error, isLoading } = useSWR('/api/cart', fetcher);

   
    if (error) return <div className="text-white">Cart error</div>;

    return (
        <div className="w-full">
            {isLoading ? (
                <CartSkeleton />
            ) : (
                <div className="lg:w-[70%] h-full">
                    {/* data.games — это массив, который отдает наш API */}
                     {data.map((game: typeof data[number], index: number) => (
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