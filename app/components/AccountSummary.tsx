    import Image from "next/image"
    import Cart from "../icons/cart.svg"
    import Link from "next/link"
    import AccountProfileLink from "./AccountProfileLink"
    import { getServerSession } from "next-auth"
    import { authConfig } from "../configs/auth";
    import { prisma } from '@/lib/prisma'; 
    import AccountProfileName from "./AccountProfileName"
    export default async function Account() {
    const session = await getServerSession(authConfig);

    let currentBalance = "0.00"; 
    let cartCounter = 0; 

    if (session?.user?.email) {
    const userFromDb = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { balance_eur: true, id: true } 
    });

    if (userFromDb) {
        currentBalance = Number(userFromDb.balance_eur || 0).toFixed(2);
        
        const cartCount = await prisma.cart.count({
            where: {
                user_id: userFromDb.id, 
            },
        });
        cartCounter = cartCount;
    }
}


        return (
            <div className="fixed top-5 right-[4%] z-70 flex justify-end">
                <div className="w-16 md:w-fit h-16 md:h-22 rounded-2xl flex lg:p-4  items-center md:pr-2 shadow-2xl justify-center md:justify-normal bg-[#23122E] border-2 border-[#9343E7] md:border-0">
                    
                    {/* Корзина */}
                    <Link href="/cart" className="relative md:p-2 group transition-transform hover:scale-110 mr-4 hidden md:block">
                        {/* Бейдж с числом*/}
                        {cartCounter > 0 && (
                        <div className="absolute -top-1 -right-1 
                                        bg-red-600 text-white 
                                        text-[14px] font-bold 
                                        w-6 h-6 
                                        flex justify-center items-center 
                                        rounded-full 
                                        border-2 border-[#1A0B25] {/* Цвет фона вашего сайта */}
                                        shadow-lg">
                            <span>{cartCounter}</span>
                        </div>
                        )}
                        {/* Иконка корзины 🛒 */}
                        <Image
                            src={Cart} 
                            alt="cart" 
                            width={40} 
                            height={40} 
                            className="group-hover:opacity-80 transition-opacity"
                        />
                    </Link>

                    {/* Инфо и Аватар */}
                    <div className="flex items-center gap-4 sm:border-white/10 md:border-l">
                        <div className="flex flex-col items-end ml-2 hidden md:block">
                            {/* Показываем имя пользователя или "Guest" */}

                            <AccountProfileName/>

                            
                            <Link href="/account/addmoney" className="cursor-pointer font-inder text-lg text-white font-bold">
                                {currentBalance}€
                            </Link>
                        </div>
                        
                        {/* Логика отображения аватара */}
                    <AccountProfileLink/>
                    </div>
                </div>
            </div>
        )
    }