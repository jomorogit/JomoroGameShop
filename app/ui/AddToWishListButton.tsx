'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { WishList, toggleWishList} from '../action/wishList'

interface WishlistButtonProps {
  gameID: number
}

export default function AddToWishList({ gameID }: WishlistButtonProps) {
   const [isWished, setIsWished] = useState<boolean | null>(null)
   const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      const status = await WishList(gameID)
      setIsWished(status)
      setLoading(false)
    }
    checkStatus()
  }, [gameID])


  const handleToggle = async () => {
    setLoading(true) 
    

    const result = await toggleWishList(gameID)
    
    if (result.success) {
      setIsWished(result.isAdded) 
    }
    
    setLoading(false) 
  }

  if (loading) return <div className="animate-pulse bg-white/10 w-full md:w-50 h-10 rounded-full" />
  return (
    <button
    onClick={handleToggle}
    className={`p-3 rounded-xl transition-all min-w-30 w-full md:w-50 ${
        isWished ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
      }`}
    >{isWished ? 'In Wishlist' : 'Add to Wishlist'}</button>
  )
}
