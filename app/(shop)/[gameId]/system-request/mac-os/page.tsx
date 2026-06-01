'use server'
import React from 'react'
import { prisma } from '@/lib/prisma'; 
import { notFound } from 'next/navigation';
import ScrollToMiddle from '@/app/hooks/ScrollMiddle';

export default async function MacOS({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const idFromUrl = parseInt(gameId.split('-')[0]);

  if (isNaN(idFromUrl)) return notFound();

  const game = await prisma.game.findUnique({
    where: { id: idFromUrl },
    select: {
      system_requirements: {
        where: { os_type: "macOS" },
        select: { 
          id: true, 
          cpu: true, 
          dx: true,
          gpu: true,
          ram: true,
          storage: true,
          is_recommended: true,
        }
      },
    },
  });

  if (!game) return notFound();

  // Вытаскиваем строгий тип одиночной записи из схемы Prisma 💎
  type ReqType = typeof game.system_requirements[number];

  // 1. Проверяем, поддерживает ли игра macOS 
  const isMacSupported = game.system_requirements.length > 0 && 
                         game.system_requirements.some((req: ReqType) => req.cpu !== null);

  // Разделяем требования на две группы 📂
  const minReqs = game.system_requirements.filter((req: ReqType) => !req.is_recommended);
  const recReqs = game.system_requirements.filter((req: ReqType) => req.is_recommended);

  // Вспомогательная функция для отрисовки — теперь строго типизирована! 🛠️
  const renderReqs = (reqs: ReqType[]) => (
    reqs.map((req: ReqType) => (
      <div key={req.id} className="text-sm space-y-1 mt-2 text-gray-300">
        <p><span className="text-gray-500">CPU:</span> {req.cpu}</p>
        <p><span className="text-gray-500">GPU:</span> {req.gpu}</p>
        <p><span className="text-gray-500">RAM:</span> {req.ram}</p>
        <p><span className="text-gray-500">Storage:</span> {req.storage}</p>
        {req.dx && <p><span className="text-gray-500">DX:</span> {req.dx}</p>}
      </div>
    ))
  );

  return (
    <div className='w-full bg-[#2E183C] rounded-2xl p-6 h-auto border border-white/5'>
      <ScrollToMiddle/>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        macOS
      </h2>
        
      {/* 2. Если игра не поддерживается */}
      {!isMacSupported ? (
        <div className="w-full text-center py-6 bg-red-950/30 border border-red-900/50 rounded-xl">
          <p className="text-red-400 text-lg font-medium">
            ❌ This game is not supported on macOS
          </p>
        </div>
      ) : (
        /* 3. Если поддержка есть */
        <div className='w-full h-auto flex flex-col md:flex-row justify-between gap-8'>
          {/* Minimum */}
          <div className="flex-1">
            <p className="font-bold text-[#9343E7] mb-2 uppercase tracking-wider">Minimum:</p>
            {minReqs.length > 0 && minReqs[0].cpu ? renderReqs(minReqs) : <p className="text-gray-500 italic">Not specified</p>}
          </div>

          {/* Recommended */}
          <div className="flex-1">
            <p className="font-bold text-[#9343E7] mb-2 uppercase tracking-wider">Recommended:</p>
            {recReqs.length > 0 && recReqs[0].cpu ? renderReqs(recReqs) : <p className="text-gray-500 italic">Not specified</p>}
          </div>
        </div>
      )}
    </div>
  )
}