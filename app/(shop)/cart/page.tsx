import CartList from '@/app/components/CartList';
import CheckoutButton from '@/app/ui/CheckoutButton';
import CartSummary from '@/app/components/CartSummary';
import CartSummuryData from "@/app/components/CartSummuryData";
export default function Cart(){
    return(
        <div className='mt-20 pl-4 pr-4 lg:pl-10 lg:pr-10 w-full mr-10'>   
            <div className='mb-6 w-full flex justify-center lg:justify-start'>
                {/* <h1 className='text-3xl'>Cart</h1> */}
            </div>
        
       <div className="lg:flex lg:justify-between lg:items-start w-full">
                
               <CartList/>
                
                {/* Тотальная сумма */}
                <div className="bg-[#23122E] w-full lg:w-[28%] h-auto rounded-2xl p-4">
                    <div className='w-full flex justify-center mb-8'>
                        <h1 className='text-3xl'>Order Summary</h1>
                    </div>
                               {/* price and name */}
                                <CartSummuryData/>
                    
                    <div className='diviser w-full bg-[#3B2A46] h-2 rounded-2xl mb-8'></div>

                    <div className=' flex justify-between'>
                        <span>Total:</span>
                        <CartSummary/>
                    </div>
                  
                    <div className='flex justify-center mt-10'>
                        {/* Создаем компонент клиентский */}
                        <CheckoutButton/>
                    </div>
                </div>
                {/* Phone */}
                <div className='lg:hidden w-full h-20'></div>
        </div>
        </div>
    )
}