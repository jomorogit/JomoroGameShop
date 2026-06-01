'use client'
import React, { useState, useEffect } from 'react'
import AddToCartButton from '../ui/AddToCartButton';

interface AddToCartWidgetProps {
  price: number | string;
  gameID: number;
  initialIsOnLibrary: boolean;
}

export default function AddToCartWidget({ price, gameID, initialIsOnLibrary }: AddToCartWidgetProps) {
  const [isHiden, setIsHiden] = useState<boolean>(true);

  useEffect(() => {
    // Переменная-флаг внутри эффекта, чтобы не сбрасывалась при рендерах 
    let functionTriggered = false; 

    const handleScroll = () => {
      const targetHeight = 1600; 
      const currentScroll = window.scrollY; // Сколько проскроллено от верха

      if (currentScroll >= targetHeight && !functionTriggered) {
        functionTriggered = true; 
        setIsHiden(false);
      } else if (currentScroll < targetHeight && functionTriggered) {
        // Если пользователь ускроллил обратно вверх, прячем виджет
        functionTriggered = false;
        setIsHiden(true);
      }
    };

    // Вешаем событие при монтировании компонента
    window.addEventListener('scroll', handleScroll);

    // ОБЯЗАТЕЛЬНО: убираем событие при размонтировании, чтобы не было утечек памяти
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Пустой массив зависимостей означает, что эффект выполнится 1 раз

  return (
    <div 
      className={`fixed bottom-14 left-0 w-full h-20 z-50 flex justify-center overflow-y-auto rounded-2xl md:hidden
        transition-all duration-500 ease-in-out
        ${isHiden 
          ? 'opacity-0 translate-y-10 pointer-events-none' 
          : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
    >
      <div className='w-70'>
        {/* Передаем чистую цену (число) в кнопку */}
        <AddToCartButton 
          price={typeof price === 'string' && price === 'free' ? 0 : Number(price) || 0} 
          gameID={gameID} 
          initialIsOnCart={false} // Добавь true/false в зависимости от твоей логики корзины 🛒
          initialIsOnLibrary={initialIsOnLibrary}
        />
      </div>
    </div>
  )
}