import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getWishlistFullCached = async (userId: number) => {
  return await unstable_cache(
    async () => {
      // Здесь мы сразу получаем полные данные игр
      return await prisma.game.findMany({
        where: { wishlist: { some: { user_id: userId } } },
        orderBy: { id: 'desc' },
        include: {
          game_genres: { include: { genre: true } },
          wishlist: { where: { user_id: userId } },
        }
      });
    },
    [`wishlist-full-${userId}`],
    { tags: [`wishlist-${userId}`] }
  )();
};