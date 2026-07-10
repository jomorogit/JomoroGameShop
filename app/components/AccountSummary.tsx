    import Image from "next/image"
    import Cart from "../icons/cart.svg"
    import Link from "next/link"
    import AccountProfileLink from "./AccountProfileLink"
    import { getServerSession } from "next-auth"
    import { authConfig } from "../configs/auth";
    import { prisma } from '@/lib/prisma'; 
    import AccountProfileName from "./AccountProfileName"
    import { unstable_cache } from 'next/cache';

    const getUserData = unstable_cache(
        async (email: string) => {
            const user = await prisma.user.findUnique({
            where: { email },
            select: { balance_eur: true, id: true }
            });
            
            if (!user) return null;

            const cartCount = await prisma.cart.count({ where: { user_id: user.id } });
            return { balance: user.balance_eur, cartCount };
        },
        ['user-header-data'], // Ключ кэша
        { tags: ['user-data'], revalidate: 60 } // Кэшируем на 60 секунд
        );

    export default async function Account() {
    const session = await getServerSession(authConfig);
    const userData = session?.user?.email ? await getUserData(session.user.email) : null;

        return (
            <div className="fixed top-5 right-[4%] z-70 flex justify-end">
                <div className="w-16 md:w-fit h-16 md:h-22 rounded-2xl flex lg:p-4  items-center md:pr-2 shadow-2xl justify-center md:justify-normal bg-[#23122E] border-2 border-[#9343E7] md:border-0">
                    
                    {/* Корзина */}
                    <Link href="/cart" className="relative md:p-2 group transition-transform hover:scale-110 mr-4 hidden md:block">
                        {/* Бейдж с числом*/}
                        {(userData?.cartCount ?? 0) > 0 && (
                        <div className="absolute -top-1 -right-1 
                                        bg-red-600 text-white 
                                        text-[14px] font-bold 
                                        w-6 h-6 
                                        flex justify-center items-center 
                                        rounded-full 
                                        border-2 border-[#1A0B25] {/* Цвет фона вашего сайта */}
                                        shadow-lg">
                            <span>{userData?.cartCount}</span>
                        </div>
                        )}
                        {/* Иконка корзины */}
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
                                {userData ? Number(userData.balance).toFixed(2) : "0.00"}€
                            </Link>
                        </div>
                        
                        {/* Логика отображения аватара */}
                    <AccountProfileLink/>
                    </div>
                </div>
            </div>
        )
    }