import React from 'react'
import HomeItem from "../components/HomeItem";
import { getCachedGames } from "../utils/db-queries";
export default async function HomePageList() {
      const games = await getCachedGames();
  return (
     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
         {games.map((game: typeof games[number]) => {
                
                    return (
                      <HomeItem 
                        key={game.id}
                        id={game.id}
                        title={game.title}
                        price={Number(game.price_eur)} 
                        image={game?.card_img || game?.main_img || 'https://res.cloudinary.com/dla93ueam/image/upload/v1778947999/Gemini_Generated_Image_w233n0w233n0w233_qgcacd.png'}
                        rating_summary={Number(game.rating_summary || 0)}
                      />
                    );
                  })}
    </div>
  )
}
