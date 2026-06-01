import { prisma } from "@/lib/prisma"; 
import DeletePageCardCreator from '@/app/components/DeletePageItem';
export default async function DeleteGame() {
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
        <h1 className='text-4xl mb-6'>Create game</h1>

        {games.map((game) => {
                    return (
                      <DeletePageCardCreator 
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
