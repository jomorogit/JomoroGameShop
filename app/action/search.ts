'use server'
import { prisma } from "@/lib/prisma";

export async function searchGames(query: string) {
    if (!query || query.length < 2) return [];

    const games = await prisma.game.findMany({
        where: {
            title: {
                contains: query,
                mode: 'insensitive',
            },
        },
        take: 5,
        select: {
            id: true,
            title: true,
            main_img: true,
            price_eur: true,
        }
    });

    return games;
}