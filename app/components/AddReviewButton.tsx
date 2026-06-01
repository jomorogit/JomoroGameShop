'use client'
import React, { useState } from 'react'
import { useSession } from "next-auth/react"
import Image from 'next/image';
import Avatar from "@/app/icons/avatar.webp"
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ISCommentData } from '@/lib/types';
import { newComment } from '../action/newComment';
import { useToast} from './Toast';

interface AddReviewButtonProps {
  gameId: number;
}

export default function AddReviewButton(gameID: AddReviewButtonProps) {
    const [isCommmenting , setIsCommenting] = useState(false);
    const [isButtonUpActive, setIsButtonUpActive] = useState(false);
    const [isButtonDownActive, setIsButtonDownActive] = useState(false);
    const { showToast } = useToast();
    const [validation, setValidation] = useState("");
    const { data: session, status } = useSession();

     const [formData, setFormData] = useState<ISCommentData>({
        comment: "",
        vote: null,
        game_id: gameID.gameId,
        slug: typeof window !== 'undefined' ? window.location.pathname : "",
    });
    
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
        const { name, value } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const clearComment = () => {
        setFormData((prev) => ({
            ...prev,
            comment: ""
        }));
        };
    
    const [idDisable, setIsDisable] = useState(false);
   const [error, setError] = useState<string | null>(null);

      const dataSubmit = async (event: React.FormEvent<HTMLFormElement>) => {   
    event.preventDefault(); // Сначала предотвращаем стандартное поведение
    setIsDisable(true);
    setError(null);

    // 1. Сразу вычисляем значение голоса из локальных стейтов кнопок
    const currentVote = isButtonUpActive ? true : isButtonDownActive ? false : null;

    // 2. Валидация (используем .trim() для удаления лишних пробелов)
    if (!formData.comment.trim()) {
        setError("Enter your comment text");
        setIsDisable(false);
        return;
    }
    if (currentVote === null) {
        setError("Select your vote");
        setIsDisable(false);
        return;
    }
    if (formData.comment.length > 500) {
        setError("You have exceeded the 500 character limit");
        setIsDisable(false);
        return;
    }

    try {
        // 3. Создаем локальную копию данных для отправки 
        // Здесь мы принудительно устанавливаем актуальный vote и обрезанный текст
        const finalData: ISCommentData = {
            ...formData,
            vote: currentVote,
            comment: formData.comment.trim()
        };

        console.log("Данные, которые РЕАЛЬНО уходят на сервер:", finalData);

        const result = await newComment(finalData);

        if (result?.error) {
            showToast(`❌ ${result.error}`);
            // В случае ошибки сервера возвращаем кнопку в рабочее состояние
            setIsDisable(false); 
        }

        if (result?.success) {
            showToast(`✅ ${result.success}`);
            // Сбрасываем всё только при успехе
            setIsCommenting(false);
            setFormData(prev => ({ ...prev, comment: "" }));
            setIsButtonUpActive(false);
            setIsButtonDownActive(false);
            setIsDisable(false);
        }

    } catch (error) {
        showToast("⚠️ Something went wrong");
        setIsDisable(false);
    }
}

     const date = new Date().toLocaleDateString('en-Us', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });


  return (
    <div>
        <button className='mb-4 w-full h-auto p-2 rounded-xl border-4 border-[#3D234D] text-purple-800 text-2xl cursor-pointer hover:border-purple-700 hover:text-purple-700 transition-all' 
        onClick={() => setIsCommenting(true)}>
            + Add Review
        </button>

        {isCommmenting && (
            <form onSubmit={dataSubmit} className='w-full border-4 border-[#3D234D] h-auto rounded-xl p-4'>
                {/* Вся верхняя часть */}
                <div className='flex justify-between mb-6'>
                {/* Верхняя-левая часть часть добавления коментария */}
                <div className='flex items-center'>
                    {/* Аватарка */}
                    <div>
                        
                    
                        <Image
                            referrerPolicy="no-referrer"
                            src={session?.user.image || Avatar} 
                            alt="user avatar" 
                            width={60} 
                            height={60} 
                            // key заставит Image обновиться при смене картинки
                            key={session?.user?.image} 
                            className="rounded-2xl object-cover hover:ring-2 ring-blue-500 transition-all"
                        />
                
                      

                    </div>
                   
                     {/* Username and data */}
                    <div className='flex flex-col ml-4'>
                        <p className='text-3xl'>{session?.user?.name}</p>
                        <span className='text-gray-400'>{date}</span>
                    </div>

                </div>

                 {/* Верхняя-правая часть добавления коментария*/}
                 {/* Кнопки лайк и дизлайк */}
                <div className='flex'>
                    <button type="button" className={`flex mr-6 cursor-pointer rounded-md pr-2 pl-2 border-2 border-green-600 items-center
                         ${isButtonUpActive ? 'bg-green-700' : 'bg-green-950'}`} 
                          onClick={() => {
                            setIsButtonUpActive(true);
                            setIsButtonDownActive(false);
                            console.log("Recommended");
                        }}
                        >
                        {isButtonUpActive ? <ThumbsUp size={24} color="#052e16"/> : <ThumbsUp size={24} color="green"/>}
                        
                        <span className='ml-2 text-xl'>Recommended</span>
                    </button>

                    <button type="button" className={`flex rounded-md cursor-pointer pr-2 pl-2 border-2 border-red-600 items-center
                         ${isButtonDownActive ? 'bg-red-700' : 'bg-red-950'}`} 
                        onClick={() => {
                            setIsButtonDownActive(true);
                            setIsButtonUpActive(false);
                            console.log("Not Recommended");
                        }}
                        >
                      {isButtonDownActive ? <ThumbsDown size={24} color="#450a0a"/> : <ThumbsDown size={24} color="red"/>}
                       <span className='ml-2 text-xl'>Not Recommended</span>
                    </button>
                </div>

            </div> 

            {/* Инпут */}
            <div className="w-full h-auto">
                <textarea 
                className='w-full h-auto min-h-40 rounded-xl border-3 border-purple-800 p-3 text-lg 
                focus:outline-none focus:ring-2 focus:ring-purple-700 transition-all 
                resize-none' // Добавил resize-none, чтобы пользователь не мог вручную менять размер, если это не нужно
                placeholder='Write your review...'
                 name="comment"      
                value={formData.comment}
                 onChange={handleChange}
                 required
                />
            </div>
            
            {error && (
                <div className='w-full h-auto text-2xl text-red-500 mt-2 ml-4'>
                    <span>{error}</span>
                </div>
            )}

            <div className='w-full h-auto mt-4 flex justify-end'>
                <button className='cursor-pointer w-auto h-auto rounded-xl bg-red-950 border-red-600 p-2 text-2xl pr-4 pl-4 border-2 min-w-30 mr-6'
                onClick={() =>{
                    setIsCommenting(false);       
                    clearComment();               
                    setIsButtonUpActive(false);   
                    setIsButtonDownActive(false); 

                }}
                type="button"
                >Cancel</button>



                <button className='cursor-pointer w-auto h-auto rounded-xl bg-green-950 border-green-600 border-2 p-2 text-2xl pr-4 pl-4 min-w-50'
                type="submit"
                disabled={idDisable}
                >Publish</button>
            </div>      
        </form>

          
        )}
        
        
    </div>
  )
}
