"use server"
import { getServerSession } from "next-auth"
import { authConfig } from "../configs/auth";
import { prisma } from "@/lib/prisma"; 

export default async function AddToLibrary(game_id: number) {
    const session = await getServerSession(authConfig);

    if(!session?.user?.email){
        return {error: "Not authorized"};
    }

    try{
        const game = await prisma.game.findUnique({
            where:{
                id: game_id,
            },
            select:{
                price_eur: true
            }
        })
        if(!game){
            return {error: "Game is not found"};
        }
        if(Number(game.price_eur) !== 0){
             return {error: "Game is not free"};
        }
        const newGame = await prisma.library.create({
            data:{
               game_id: game_id,
               user_id: Number(session.user.id),
               purchase_price_eur: game.price_eur, 
            }
        })
        if(!newGame){
             return {error: "Game is not added"};
        }
        return {success: "Game is added on your library!"}
    }catch(error){
        return {error: "Functional error"};
    }
}