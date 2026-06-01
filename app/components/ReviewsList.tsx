'use server'
import React from 'react'
import { prisma } from '@/lib/prisma';
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ReactionButtons from './ReactionButtons';
import { authConfig } from "../configs/auth";
import { getServerSession } from "next-auth"
import Image from 'next/image';

interface ReviewsListProps {
  gameId: number;
}

export default async function ReviewsList({ gameId }: ReviewsListProps) {
    const session = await getServerSession(authConfig);
    
    const reviews = await prisma.review.findMany({
        where: {
            game_id: gameId,
        },
        include: { 
            user: {
                select: {
                    name: true,
                    image: true,
                }
            },
            reactions: {
                where: {
                    user_id: session?.user?.id ? Number(session.user.id) : -1,
                },
            },
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    const reactionCounts = await prisma.reviewReaction.groupBy({
        by: ['review_id', 'type'],
        where: {
            review: { game_id: gameId }
        },
        _count: {
            _all: true
        }
    });

    //Делаем фильтрацию того сколько лайков , и сколько диз лайков
    const countsMap = reactionCounts.reduce((acc, item) => {
        if (!acc[item.review_id]) {
            acc[item.review_id] = { LIKE: 0, DISLIKE: 0 };
        }
        if (item.type === 'LIKE' || item.type === 'DISLIKE') {
            acc[item.review_id][item.type] = item._count._all;
        }
        return acc;
    }, {} as Record<number, { LIKE: number; DISLIKE: number }>);
    return (
        <div className='h-auto mt-4'>
            {reviews.length > 0 ? (
                reviews.map((rev) => {
                    // Извлекаем тип реакции из массива (берем первый элемент или null)
                    const currentReaction = rev.reactions[0]?.type || null;
                    // Достаем лайки и дизлайки из нашей карты
                    const likesCount = countsMap[rev.id]?.LIKE || 0;
                    const dislikesCount = countsMap[rev.id]?.DISLIKE || 0;

                    return (
                        <div
                            key={rev.id}
                            className='w-full h-auto bg-[#23122E] border-4 border-[#3D234D] rounded-xl p-4 mb-4'
                        >
                            {/* Top Panel */}
                            <div className='flex items-center justify-between'>
                                <div className='flex'>
                                    <Image 
                                        src={rev.user.image || "/img/placeholder-avatar.webp"} 
                                        alt={`${rev.user.name}'s avatar`}
                                        width={80}
                                        height={80}
                                        className="rounded-xl w-15 h-15 lg:w-20 lg:h-20 object-cover border-2 border-purple-900"
                                    />
                                    <div className='flex flex-col ml-4'>
                                        <p className='text-2xl lg:text-3xl text-white'>{rev.user.name}</p>
                                        <span className='text-gray-400'>
                                            {rev.created_at && new Date(rev.created_at).toLocaleDateString('en-US', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    {rev.is_recommended ? (
                                        <div className="flex lg:mr-6 rounded-md p-4 w-auto lg:w-60 border-2 border-green-600 items-center bg-green-950">
                                            <ThumbsUp size={24} color="green"/>
                                            <span className='ml-2 hidden sm:block text-[16px] lg:text-xl text-white'>Recommended</span>
                                        </div>
                                    ) : (
                                        <div className="flex mr-6 rounded-md p-4 w-auto lg:w-60 border-2 border-red-600 items-center bg-red-950">
                                            <ThumbsDown size={24} color="red"/>
                                            <span className='ml-2 hidden sm:block text-xl text-white'>Not Recommended</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='bg-[#3D234D] w-full rounded-xl h-1 mt-4'></div>

                            {/* Review Content */}
                            <div className='w-full h-auto mt-4'>
                                <p className='ml-2 text-xl text-white'>{rev.content}</p>
                            </div>

                            <p className='ml-2 text-xl mt-8 text-gray-500'>Was this review helpful?</p>

                            <div className='sm:flex justify-between'>
                                <ReactionButtons 
                                reviewId={rev.id} 
                                initialReaction={currentReaction} 
                            />
                            <div className='ml-2 mr-4 mt-2 sm:ml-0 sm:mt-0 text-[16px] sm:text-xl'>
                                 {/* <p>People, found this review helpful: {likesCount}</p>
                                 <p>People, found this review unhelpful: {dislikesCount}</p> */}
                                <p>Helpful: {likesCount}</p>
                                 <p>Unhelpful: {dislikesCount}</p>
                            </div>

                            </div>
                            
                        </div>
                    );
                })
            ) : (
                <div className="text-2xl text-white mt-10 text-center">
                    No reviews yet. Be the first!
                </div>
            )}
        </div>
    );
}