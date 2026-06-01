'use client'
import React, { useState } from 'react'
import { toggleWishList} from '../action/wishList'
import { Star } from "lucide-react"

interface WishlistButtonProps {
  gameID: number;
  initialIsWished: boolean;
  title: string; 
}

export default function AddToWishListMainPage({ gameID, initialIsWished, title }: WishlistButtonProps) {
   const [isWished, setIsWished] = useState<boolean>(initialIsWished)
   const [loading, setLoading] = useState(false)


   const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();  
    e.stopPropagation(); 
    if (loading) return;

    setLoading(true) 
    
    const result = await toggleWishList(gameID)
    if (result.success) {
      setIsWished(result.isAdded) 
    }
    
    setLoading(false) 
  }

  if (loading) return <div className="animate-pulse bg-white/10 w-8 h-8 rounded-full" />

  return (
    <button onClick={handleToggle} className={`rounded-xl transition-all w-8 h-8 cursor-pointer`}
    aria-label={`Add ${title} to wishlist`}>
      {isWished ? (
        <Star className=" text-yellow-400 fill-yellow-400 w-8 h-8" /> 
      ) : (
        <Star className=" text-yellow-400 w-8 h-8" />
      )}
    </button>
  )
}