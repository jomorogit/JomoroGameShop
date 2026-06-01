import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/configs/auth";

export async function GET(
   request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authConfig);
    
    try {
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        const { id } = await params; 
        const gameId = Number(id);
        
        if (!gameId || isNaN(gameId)) {
            return NextResponse.json({ error: 'Invalid or missing Game ID' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(session.user.id),
                email: session.user.email,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 }); // 404 вместо 401
        }

        
        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        });

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 }); // 404 вместо 401
        }

       
        const dataToSend = {
            title: game.title,
            price: game.price_eur,     
            game_img: game.card_img,
            balance: user.balance_eur  
        };

       
        return NextResponse.json(dataToSend, { status: 200 });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}