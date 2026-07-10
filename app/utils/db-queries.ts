import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedGames = unstable_cache(
  async () => {
    return await prisma.game.findMany({
      orderBy: [{ rating_summary: 'desc' }, { id: 'desc' }],
      include: { 
        game_genres: { include: { genre: true } },
        system_requirements: true,
      }
    });
  },
  ['all-games-list'], // key
  { tags: ['games'] } 
);