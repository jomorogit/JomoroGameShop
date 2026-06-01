"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authConfig } from "../configs/auth";
import { getServerSession } from "next-auth"
import { ISCommentData } from "@/lib/types";
import { ReactionType } from '@prisma/client';

export async function newComment(formData: ISCommentData) {
    try {
        // 1. Проверка сессии
        const session = await getServerSession(authConfig);

        if (!session?.user?.email) {
            return { error: "Unauthorized" };
        }

        // 2. Валидация входных данных
        if (!formData.comment || formData.comment.trim() === "") {
            return { error: "Enter your comment text" };
        }
        if (formData.vote === null) {
            return { error: "Your vote is not found" };
        }

        // 3. Поиск пользователя в БД
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true } 
        });

        if (!user) {
            return { error: "User not found" };
        }

        // 4. Проверка существования игры
        const game = await prisma.game.findUnique({
            where: { id: formData.game_id }
        });

        if (!game) {
            return { error: "Game is not found" };
        }

        // 5. Создание записи в БД
        const newCom = await prisma.review.create({
            data: {
                game_id: formData.game_id,
                user_id: user.id,
                content: formData.comment.trim(),
                is_recommended: formData.vote,
            }
        });

        if (newCom) {
            revalidatePath(formData.slug); 
            
            return { success: "Review has been created" };
        } else {
            return { error: "The review was not created" };
        }

    } catch (error) {
        return { error: "Request error: " + error};
    }
}

export async function SetReaction(reaction: boolean | null, reviewId: number, slug: string ) {
    try{
        // Валидация
        const session = await getServerSession(authConfig);
        if(!session?.user.email){
            return {error: "⚠️Sign in to comment"};
        }
        if(reaction == undefined){
            return {error: "⚠️Reaction is undefined"};
        }
        

        // Есть ли реакция от этого юзера
        const isReaction = await prisma.reviewReaction.findUnique({
            where: {
                review_id_user_id: {
                review_id: Number(reviewId), 
                user_id: Number(session.user.id),
                },
            },
            });
        
        // тип реакции от enum
         const type = reaction ? ReactionType.LIKE : ReactionType.DISLIKE;


            if(!isReaction && (reaction === true || reaction === false)){
                await prisma.reviewReaction.create({
                    data:{
                       review_id: Number(reviewId),
                       user_id: Number(session.user.id),
                       type: type, 
                    }
                })
                revalidatePath(slug); 
                return { success: "Reaction created" };
            }

            if (isReaction && reaction === null) {
                    await prisma.reviewReaction.delete({
                        where: {
                            review_id_user_id: {
                                review_id: Number(reviewId),
                                user_id: Number(session.user.id),
                            }
                        }
                    });
                revalidatePath(slug); 
                return { success: "Reaction removed" };
            }

            // логика изменения
            // если реакция есть
            if(isReaction && (reaction === true || reaction === false)){
                        await prisma.reviewReaction.update({
                            where: {
                                review_id_user_id: {
                                review_id: Number(reviewId),
                                user_id: Number(session.user.id),
                                    },
                                }, 
                                data: {
                                    type: type, 
                                },
                            });
                            revalidatePath(slug); 
                            return { success: "Reaction updated" }; 
            }


    }catch(error){
        return {error: error}
    }
}

export async function GetUserReaction(reviewId: number) {
    try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
        return { error: "The user is not authorized" };
    }

    const res = await prisma.reviewReaction.findUnique({
        where: {
            review_id_user_id: {
                review_id: Number(reviewId), 
                user_id: Number(session.user.id),
            },
        },
        select: { type: true } 
    });

    return { success: res?.type || null };

    } catch (error) {
        return { error: "Failed to fetch reaction" }; 
    }
}