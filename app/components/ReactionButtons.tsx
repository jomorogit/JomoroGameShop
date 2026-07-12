'use client'
import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { SetReaction } from '../action/newComment';
import { useToast} from './Toast';
import { useSession } from "next-auth/react"

interface ReactionButtonsProps {
    reviewId: number;
    initialReaction: "LIKE" | "DISLIKE" | null;
}

export default function ReactionButtons({ reviewId, initialReaction }: ReactionButtonsProps) {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isLike, setIsLike] = useState(initialReaction === 'LIKE');
    const [isDislike, setIsDislike] = useState(initialReaction === 'DISLIKE');
    const { showToast } = useToast();
    const slug = typeof window !== 'undefined' ? window.location.pathname : "";


    const handleReaction = async (type: 'LIKE' | 'DISLIKE' | 'NONE') => {
        setIsLoading(true);
        
        if (!session?.user?.email) {
            showToast(" Sign in to leave a reaction");
            setIsLoading(false);
            return;
        }

        // Определяем, что отправляем на сервер 
        const val = type === 'LIKE' ? true : type === 'DISLIKE' ? false : null;
        
        const res = await SetReaction(val, reviewId, slug);

        if (res?.error) {
            showToast("⚠️ Error saving reaction");
            // Откатываем UI к начальному состоянию при ошибке
            setIsLike(initialReaction === 'LIKE');
            setIsDislike(initialReaction === 'DISLIKE');
        } else {
            showToast("Reaction updated");
        }
        
        setIsLoading(false);
    };

    return (
        <div className='flex ml-2 h-14 sm:h-auto mt-2 max-h-16'>
            {/* Кнопка Like */}
            <button 
                className={`flex justify-center w-[50%] sm:w-auto items-center mr-8 border-2 border-[#663a81] rounded-md p-2 cursor-pointer transition-colors
                ${isLike ? 'bg-green-700' : 'bg-transparent' }`}
                onClick={() => {
                    const nextState = !isLike;
                    setIsLike(nextState);
                    setIsDislike(false);
                    handleReaction(nextState ? 'LIKE' : 'NONE');
                }}
                disabled={isLoading}
            >
                <span className='text-xl mr-2'>Yes</span>
                <ThumbsUp size={24} color={isLike ? "white" : "#663a81"} /> 
            </button>
            
            {/* Кнопка Dislike */}
            <button 
                className={`flex items-center justify-center border-2 w-[50%] sm:w-auto border-[#663a81] rounded-md p-2 cursor-pointer transition-colors
                ${isDislike ? 'bg-red-700' : 'bg-transparent' }`}
                onClick={() => { 
                    const nextState = !isDislike;
                    setIsDislike(nextState);
                    setIsLike(false);
                    handleReaction(nextState ? 'DISLIKE' : 'NONE');
                }}
                disabled={isLoading}
            >
                <span className='text-xl mr-2'>No</span>
                <ThumbsDown size={24} color={isDislike ? "white" : "#663a81"} />
            </button>

          
        </div>
    );
}