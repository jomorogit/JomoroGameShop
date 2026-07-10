import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 
import { generateGameHref } from '@/app/utils/formatters';

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameID = parseInt(id);

    if (isNaN(gameID)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const currentGame = await prisma.game.findUnique({
      where: { id: gameID },
      select: {
        game_genres: {
          select: { genre_id: true }
        }
      }
    });

    if (!currentGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const genreIds = currentGame.game_genres.map(g => g.genre_id);


    const sameGames = await prisma.game.findMany({
      where: {
        id: { not: gameID }, 
        game_genres: {       
          some: {
            genre_id: { in: genreIds }
          }
        }
      },
      select: {
        id: true,
        main_img: true,
        title: true, 
        price_eur: true, 
        game_genres: true,
        card_img: true,
      }
    });
      
    let sortedGames = sameGames
      .map(game => {
        const finalHref = generateGameHref(game.id, game.title);
        const matches = game.game_genres.filter(g => genreIds.includes(g.genre_id)).length;
        
        return { 
          id: game.id,
          title: game.title,
          main_img: game.main_img || '/placeholder-image.jpg', 
          price: Number(game.price_eur), 
          card_img: game.card_img || '/placeholder-image.jpg', 
          link: finalHref,
          matches 
        };
      })
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3);
    
      // если игр не хватает , то добавляються случайные
    const missingCount = 3 - sortedGames.length;
    
    if (missingCount > 0) {
      const excludeIds = [gameID, ...sortedGames.map(g => g.id)];
      

      const availableIdsObj = await prisma.game.findMany({
        where: { id: { notIn: excludeIds } },
        select: { id: true }
      });
      
      const randomIds = availableIdsObj
        .sort(() => 0.5 - Math.random())
        .slice(0, missingCount)
        .map(g => g.id);

      if (randomIds.length > 0) {
        const randomGamesData = await prisma.game.findMany({
          where: { id: { in: randomIds } },
          select: {
            id: true,
            main_img: true,
            title: true, 
            price_eur: true, 
            card_img: true,
          }
        });

        const formattedRandomGames = randomGamesData.map(game => ({
          id: game.id,
          title: game.title,
          main_img: game.main_img || '/placeholder-image.jpg', 
          price: Number(game.price_eur), 
          card_img: game.card_img || '/placeholder-image.jpg', 
          link: generateGameHref(game.id, game.title),
          matches: 0
        }));

        sortedGames = [...sortedGames, ...formattedRandomGames];
      }
    }

    return NextResponse.json(sortedGames);

  } catch (error) {
    console.error("DB Error:", error); 
    return NextResponse.json({ error: "Error connecting to DB" }, { status: 500 }); 
  }
}