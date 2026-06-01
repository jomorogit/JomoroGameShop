'use client'
import Link from 'next/link';
import Image from 'next/image';
import { RemoveGame } from '../action/cart';
import { formatPrice, generateGameHref } from '@/app/utils/formatters';
export interface GameCardProps {
  id: number;
  title: string;
  price: number;
  release_date?: string | null;
  image: string;
  rating_summary: number;
  order?: number;
  added_at?: string;
  gengres?: {
    genre: {
      name: string;
    };
  }[];
}


export default function CartCardCreator({ id, title, price, image, gengres, rating_summary, release_date, added_at, order}: GameCardProps) {
   
   const formattedPrice = formatPrice(price);
   const finalHref = generateGameHref(id, title);
   

     const handleRemoveFromCart = async () => {
        try {
          const result = await RemoveGame(id);
          if (result.success) {
            console.log("removed from cart")
          }
        } catch (err) {
          console.error("Failed to add:", err);
        }
      };
    
    return (
        // main container
        <div className='w-full flex bg-[#23122E] h-auto items-center p-2 mb-8 rounded-2xl'>
            {/* id */}
            <div className='md:m-4 m-1 mb-2 h-full self-end '>
                <p className='text-xl'>{order}</p>
            </div>

             

            <div className='w-full h-auto border-l-2 border-gray-500 md:pl-6 pl-3'>
            {/* content */}
            <div className='flex w-full justify-between'>
                <div>
                   <Link href={finalHref} className="relative w-40 h-40 md:w-50 md:h-62.5 shrink-0 overflow-hidden rounded-md block">
                    <Image
                        src={image || ""}
                        alt="game cover"
                        fill // Заполняет весь родительский div
                        className="object-cover" // Магия здесь: картинка обрезается, но не растягивается
                        sizes="150px"
                    />    
                </Link> 
                </div>
                        {/* right part */}
                        <div className='flex p-2 pl-4 md:flex-row flex-col justify-between w-full'>
                            <div className='w-full md:w-[50%] mr-6'>
                                <h1 className='text-xl md:text-2xl'>{title}</h1>
                            </div>

                            <div className=' flex flex-col justify-between'>
                                
                                <div className='md:block hidden'>
                                    <p className='text-[14px] md:text-xl'>Date added: {added_at}</p>
                                    <button onClick={handleRemoveFromCart} className='bg-gray-600 p-1 pl-2 pr-2 cursor-pointer mb-20 rounded-xs'>Remove</button>
                                </div>
                                
                                <div className='p-1 bg-[#3D234D]  md:flex hidden justify-between rounded-xs'>
                                    <div className='flex justify-center items-center mr-4'>
                                        <p className='ml-2'>{formattedPrice}</p>
                                    </div>
                                    

                                    {/* <button className='bg-green-800 p-2 w-32 cursor-pointer hover:bg-green-700 rounded-xs'
                                    // onClick={handleBuyGame}
                                    onClick={() => {
                                      setChoise(true);
                                    }}
                                    disabled={loading}
                                    >Buy</button> */}
                                    <Link href={`/cart/paytype?id=${id}`} className='bg-green-800 p-2 w-32 cursor-pointer hover:bg-green-700 rounded-xs flex justify-center'
                                    >Buy</Link>

                                </div>
                            </div>
                        </div>
                     </div>

                   {/* Для мобилок кнопка купить и убрать покупку */}
                  <div className='md:hidden flex mt-4 w-full justify-between'>
                      
                      {/* 1. Теперь Убрать из покупки будет СЛЕВА */}
                      <div className='w-[30%] max-w-[150px]'>
                          <button onClick={handleRemoveFromCart} className='bg-gray-600 p-1 pl-2 pr-2 h-full w-full cursor-pointer rounded-xl'>Remove</button>
                      </div>

                      {/* 2. А блок с ценой и Buy будет СПРАВА */}
                      <div className='flex p-1 w-[50%] max-w-[220px] bg-[#3D234D] md:hidden rounded-xl justify-between'>
                              {/* Покупка */}
                              <div className='flex justify-center items-center mr-4'>
                                  <p className='ml-2'>{formattedPrice}</p>
                              </div>
                              {/* <button className='bg-green-800 p-3 w-30 cursor-pointer hover:bg-green-700 rounded-xl'>Buy</button> */}
                              <Link href={`/cart/paytype?id=${id}`} className='bg-green-800 p-2 w-32 cursor-pointer rounded-xl items-center hover:bg-green-700 flex justify-center'
                                    >Buy</Link>
                      </div>

                  </div>
            </div>
        </div>
    );
}