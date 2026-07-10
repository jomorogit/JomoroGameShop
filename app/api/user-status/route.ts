import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/configs/auth';
import { prisma } from '@/lib/prisma';
import { Select } from 'radix-ui';

export async function GET() {
    const session = await getServerSession(authConfig);
    if(!session?.user?.email){
        return NextResponse.json({ cart: [], wishlist: [], library: []});
    }

    const user = await prisma.user.findUnique({
        where:{
            email: session.user.email
        },
        select:{
            id: true
        }
    })
    if(!user){
       return NextResponse.json({ cart: [], wishlist: [], library: []});
    }

    const [cart, wishlist, library] = await Promise.all([
        prisma.cart.findMany({
            where:{
                user_id: user.id,
            },
            select:{
                game_id: true
            }
        }),
        prisma.wishlist.findMany({
            where:{
                user_id: user.id,
            },
            select:{
                game_id: true
            }
        }),
        prisma.library.findMany({
            where: {
                user_id: user.id,
            },
            select:{
                game_id: true,
            }
        })
    ])

    return NextResponse.json({
        //obg to array
        cart: cart.map((item) => item.game_id), 
        library: library.map((item) => item.game_id),
        wishlist: wishlist.map((item) => item.game_id),
    })

}
