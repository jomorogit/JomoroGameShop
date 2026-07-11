import React from 'react'
import { authConfig } from "../configs/auth";
import { getServerSession } from "next-auth";
import { prisma } from '@/lib/prisma'; 
import MainPageGameCreator from './HomeItem';
export default async function LibraryList() {

    const session = await getServerSession(authConfig);
    if (!session?.user?.id || !session?.user?.email) {
        return (
            <div className="w-full text-center mt-20 text-xl text-red-500 font-bold">
                Authentication error. Please log in.
            </div>
        );
    }

    const libraryItems = await prisma.library.findMany({
            where: { user_id: Number(session.user.id) },
            include: {
                game: true
            }
        });
        
  return (
     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
                    {libraryItems.length > 0 ? (
                        libraryItems.map((item: typeof libraryItems[number]) => {
                            const game = item.game; 
                            if (!game) return null; 
    
                            return (
                                <MainPageGameCreator 
                                    key={game.id}
                                    id={game.id}
                                    title={game.title}
                                    price={Number(game.price_eur || 0)} 
                                    image={game?.card_img || game?.main_img || 'https://res.cloudinary.com/dla93ueam/image/upload/v1778947999/Gemini_Generated_Image_w233n0w233n0w233_qgcacd.png'}
                                    rating_summary={Number(game.rating_summary || 0)}
                                   
                                />
                            );
                        })
                    ) : (
                        <div className="text-2xl text-white mt-10">
                            It is empty here for now... Time to add a couple of games!
                        </div>
                    )}
                </div>
  )
}
