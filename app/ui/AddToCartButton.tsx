'use client'
import React, { useState } from 'react'
import Link from 'next/link' 
import { useRouter } from 'next/navigation'
import { AddToCart } from '../action/cart' 
import { useToast } from '../components/Toast' 
import { useSession } from "next-auth/react" 
import AddToLibrary from '../action/addLibrary'

interface AddToCartProps {
  gameID: number;
  price: number;
  initialIsOnCart?: boolean; 
  initialIsOnLibrary?: boolean;
}

export default function AddToCartButton({ gameID, price, initialIsOnCart, initialIsOnLibrary }: AddToCartProps) {
  // Состояния для управления корзиной и лоадером
  const [isOnCart, setIsOnCart] = useState<boolean>(initialIsOnCart || false)
  const [isOnLibrary, setIsOnLibrary] = useState<boolean>(initialIsOnLibrary || false);
  const [loading, setLoading] = useState<boolean>(false)
  
  const router = useRouter() 
  const { data: session } = useSession()
  const { showToast } = useToast();

  // Добавление платной игры в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по родительской ссылке
    e.stopPropagation(); // Останавливаем всплытие события к родителю

    if (loading || isOnCart) return;

    setLoading(true);
    try {
      // 1. Проверяем авторизацию пользователя
      if (!session?.user?.email) {
        showToast("Please log in to add games to your cart!", "/register/login", "Log In");
        return; 
      }

      // 2. Отправляем запрос на сервер
      const result = await AddToCart(gameID);

      // 3. Проверяем успешность операции
      if (result && result.success) {
        showToast("✅ Game successfully added to your cart!");
        setIsOnCart(true); 
      } else {
        showToast("⚠️ Could not add game. Please try again.");
      }

    } catch (err) {
      showToast("❌ Server error. Please try again later.");
      console.error("Failed to add:", err);
    } finally {
      setLoading(false);
    }
  };

  // Добавление в библиотеку для бесплатных игр
  const handleAddToLibrary = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (loading || isOnLibrary) return;

    setLoading(true);
    try {
      if (!session?.user?.email) {
        showToast("Please log in to add games to your library!", "/register/login", "Log In");
        return; 
      }

      const result = await AddToLibrary(gameID);

      if (result && result.success) {
        showToast("✅ Game successfully added to your library!");
        setIsOnLibrary(true);
      } else {
        showToast("⚠️ Could not add game. Please try again.");
      }

    } catch (err) {
      showToast("❌ Server error. Please try again later.");
      console.error("Failed to add:", err);
    } finally {
      setLoading(false);
    }
  };

  const baseButtonStyles = "rounded-xl p-3 px-6 text-sm font-bold transition-all text-white flex items-center justify-center min-w-[140px]";

  return (
    <div className='flex p-2 bg-[#3D234D] justify-between rounded-xl items-center shadow-lg'>
      <div className='flex justify-center items-center mr-4 w-auto min-w-10'>
        <p className='ml-2 font-semibold'>{price} €</p>
      </div>

      {/* Условный рендеринг состояний кнопки */}
      {loading ? (
        <div className={`${baseButtonStyles} bg-gray-600 opacity-50 cursor-wait`}>
          LOADING...
        </div>
      ) : isOnCart ? (
        <Link 
          href="/cart"
          onClick={(e) => e.stopPropagation()} // Чтобы клик не триггерил родительские карточки
          className={`${baseButtonStyles} bg-purple-700 hover:bg-purple-600 hover:scale-103 cursor-pointer`}
        >
          IN YOUR CART
        </Link>
      ) : isOnLibrary ? (
        /* Если игра куплена или бесплатная уже в библиотеке */
        <Link href="/library" className={`${baseButtonStyles} bg-green-600 opacity-90`}>
          IN LIBRARY
        </Link>
      ) : Number(price) === 0 ? (
        <button 
          onClick={handleAddToLibrary} 
          className={`${baseButtonStyles} bg-green-700 hover:bg-green-600 active:scale-95 cursor-pointer`}
        >
          ADD TO LIBRARY
        </button>
      ) : ( 
        /* ИСПРАВЛЕНО: Добавлен onClick={handleAddToCart} для платных игр */
        <button 
          onClick={handleAddToCart}
          className={`${baseButtonStyles} bg-green-700 hover:bg-green-600 active:scale-95 cursor-pointer`}
        >
          ADD TO CART
        </button>
      )}
    </div>
  )
}