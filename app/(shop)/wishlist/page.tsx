import { prisma } from "@/lib/prisma"; 
import { authConfig } from "../../configs/auth";
import WishListCardCreator from "@/app/components/WishListItem";
import { getServerSession } from "next-auth"
import ScrollToTop from "@/app/hooks/ScrollTop";
export default async function WishList() {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
        return <div className="p-10 text-white">Пожалуйста, войдите в аккаунт 🔑</div>;
    }

    const userId = Number(session.user.id);
    let games = []; 
    let cartGameIds: number[] = []; // Массив для ID игр, которые уже в корзине

    try {
        const cartItems = await prisma.cart.findMany({
            where: { user_id: userId },
            select: { game_id: true }
        });
        cartGameIds = cartItems.map(item => item.game_id);

        games = await prisma.game.findMany({
            where: { 
                wishlist: {
                    some: { user_id: userId }
                }
            },
            orderBy: { id: 'desc' },
            include: {
                game_genres: { include: { genre: true } },
                wishlist: {
                    where: { user_id: userId }
                },
            }
        });
    } catch (error) {
        return <div className="p-10 text-white">Error loading data ⚠️</div>;
    }

    if (games.length === 0) {
        return <div className="p-10 text-white text-center text-3xl mt-50">Your wishlist is empty</div>;
    }
    const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    return (
        <div className="mt-16 p-10 w-full pl-10 ">
            <ScrollToTop/>
            <h1 className="text-3xl mb-6">WishList</h1>
            {games.map((game, index) => {
                const isInCart = cartGameIds.includes(game.id);

                return (
                    <WishListCardCreator 
                        key={game.id}
                        id={game.id}
                        order={index + 1}
                        title={game.title}
                        rating_summary={Number(game.rating_summary || 0)}
                        gengres={game.game_genres}
                        release_date={
                            game.release_date 
                                ? new Date(game.release_date).toLocaleDateString('de-DE') 
                                : "TBA"
                        }
                        added_at={
                            game.wishlist[0]?.added_at 
                                ? new Date(game.wishlist[0].added_at).toLocaleDateString('de-DE', dateOptions) 
                                : "Recently"
                        }
                        price={Number(game.price_eur || 0)} 
                        image={game.card_img || game.main_img || 'https://res.cloudinary.com/dla93ueam/image/upload/v1778947999/Gemini_Generated_Image_w233n0w233n0w233_qgcacd.png'} 
                        initialIsInCart={isInCart}
                    />
                );
            })}
        </div>
    );
}