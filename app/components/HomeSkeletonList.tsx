import React from 'react'

export default function HomeSkeletonList() {
  const skeletonItems = Array.from({ length: 10 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
      {skeletonItems.map((_, index) => (
        <div 
          key={index} 
          // Полностью копируем размеры, отступы и анимацию пульсации реальной карточки
          className="w-full mb-4 md:mb-10 block rounded-t-lg animate-pulse"
        >
          {/* 1. Имитация верхнего блока с картинкой */}
          <div className="h-40 md:h-70 w-full bg-[#23122E] rounded-t-lg" />

          {/* 2. Имитация нижней контентной части карточки section */}
          <div className="p-2 md:p-3 bg-[#251642]/60 rounded-b-lg border-t border-white/5 flex flex-col justify-between min-h-[120px]">
            
            {/* Имитация названия игры */}
            <div className="h-4 bg-white/10 rounded w-3/4 mb-3 mt-1" />

            {/* Имитация секции цены и оценки */}
            <div className="flex justify-between items-center mt-1">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-white/10 rounded w-1/4" />
            </div>

            {/* Имитация нижней кнопки добавления в корзину */}
            <div className="mt-4 h-9 md:h-11 bg-white/5 rounded-xl w-full" />
            
          </div>
        </div>
      ))}
    </div>
  )
}