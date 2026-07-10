"use server"
import { getServerSession } from "next-auth"
import { authConfig } from "../configs/auth";
import { prisma } from "@/lib/prisma"; 
import { revalidateTag } from 'next/cache';
import { revalidatePath } from "next/cache";
export async function AddToCart(gameID: number) {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) return { error: "Unauthorized" };
    try{
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) return { error: "User not found" };

        
        // Нам нужно найти строку, где совпадает и Юзер, и Игра
        const existingEntry = await prisma.cart.findFirst({
            where: {
                user_id: user.id,
                game_id: gameID
            }
        });

        if(existingEntry){
            console.log("Game is already on cart");
        }else{
             await prisma.cart.create({
                data: {
                    user_id: user.id,
                    game_id: gameID
                }
            });
            console.log(`Game ${gameID} added to cart`);
        
        }

        // revalidatePath("/", "layout"); 
        revalidateTag('user-data', {});
        
        return { success: true, isAdded: !existingEntry };
    }catch(error){
        console.error("Wishlist Error:", error);
        return { error: "Internal server error" };
    }
}

export async function GetAllPrice() {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) return { error: "Unauthorized" };
    
    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return { error: "User not found" };

        // Получаем все записи из корзины текущего пользователя
        const cartItems = await prisma.cart.findMany({
            where: { user_id: user.id },
            include: {
                game: {
                    select: { price_eur: true }
                }
            }
        });

        const totalSum = cartItems.reduce((acc, item) => {
            // Конвертируем Decimal в Number, так как Prisma возвращает объект
            const price = Number(item.game?.price_eur || 0);
            return acc + price;
        }, 0);

        return { success: true, total: totalSum }; 

    } catch (error) {
        console.error("Total Price Error:", error);
        return { error: "Internal server error", total: 0 };
    }
}

export async function RemoveGame(id: number) {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) return { error: "Unauthorized" };

    try{
         const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) return { error: "User not found" };

         const existingEntry = await prisma.cart.findFirst({
            where: {
                user_id: user.id,
                game_id: id
            }
        });
        if(existingEntry){
            await prisma.cart.deleteMany({
                where: {
                    user_id: user.id,
                    game_id: id
                }
            })
             console.log("Удалено!");
        }
        // revalidatePath("/cart", "layout");
         revalidateTag('user-data', {}); 
        
        return { success: true, isAdded: !existingEntry };

    }catch(error){
      console.error("Remove Error:", error);
        return { error: "Internal server error" };
    }
}

export async function CartState(gameID: number) {
     const session = await getServerSession(authConfig);  

    if(!session?.user?.email){
        return null;
    }
    try{
        const CartOfUser = await prisma.user.findUnique({
            where: {
                email: session?.user?.email
            },
            select: {
                    cart:{
                        where:{
                            game_id: gameID
                        }
                    }
            }
        });
        if(CartOfUser?.cart.length ?? 0){
            return true; 
        } else{
            return false;
        }

        
       
    }catch(error){
        console.log("Error", error);
        return false; // Если нашли игру в базе, возвращаем false
    }
}