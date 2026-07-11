import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/configs/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authConfig);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }
      
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                balance_eur: true, 
                id: true 
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 }); 
        }

        const cartCount = await prisma.cart.count({ 
            where: { user_id: user.id } 
        });
        
        const userData = { 
            balance: Number(user.balance_eur || 0).toFixed(2), 
            cartCount 
        };

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error("API Header Data Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}