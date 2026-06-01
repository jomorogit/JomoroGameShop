import { notFound } from 'next/navigation';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authConfig } from "../../configs/auth";
// Компоненты
import { Provider } from "@/app/components/Provider";
import Slider from "@/app/components/Slider";
import AddToCartButton from "@/app/ui/AddToCartButton";
import AddToWishList from '@/app/ui/AddToWishListButton';
import ThisGameLinks from "@/app/components/ThisGameLinks";
import Languages from "@/app/components/Languages";
import SeeMore from "@/app/components/SeeMore";
import ScrollToTop from '@/app/hooks/ScrollTop';
import AddToCartWidget from '@/app/components/AddToCartWidget';
type PrismaGameIdResult = {
  game_id: number;
};
export default async function GameLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
   const session = await getServerSession(authConfig);
  const { gameId } = await params;
  const idFromUrl = parseInt(gameId.split('-')[0]);
  let cartGameIds: number[] = [];
  let LibraryGameIds: number[] = [];
  if (isNaN(idFromUrl)) return notFound();

  const game = await prisma.game.findUnique({
    where: { id: idFromUrl },
    include: {
      game_media: true,
      game_genres: { include: { genre: true } }
    }
  });
   
  if (session?.user?.email) {
    const userFromDb = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (userFromDb) {
      // Одним запросом берем все ID из корзины
      const cartItems = await prisma.cart.findMany({
        where: { user_id: userFromDb.id },
        select: { game_id: true }
      });
      cartGameIds = cartItems.map((item: PrismaGameIdResult) => item.game_id);
    }

    if (userFromDb) {
      
      const LibraryItems = await prisma.library.findMany({
        where: { user_id: userFromDb.id },
        select: { game_id: true }
      });
      LibraryGameIds = LibraryItems.map((item: PrismaGameIdResult) => item.game_id);
    }
  }
      
  if (!game) return notFound();

  const mediaForSlider = game.game_media.map((m: typeof game.game_media[number]) => ({
    id: m.id,
    type: 'image' as const,
    src: m.img_url || '',
    alt: game.title
  }));


  return (
    <Provider>
      <ScrollToTop key={idFromUrl} />
      <div className="min-h-screen w-full mt-24 px-4 md:px-10 text-white pb-20">
        
        {/* Заголовок всегда сверху на всю ширину */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">{game.title}</h1>
        </header>

        {/* ОСНОВНОЙ КОНТЕЙНЕР РАЗДЕЛЕННЫЙ НА 2 ЧАСТИ */}
        {/* На мобилках gap-6 задает отступ между всеми перетасованными блоками */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          
          {/* ЛЕВАЯ ЧАСТЬ (65%) — Весь основной контент */}
          {/* ИСПОЛЬЗУЕМ contents на мобильных */}
          <main className="contents lg:flex lg:w-[65%] lg:flex-col lg:gap-8 min-w-0">
            
            {/* 2. Слайдер 🖼️ */}
            <div className="order-2 lg:order-none bg-black/20 rounded-2xl p-1 shadow-2xl overflow-hidden w-full">
              <Slider media={mediaForSlider} />
            </div>

            {/* 3. Кнопки управления (Wishlist, Subscribe, Hide) */}
            <div className="order-3 lg:order-none bg-[#23122E] p-4 rounded-2xl flex flex-wrap items-center gap-4">
              <AddToWishList gameID={game.id} />
              {/* На данный момент не добавлены */}
              {/* <button className="flex-1 lg:flex-none py-3 px-10 rounded-xl bg-purple-600 font-semibold hover:bg-purple-500 transition-all active:scale-95"
              disabled={true}>
                Subscribe
              </button>
              <button className="py-3 px-8 rounded-xl bg-purple-600 font-semibold hover:bg-purple-500 transition-all"
              disabled={true}>
                Hide
              </button> */}
            </div>

            {/* 4. Блок покупки =*/}
            <div className="order-4 lg:order-none bg-[#23122E] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-medium">Buy {game.title}</h2>
              <AddToCartButton gameID={game.id} price={game.price_eur.toNumber()} initialIsOnCart={cartGameIds.includes(game.id)} initialIsOnLibrary={LibraryGameIds.includes(game.id)}/>
            </div>

            {/* 5. Ссылки и описание*/}
            <div className="order-5 lg:order-none space-y-6">
              <ThisGameLinks id={game.id} title={game.title} />
              <div className="mt-5">
                {children}
              </div>
            </div>
          </main>

          {/* ПРАВАЯ ЧАСТЬ (35%) — Инфо, Языки, См. также */}
          {/* contents для мобилок! */}
          <aside className="contents lg:flex lg:w-[35%] lg:flex-col lg:gap-6">
            
            {/* 1. Карточка с инфо об игре */}
            <div className="order-1 lg:order-none bg-[#23122E] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={game.main_img || ''}
                alt={game.title}
                width={600}
                height={350}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="p-6 space-y-6">
                <p className="text-sm leading-relaxed text-gray-300 lg:text-xl">
                  {game.game_description}
                </p>

                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold">Game Info</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-lg lg:text-xl">Developer</span>
                    <span className="text-sm lg:text-xl text-right">{game.developer}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-lg lg:text-xl">Publisher</span>
                    <span className="text-sm text-right lg:text-xl">{game.publisher}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-lg">Release Date</span>
                    <span className="text-lg text-right">
                      {game.release_date ? new Date(game.release_date).toLocaleDateString() : 'TBA'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase font-bold text-gray-400 mb-3 tracking-widest lg:text-xl">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {game.game_genres.map((gg: typeof game.game_genres[number]) => (
                      <span key={gg.genre.name} className="bg-white/5 px-3 py-1 rounded text-xs">
                        {gg.genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Языки */}
            <div className="order-6 lg:order-none">
              <Languages gameID={game.id} />
            </div>

            {/* 7. Похожие игры */}
            <div className="order-7 lg:order-none">
              <SeeMore gameID={game.id}/>
            </div>
            
          </aside>
        </div>
        
        
      </div>
      <AddToCartWidget price={Number(game.price_eur) || 0} gameID={game.id} initialIsOnLibrary={LibraryGameIds.includes(game.id)}/>
    </Provider>
  );
}