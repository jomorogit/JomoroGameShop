import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/configs/auth";

export async function GET() {
    const session = await getServerSession(authConfig);  
    
    try{
        if(!session?.user?.email){
           return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

      const user = await prisma.user.findUnique({
        where:{
            id: Number(session.user.id),
        }
      })
       if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 }); 
        }
        
      const cart = await prisma.cart.findMany({
        where: {
            user_id: user.id
        },
        include: {
            game: {
                select: {
                    price_eur: true,
                }
            }
        }
        
        })

        if(!cart){
            return NextResponse.json({ error: 'Games not found' }, { status: 404 }); 
        }

        let sum = 0;
        for(let i = 0; i<cart.length; i++){
            sum += Number(cart[i].game.price_eur || 0);
        }
        
        return NextResponse.json({summary: sum}, {status: 200});
    }catch(error){
        console.log(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}