import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Если запрос пустой, возвращаем пустой массив
    if (!query || query.trim() === '') {
        return NextResponse.json([]);
    }

    try {
        // Ищем игры в БД, где в названии содержится поисковая фраза
        const games = await prisma.game.findMany({
            where: {
                title: {
                    contains: query,
                    mode: 'insensitive', //  Игнорируем регистр букв (Sub и sub вернут игру)
                },
            },
            take: 7,
            select: {
                id: true,
                title: true,
                card_img: true, 
            
            }
        });

        return NextResponse.json(games);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
    }
}