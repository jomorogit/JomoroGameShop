import { prisma } from '@/lib/prisma'; 
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function Overview({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  // 2. Извлекаем ID. Если формат URL "1-skyrim", split('-')[0] даст "1"
  const idFromUrl = parseInt(gameId.split('-')[0]);

  // 3. ПРОВЕРКА: Если id не является числом, сразу показываем 404, не мучая базу
  if (isNaN(idFromUrl)) {
    return notFound();
  }

  // 4. Запрос к БД
  const game = await prisma.game.findUnique({
    where: {
      id: idFromUrl
    },
    include: { 
      game_media: true, 
      game_genres: { include: { genre: true } } 
    }
  });

  // 5. ПРОВЕРКА: Если игры с таким ID нет в базе
  if (!game) {
    return notFound();
  }
      
  return (
    <div className="flex flex-col gap-6 w-full">
        <h1 className='text-2xl font-inder font-bold'>About This Game</h1>
        <p className='font-inder leading-relaxed text-white/80 lg:text-xl'>{game.about_game}</p>
        
        {game.about_game_img && (
          <Image
            src={game.about_game_img}
            alt={game.title || "About game image"} 
            width={800} 
            height={450} 
            className="w-full h-auto rounded-2xl object-cover shadow-lg"
          />
        )}

        <h1 className='text-2xl font-inder font-bold'>Game Features</h1>
        <p className='font-inder leading-relaxed text-white/80 lg:text-xl'>{game.features}</p>
    </div>
  )
}