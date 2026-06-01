import Filters from "@/app/layout/Filters"
import { prisma } from '@/lib/prisma'; 
import { OSPlatform, Prisma } from "@prisma/client"; 
import CreateCard from "@/app/components/HomeItem";
import DropList from "@/app/components/DropList";
import { authConfig } from "../../configs/auth";
import { getServerSession } from "next-auth"

const SORT_OPTIONS: Record<string, Prisma.GameOrderByWithRelationInput> = {
    Default: { id: 'desc' },
    PriceUp: { price_eur: 'asc' },
    PriceDown: { price_eur: 'desc' },
    PopularityUp: { rating_summary: 'asc' },
    PopularityDown: { rating_summary: 'desc' },
};

export default async function Store(props: { 
    searchParams: Promise<{ [key: string]: string | undefined }> 
}) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authConfig); 

    // 2. Извлекаем данные из URL. Если данных нет, ставим значения по умолчанию 
    const minPrice = Number(searchParams.minPrice) || 0;
    const maxPrice = Number(searchParams.maxPrice) || 1000;
    
    // Превращаем строки из URL обратно в массивы. 
    const genres = searchParams.genres ? searchParams.genres.split(',') : [];
    
    // Для рейтингов дополнительно используем .map(Number)
    const ratings = searchParams.ratings ? searchParams.ratings.split(',').map(Number) : [];
    
    const ratingFilters = ratings.map(star => {
        if (star === 5) return { rating_summary: { gte: 8.1, lte: 10 } };
        if (star === 4) return { rating_summary: { gte: 6.1, lte: 8.0 } };
        if (star === 3) return { rating_summary: { gte: 4.1, lte: 6.0 } };
        if (star === 2) return { rating_summary: { gte: 2.1, lte: 4.0 } };
        if (star === 1) return { rating_summary: { gte: 0,   lte: 2.0 } };
        return {};
    }).filter(Boolean);

    // Используем "as OSPlatform[]", чтобы подтвердить TypeScript соответствие типов платформ
    const platforms = (searchParams.platforms 
        ? searchParams.platforms.split(',') 
        : []) as OSPlatform[];
    
    let cartGameIds: number[] = [];
    let wishlistGameIds: number[] = [];
    let libraryGameIds: number[] = [];

    if (session?.user?.email) {
        const userFromDb = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (userFromDb) {
            const cartItems = await prisma.cart.findMany({
                where: { user_id: userFromDb.id },
                select: { game_id: true }
            });
            cartGameIds = cartItems.map(item => item.game_id);

            const wishlistItems = await prisma.wishlist.findMany({ 
                where: { user_id: userFromDb.id },
                select: { game_id: true }
            });
            wishlistGameIds = wishlistItems.map(item => item.game_id);

            const libraryItems = await prisma.library.findMany({
                where: { user_id: userFromDb.id },
                select: { game_id: true }
            });
            libraryGameIds = libraryItems.map(item => item.game_id);
        }
    }

    const sortType = searchParams.sortType || "Default";
    const currentOrderBy = SORT_OPTIONS[sortType] || SORT_OPTIONS.Default;

    const games = await prisma.game.findMany({
        where: {
            price_eur: {
                gte: minPrice,
                lte: maxPrice
            },

            // Ищем игры, попадающие в любой из выбранных диапазонов рейтингов
            ...(ratings.length > 0 && {
                OR: ratingFilters
            }),

            // Фильтр по жанрам связь Many-to-Many
            ...(genres.length > 0 && {
                game_genres: {
                    some: {
                        genre: { 
                            name: { in: genres } 
                        }
                    }
                }
            }),

            // Фильтр по платформам
            ...(platforms.length > 0 && {
                system_requirements: {
                    some: {
                        os_type: { in: platforms },
                        cpu: { not: null } 
                    }
                }
            })
        },
        // Динамическая сортировка
        orderBy: currentOrderBy,
        include: {
            game_genres: { include: { genre: true } }
        }
    });

    return (
        <div className="w-auto mt-24 lg:pl-10 lg:pr-10 pl-4 pr-4 lg:flex">
            {/* Боковая панель фильтров */}
            <div className="w-full lg:w-auto">
                <Filters />
            </div>

            {/* Контейнер со списком игр (правая часть) */}
            <div className="lg:ml-8 w-full">
                {/* Заголовок и количество найденных игр */}
                <div className="lg:mb-8 mb-4 mt-2 lg:mt-0 flex-col lg:flex-row flex lg:justify-between lg:items-center">
                    <div className="flex order-2 lg:order-0 mt-4 lg:mt-0">
                        <h1 className="mr-4 text-xl lg:text-2xl text-white lg:block">All Games</h1>
                        <span className="text-xl lg:text-2xl text-gray-400">
                            {games.length} games found
                        </span>
                    </div>
                    {/* Кнопка сортировки */}
                    <DropList />
                </div>

                {/* Сетка с карточками игр */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-8">
                    {games.length > 0 ? (
                        games.map((game) => (
                            <CreateCard 
                                key={game.id}
                                id={game.id}
                                title={game.title}
                                price={Number(game.price_eur)} 
                                image={game?.card_img || game?.main_img || '/img/placeholder.webp'}
                                rating_summary={Number(game.rating_summary || 0)}
                                // Передаем реальный статус из базы данных 👇
                                initialIsInCart={cartGameIds.includes(game.id)} 
                                initialIsWished={wishlistGameIds.includes(game.id)}
                                initialIsLibrary={libraryGameIds.includes(game.id)}
                            />
                        ))
                    ) : (
                        // Если под фильтры ничего не подошло
                        <div className="text-2xl text-white mt-10">
                            No games found with these filters
                        </div>
                    )}
                </div>
                
                {/* Для мобилок чтобы было видно нижние игры*/}
                <div className="h-20 lg:hidden"></div>
            </div>
        </div>
    )
}