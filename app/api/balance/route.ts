import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authConfig } from "../../configs/auth";

export async function GET() {

  const session = await getServerSession(authConfig);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authorized ' }, { status: 401 });
  }

  try {
    // Ищем пользователя в БД по email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        balance_eur: true, 
      },
    });

  
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    
    return NextResponse.json({ 
      balance: user.balance_eur ?? 0, // Если в БД null, вернет 0
    });
    
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}