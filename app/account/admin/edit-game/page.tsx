import React from 'react'
import { prisma } from "@/lib/prisma"; 
import EditGameCard from '@/app/components/EditGameItem';
export default async function EditGame() {
    const games = await prisma.game.findMany({
        orderBy: {
            id: 'desc'
        },
        include: {
            game_genres: { include: { genre: true } }
        }   
    })
  return (
    <div className='w-full h-auto bg-[#23122E] mr-10 rounded-2xl p-10'>
        <h1 className='text-4xl mb-6'>Edit game</h1>

        {games.map((game) => {

                    return (
                      <EditGameCard 
                        key={game.id}
                        id={game.id}
                        title={game.title}
                        price={Number(game.price_eur)} 
                        image={game.main_img || '/img/placeholder.webp'} 
                      />
                      
                      
                    );
                  })}
    </div>
  )
}
