import Filters from "@/app/layout/Filters"
import { prisma } from '@/lib/prisma'; 
import { OSPlatform } from "@prisma/client"; 
import CreateCard from "@/app/components/HomeItem";
import DropList from "@/app/components/DropList";
import { authConfig } from "../../configs/auth";
import { getServerSession } from "next-auth"
import { getCachedGames } from "@/app/utils/db-queries";

export default async function Store(props: { 
    searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authConfig); 

    // 1. Получаем все игры из кэша
    const allGames = await getCachedGames();

    // 2. Получаем параметры из URL
    const minPrice = Number(searchParams.minPrice) || 0;
    const maxPrice = Number(searchParams.maxPrice) || 1000;
    const genres = searchParams.genres ? searchParams.genres.split(',') : [];
    const ratings = searchParams.ratings ? searchParams.ratings.split(',').map(Number) : [];
    const platforms = (searchParams.platforms ? searchParams.platforms.split(',') : []) as OSPlatform[];
    const sortType = searchParams.sortType || "Default";

    // 3. Фильтрация в памяти
    const filteredGames = allGames.filter(game => {
        const price = Number(game.price_eur);
        const rating = Number(game.rating_summary || 0);

        if (price < minPrice || price > maxPrice) return false;

        if (ratings.length > 0) {
            const matchesRating = ratings.some(star => {
                if (star === 5) return rating >= 8.1;
                if (star === 4) return rating >= 6.1 && rating < 8.1;
                if (star === 3) return rating >= 4.1 && rating < 6.1;
                if (star === 2) return rating >= 2.1 && rating < 4.1;
                if (star === 1) return rating >= 0 && rating < 2.1;
                return false;
            });
            if (!matchesRating) return false;
        }

        if (genres.length > 0) {
            const gameGenreNames = game.game_genres.map(gg => gg.genre.name);
            if (!genres.some(g => gameGenreNames.includes(g))) return false;
        }

        if (platforms.length > 0) {
            const gamePlatforms = game.system_requirements.map(sr => sr.os_type);
            if (!platforms.some(p => gamePlatforms.includes(p))) return false;
        }

        return true;
    });

    // 4. Сортировка в памяти
    const sortedGames = [...filteredGames].sort((a, b) => {
        switch (sortType) {
            case 'PriceUp': return Number(a.price_eur) - Number(b.price_eur);
            case 'PriceDown': return Number(b.price_eur) - Number(a.price_eur);
            case 'PopularityUp': return Number(a.rating_summary || 0) - Number(b.rating_summary || 0);
            case 'PopularityDown': return Number(b.rating_summary || 0) - Number(a.rating_summary || 0);
            default: return Number(b.id) - Number(a.id); // Default (newest first)
        }
    });

    // 5. Загрузка данных пользователя (для отображения иконок в карточках)
    let cartGameIds: number[] = [];
    let wishlistGameIds: number[] = [];
    let libraryGameIds: number[] = [];

    if (session?.user?.email) {
        const userFromDb = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (userFromDb) {
            const [cart, wishlist, library] = await Promise.all([
                prisma.cart.findMany({ where: { user_id: userFromDb.id }, select: { game_id: true } }),
                prisma.wishlist.findMany({ where: { user_id: userFromDb.id }, select: { game_id: true } }),
                prisma.library.findMany({ where: { user_id: userFromDb.id }, select: { game_id: true } })
            ]);
            cartGameIds = cart.map(i => i.game_id);
            wishlistGameIds = wishlist.map(i => i.game_id);
            libraryGameIds = library.map(i => i.game_id);
        }
    }

    return (
        <div className="w-auto mt-24 lg:pl-10 lg:pr-10 pl-4 pr-4 lg:flex">
            <div className="w-full lg:w-auto"><Filters /></div>
            <div className="lg:ml-8 w-full">
                <div className="lg:mb-8 mb-4 mt-2 lg:mt-0 flex-col lg:flex-row flex lg:justify-between lg:items-center">
                    <div className="flex order-2 lg:order-0 mt-4 lg:mt-0">
                        <h1 className="mr-4 text-xl lg:text-2xl text-white">All Games</h1>
                        <span className="text-xl lg:text-2xl text-gray-400">{sortedGames.length} games found</span>
                    </div>
                    <DropList />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-8">
                    {sortedGames.length > 0 ? (
                        sortedGames.map((game) => (
                            <CreateCard 
                                key={game.id}
                                id={game.id}
                                title={game.title}
                                price={Number(game.price_eur)} 
                                image={game?.card_img || game?.main_img || '/img/placeholder.webp'}
                                rating_summary={Number(game.rating_summary || 0)}
                                initialIsInCart={cartGameIds.includes(game.id)} 
                                initialIsWished={wishlistGameIds.includes(game.id)}
                                initialIsLibrary={libraryGameIds.includes(game.id)}
                            />
                        ))
                    ) : (
                        <div className="text-2xl text-white mt-10">No games found with these filters</div>
                    )}
                </div>
            </div>
        </div>
    )
}