// import { NextResponse } from 'next/server';
// import { prisma } from "@/lib/prisma"; 
// import { getServerSession } from "next-auth";
// import { authConfig } from "../../configs/auth";
// import { revalidatePath } from "next/cache";
// export async function GET() {

//   const session = await getServerSession(authConfig);

//   if (!session?.user || !session.user.id) {
//     return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
//   }

//   try {
  
//     const cartCount = await prisma.cart.count({
//       where: {
//         user_id: Number(session.user.id), 
//       },
//     });

//     // 3. Возвращаем успешный ответ даже если там 0 товаров
//     revalidatePath("/", "layout");
//     return NextResponse.json(cartCount); 
    
//   } catch (error) {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }