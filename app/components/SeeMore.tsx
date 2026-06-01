'use client'
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link";
interface LangProps {
  gameID: number
}
interface GameItem {
  id: number
  title: string
  main_img: string
  price: number
  card_img: string
  link: string
}
export default function SeeMore({ gameID}: LangProps) {
  const [games, setGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 

 useEffect(() => {
  const fetchRecommendedGames = async () => {
    try {
      const cleanID = parseInt(String(gameID)); 

      const response = await fetch(`/api/recommended-games/${cleanID}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }; 

  fetchRecommendedGames(); 
}, [gameID]);


  return (
    <div className="mt-8 p-5 pt-6 h-auto bg-[#23122E] rounded-xl">
      <h2 className="text-2xl font-bold mb-4">See more</h2>

        {isLoading ? (
          <p className="text-neutral-400">Loading recommended games...</p>
        ) : games.length === 0 ? (
          <p className="text-neutral-400 lg:text-[18px]">No similar games found.</p>
        ) : (
          <div className="w-full">
            {games.map((game) => (
              <Link href={game.link} key={game.id} className="bg-[#1a0b24] p-3 rounded-lg border block mb-2 border-purple-900/20">
                    <div className="relative w-full h-80 md:h-60 mb-2">
                        {/* Десктопный баннер */}
                        <div className="hidden md:block absolute inset-0">
                          <Image 
                            src={game.main_img} 
                            alt={game.title} 
                            fill
                             loading="lazy"
                            sizes="(min-width: 768px) 25vw" 
                            className="object-cover object-center rounded-md"
                          />
                        </div>

                        {/* Мобильная карточка */}
                        <div className="block md:hidden absolute inset-0">
                          <Image 
                            src={game.card_img} 
                            alt={game.title} 
                            fill
                             loading="lazy"
                            sizes="50vw" 
                            className="object-cover object-center rounded-md"
                          />
                        </div>
                      </div>
              <h3 className="font-semibold truncate text-xl lg:text-2xl">{game.title}</h3>
              <p className="text-purple-400 font-medium lg:text-xl">{game.price} €</p>
            </Link>
            ))}
          </div>
        )
      
      }
    </div>
  )
}