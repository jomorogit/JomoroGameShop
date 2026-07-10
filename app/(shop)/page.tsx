// app/page.tsx
import Image from "next/image";
import SilkSong from "./img/Game1.webp"; 
import HomeItem from "../components/HomeItem"; 
import Link from "next/link";
import { getCachedGames } from "../utils/db-queries";


export default async function Home() {

  const games = await getCachedGames();


  return (
    <div className="w-full mt-24 flex flex-col items-center holographic-container pb-10"> 
      <div 
        className="relative h-[300px] md:h-[400px] holographic-card w-[92%] rounded-3xl overflow-hidden z-0"
      >
        {/* Картинка-фон */}
        <Image 
          src={SilkSong} 
          alt="Hollow Knight Silksong"
          fill 
          priority={true} 
          className="object-cover object-center -z-10" 
          sizes="100vw"
        />

        <div className="relative z-10 pl-6 md:pl-15 flex flex-col h-full justify-center bg-gradient-to-r from-black/50 via-transparent to-transparent">
          <h2 className="mb-2 md:mb-5 text-sm md:text-base text-white/80">Release Date 4 Sep, 2025</h2>
          <h1 className="text-2xl md:text-4xl text-white font-bold leading-tight">Hollow Knight:</h1>
          <h1 className="mb-4 md:mb-5 text-2xl md:text-4xl text-white font-bold leading-tight">Silksong</h1>
          
          <Link 
            href="/1-hollow-knight-silksong/" 
            scroll={false} 
            className="flex items-center justify-center bg-[#9343E7] w-48 md:w-75 h-14 md:h-[90px] text-lg md:text-2xl text-white font-semibold rounded-2xl shadow-lg cursor-pointer hover:bg-[#a55cf0] transition-all hover:shadow-[0_0_20px_rgba(251,0,255,0.5)] duration-300 active:scale-95"
          >
            Play Now
          </Link>
        </div>
      </div>

      {/* Каталог товаров  */}
      <div className="w-[92%] md:w-[90%] mt-12">
        <h2 className="text-xl md:text-3xl text-white mb-6 md:mb-8 font-semibold">Featured and Recommended</h2>
        
        {/* Контейнер для карточек */}
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
      </div>
    </div>
  );
}