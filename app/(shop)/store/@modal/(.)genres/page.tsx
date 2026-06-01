"use client"
import React, { useEffect } from 'react'
import { useRouter } from "next/navigation";

export default function GenresModal() {
  const router = useRouter();
  
  const close = () => router.back();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={close}
    >
      <div 
        className="bg-[#251642] p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-[450px]"
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-2xl text-white mb-4">Select Genres</h2>
        <p className="text-gray-300">Is not supported yet...</p>
        
        <button 
          onClick={close}
          className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}