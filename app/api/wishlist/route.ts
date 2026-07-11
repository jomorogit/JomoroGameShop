import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/configs/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authConfig);

        if (!session?.user?.email) {
            return NextResponse.json({ wishlist: [] });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ cart: [], wishlist: [], library: [] });
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { user_id: user.id },
            include: {
                game: {
                    select: { id: true }
                }
            }
        });

    
        return NextResponse.json({
            games: wishlist.map(item => ({
                ...item.game,
                wishlist: item.game.id
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Wishlist fetch error:', error); 
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}