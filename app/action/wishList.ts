"use server"
import { getServerSession } from "next-auth"
import { authConfig } from "../configs/auth";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";
export async function WishList(gameID: number) {
     const session = await getServerSession(authConfig);  

    if(!session?.user?.email){
        return null;
    }
    try{
        const wishlistOfUser = await prisma.user.findUnique({
            where: {
                email: session?.user?.email
            },
            select: {
                    wishlist:{
                        where:{
                            game_id: gameID
                        }
                    }
            }
        });
        if(wishlistOfUser?.wishlist.length ?? 0){
            return true; // Если не нашли игру в базе, возвращаем false
        } else{
            return false; // Если нашли игру в базе, возвращаем false
        }

        
       
    }catch(error){
        console.log("Error", error);
        return false; // Если нашли игру в базе, возвращаем false
    }
}

export async function toggleWishList(gameID: number) {
    const session = await getServerSession(authConfig);

    // 1. Проверка авторизации
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        // 2. Ищем юзера и получаем его ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return { error: "User not found" };

        // 3. Ищем запись в вишлисте
        // Нам нужно найти строку, где совпадает и Юзер, и Игра
        const existingEntry = await prisma.wishlist.findFirst({
            where: {
                user_id: user.id,
                game_id: gameID
            }
        });

        if (existingEntry) {
   
    await prisma.wishlist.deleteMany({
        where: {
            user_id: user.id,
            game_id: gameID
        }
    });
    
   

        } else {
            // 5. ДОБАВЛЕНИЕ 
            await prisma.wishlist.create({
                data: {
                    user_id: user.id,
                    game_id: gameID
                }
            });
            console.log(`Game ${gameID} added to wishlist`);
        }

        
        return { success: true, isAdded: !existingEntry };

    } catch (error) {
        console.error("Wishlist Error:", error);
        return { error: "Internal server error" };
    }
}



export async function OnlytoggleWishList(gameID: number) {
    const session = await getServerSession(authConfig);

    // 1. Проверка авторизации 
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        // 2. Ищем юзера и получаем его ID 
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return { error: "User not found" };

        // 3. Ищем запись в вишлисте 
        // Нам нужно найти строку, где совпадает и Юзер, и Игра
        const existingEntry = await prisma.wishlist.findFirst({
            where: {
                user_id: user.id,
                game_id: gameID
            }
        });

        if (existingEntry) {
    await prisma.wishlist.deleteMany({
        where: {
            user_id: user.id,
            game_id: gameID
        }
    });
    }

        revalidatePath("/", "layout");
        return { success: true, isAdded: !existingEntry };

    } catch (error) {
        console.error("Wishlist Error:", error);
        return { error: "Internal server error" };
    }
}

