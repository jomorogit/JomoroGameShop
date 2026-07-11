// app/page.tsx
import Image from "next/image";
import SilkSong from "./img/Game1.webp"; 
import Link from "next/link";
import HomePageList from "../components/HomePageList";
import { Suspense } from 'react';
import HomeSkeletonList from "../components/HomeSkeletonList";

export default async function Home() {
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
          fetchPriority="high"
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

            <Suspense fallback={<HomeSkeletonList />}>
              <HomePageList></HomePageList>
            </Suspense>
      </div>
    </div>
  );
}