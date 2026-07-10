'use client'
import React from 'react'
import useSWR from 'swr'; 

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CartSummuryData() {
    const { data, error, isLoading } = useSWR('/api/cart', fetcher);

    if (error) return <div className="text-white">Error loading summary</div>;

   
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-[#3B2A46] rounded w-3/4"></div>
                <div className="h-4 bg-[#3B2A46] rounded w-1/2"></div>
            </div>
        );
    }

  
    if (!data || data.length === 0) return <div className="text-white">Cart is empty</div>;

    return (
        <div>
           {data.map((game: typeof data[number]) => (
                <div key={game.id} className="flex justify-between mb-8">
                    <span className=''>{game.title}</span>
                    <span className="whitespace-nowrap ml-5">
                        {Number(game.price_eur || 0)} €
                    </span>
                </div>
            ))}
        </div>
    );
}