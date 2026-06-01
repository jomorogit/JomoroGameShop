"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' 
import { AddToCart } from '../action/cart';
import { useToast } from '../components/Toast'; 
import { useSession } from "next-auth/react"; 
import AddToLibrary from '../action/addLibrary'

interface AddToCartProps {
  gameID: number;
  price: number;
  initialIsOnCart: boolean; 
  initialIsOnLibrary?: boolean;
}

export default function AddToCartButtonMainPage({ gameID, price, initialIsOnCart, initialIsOnLibrary }: AddToCartProps) {
  const [isOnCart, setIsOnCart] = useState<boolean>(initialIsOnCart);
  const [isOnLibrary, setIsOnLibrary] = useState<boolean>(initialIsOnLibrary || false);
  const [loading, setLoading] = useState(false) 
  const router = useRouter()
  const { data: session } = useSession() 
  const { showToast } = useToast() 

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (loading || isOnCart) return;
    
    setLoading(true);
    try {
      // 1. Проверяем, вошел ли пользователь в аккаунт
      if (!session?.user?.email) {
        showToast("Please log in to add games!", "/register/login", "Log In");
        return; 
      }

      // 2. Отправляем запрос на server
      const result = await AddToCart(gameID);
      
      // 3. Выводим тосты и обновляем состояние
      if (result && result.success) {
        setIsOnCart(true);
        showToast("✅ Game successfully added to your cart!"); 

        // Генерируем событие для мгновенного обновления счетчика в TabBar
        window.dispatchEvent(new Event('cartUpdated')); 
      } else {
        showToast("⚠️ Could not add game. Please try again."); 
      }
    } catch (err) {
      showToast("❌ Server error. Please try again later."); 
      console.error("Failed to add:", err);
    } finally {
      setLoading(false) 
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
  
  const goToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    router.push('/cart');
  };

  const goToLibrary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    router.push('/library');
  };

  const baseButtonStyles = "rounded-xl min-h-[30px] text-[12px] w-full pt-3 pb-3  md:p-3 md:text-sm font-bold transition-all text-white flex items-center justify-center min-w-[120px]";

  return (
    <div className='flex bg-[#3D234D] justify-between rounded-xl items-center shadow-lg w-full'>
      {loading ? (
        <div className={`${baseButtonStyles} bg-gray-600 opacity-50 cursor-wait`}>
          LOADING...
        </div>
      ) : isOnCart ? (
        <button onClick={goToCart} className={`${baseButtonStyles} bg-[#64208e] hover:bg-[#6d398b] hover:scale-103 cursor-pointer`}>
          IN YOUR CART
        </button>
      ) : isOnLibrary ? (
        <button onClick={goToLibrary} className={`${baseButtonStyles} bg-[#64208e] hover:bg-[#6d398b] hover:scale-103 cursor-pointer`}>
          IN LIBRARY
        </button>
      ) : Number(price) === 0 ? (
        <button onClick={handleAddToLibrary} className={`${baseButtonStyles} bg-green-800 hover:bg-green-700 active:scale-95 cursor-pointer w-full`}>
          ADD TO LIBRARY
        </button>
      ) : (
        <button onClick={handleAddToCart} className={`${baseButtonStyles} bg-[#3D234D] hover:bg-[#402a4e] active:scale-95 cursor-pointer w-full`}>
          ADD TO CART
        </button>
      )}
    </div>
  )
}