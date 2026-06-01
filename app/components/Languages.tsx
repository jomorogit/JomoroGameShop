import { prisma } from '@/lib/prisma'; 
import { notFound } from 'next/navigation';

interface LangProps {
  gameID: number
}

export default async function Languages({ gameID }: LangProps) {
  if (isNaN(gameID)) return notFound();

  const game = await prisma.game.findUnique({
    where: { 
      id: gameID 
    },
    include: {
      game_languages: {
        include: {
          language: true 
        }
      }
    }
  });

  if (!game) return notFound();

  return (
    <div className="p-5 pt-6 bg-[#23122E] rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Languages</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 text-sm uppercase">
            <th className="pb-4 mr-2 font-medium">Language</th>
            <th className="pb-4 text-center font-medium">Interface</th>
            <th className="pb-4 text-center font-medium">Subtitles</th>
            <th className="pb-4 text-center font-medium">Audio</th>
          </tr>
        </thead>
        <tbody>
          {game.game_languages.map((item) => (
            <tr key={item.language_id} className="border-t border-gray-800 hover:bg-white/5 transition-colors">
              <td className="py-3 font-medium text-gray-200">
                {item.language?.lan_name || 'Unknown'}
              </td>
              {/* Используем text-center для выравнивания галочек под заголовками */}
              <td className="py-3 text-center">
                {item.has_interface ? '✔️' : '❌'}
              </td>
              <td className="py-3 text-center">
                {item.has_subtitles ? '✔️' : '❌'}
              </td>
              <td className="py-3 text-center">
                {item.has_audio ? '✔️' : '❌'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}