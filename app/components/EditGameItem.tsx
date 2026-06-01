'use client'
import Link from 'next/link';
import { DeleteGame } from '../action/deleteGame';
import { formatPrice, generateGameHrefAdmin } from '@/app/utils/formatters';
export interface GameCardProps {
  id: number; 
  title: string;
  price: number;
  image: string;
}

export default function EditGameCard({ id, title, price, image }: GameCardProps) {
   
     const formattedPrice = formatPrice(price);
       const finalHref = generateGameHrefAdmin(id, title);
   
    return ( 
        <div className='flex'>
           <Link href={finalHref} className="w-80 mb-10 block hover:scale-105 transition-transform">
            
            <div 
                className="img h-80 rounded-t-lg bg-cover bg-center" 
                style={{ backgroundImage: `url(${image})` }}
            ></div>
            
            <div className="p-3 bg-[#251642] rounded-b-lg text-white border-t border-white/5">
                <p className="font-bold truncate" title={title}>{title}</p>
                <p className="text-sm font-medium">{formattedPrice}</p>
            </div>
            
        </Link> 
       
        </div>
        
    );
}