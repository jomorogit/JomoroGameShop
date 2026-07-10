import CartCardCreator from '@/app/components/CartItem';
import { prisma } from "@/lib/prisma"; 
import { authConfig } from "../../configs/auth";
import { getServerSession } from "next-auth";
import Link from 'next/link';
import CheckoutButton from '@/app/ui/CheckoutButton';

export default async function Cart() {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
        return <div className="p-10 text-white">Please log in to your account</div>;
    }
    
    const userId = Number(session.user.id);

    // Выполняем запрос к БД один раз, без лишних вызовов Server Actions
    const games = await prisma.game.findMany({
        where: { 
            cart: { some: { user_id: userId } }
        },
        orderBy: { id: 'desc' },
        select: {
            id: true,
            title: true,
            price_eur: true,
            card_img: true,
            main_img: true,
            rating_summary: true,
            release_date: true,
            game_genres: { 
                select: { genre: { select: { name: true } } } 
            },
            wishlist: { 
                where: { user_id: userId },
                select: { added_at: true }
            }
        }
    });

    if (games.length === 0) {
        return (
            <div className="p-10 text-white text-center text-3xl mt-50 flex flex-col items-center">
                Your cart is empty
                <Link href="/store" className='block border-2 border-purple-800 rounded-2xl w-60 p-2 mt-4'>Explore Shop</Link>
            </div>
        );
    }

    // Считаем сумму локально — это происходит мгновенно
    const totalPrice = games.reduce((acc, game) => acc + Number(game.price_eur || 0), 0);

    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };    

    return (
        <div className='mt-20 pl-4 pr-4 lg:pl-10 lg:pr-10 w-full mr-10'> 
            <div className="lg:flex lg:justify-between lg:items-start w-full">
                <div className="lg:w-[70%] h-full">
                    {games.map((game, index) => (
                        <CartCardCreator 
                            key={game.id}
                            id={game.id}
                            order={index + 1}
                            title={game.title}
                            rating_summary={Number(game.rating_summary || 0)}
                            gengres={game.game_genres}
                            release_date={game.release_date ? new Date(game.release_date).toLocaleDateString('de-DE') : "TBA"}
                            added_at={game.wishlist[0]?.added_at ? new Date(game.wishlist[0].added_at).toLocaleDateString('de-DE', dateOptions) : "Recently"}
                            price={Number(game.price_eur || 0)} 
                            image={game.card_img || game.main_img || '/img/placeholder.webp'} 
                        />
                    ))}
                </div>
                
                <div className="bg-[#23122E] w-full lg:w-[28%] h-auto rounded-2xl p-4">
                    <div className='w-full flex justify-center mb-8'>
                        <h1 className='text-3xl'>Order Summary</h1>
                    </div>
                    
                    {games.map((game) => (
                        <div key={game.id} className="flex justify-between mb-8">
                            <span>{game.title}</span>
                            <span className="whitespace-nowrap ml-5">{Number(game.price_eur || 0)} €</span>
                        </div>
                    ))}

                    <div className='w-full bg-[#3B2A46] h-2 rounded-2xl mb-8'></div>

                    <div className='flex justify-between'>
                        <span>Total:</span>
                        <span>
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPrice)}
                        </span>
                    </div>
                    
                    <div className='flex justify-center mt-10'>
                        <CheckoutButton/>
                    </div>
                </div>
            </div>
        </div>
    );
}