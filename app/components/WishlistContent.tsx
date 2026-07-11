import { getWishlistFullCached } from '../utils/wishlist-queries';
import { prisma } from "@/lib/prisma";
import WishListCardCreator from "@/app/components/WishListItem";
import { getServerSession } from "next-auth";
import { authConfig } from '../configs/auth';

export default async function WishListContent() {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) return null;

    const userId = Number(session.user.id);

    // Загружаем данные из кеша и корзину параллельно
    const [cartItems, games] = await Promise.all([
        prisma.cart.findMany({ where: { user_id: userId }, select: { game_id: true } }),
        getWishlistFullCached(userId)
    ]);

    const cartGameIds = cartItems.map(item => item.game_id);
    
    return (
        <>
           {games.map((game, index) => (
                <WishListCardCreator 
                    key={game.id}
                    id={game.id}
                    order={index + 1}
                    title={game.title}
                    rating_summary={Number(game.rating_summary || 0)}
                    gengres={game.game_genres}
                    release_date={game.release_date ? new Date(game.release_date).toLocaleDateString('de-DE') : "TBA"}
                    added_at={game.wishlist[0]?.added_at ? new Date(game.wishlist[0].added_at).toLocaleDateString('de-DE') : "Recently"}
                    price={Number(game.price_eur || 0)} 
                    image={game.card_img || game.main_img || 'https://res.cloudinary.com/dla93ueam/image/upload/v1778947999/Gemini_Generated_Image_w233n0w233n0w233_qgcacd.png'} 
                    initialIsInCart={cartGameIds.includes(game.id)}
                />
            ))}
        </>
    );
}