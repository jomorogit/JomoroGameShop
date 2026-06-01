'use client'
import React from 'react'
import Link from 'next/link'
import { useState } from 'react';
export interface LinkProps {
  id: number; 
  title: string;
}
export default function OSRequestLinks({ id, title}: LinkProps) {
     // Функция для создания красивого текста после ID
    const createSlug = (str: string) => {
        return str
            .toLowerCase()
            .replace(/\s+/g, '-')     
            .replace(/[^\w-]+/g, ''); 
    };

    const gameSlug = createSlug(title);

   

     const finalHref1 = `/${id}-${gameSlug}/system-request/windows`;
      const finalHref2 = `/${id}-${gameSlug}/system-request/mac-os`;
       const finalHref3 = `/${id}-${gameSlug}/system-request/linux`;


       const [step, setStep] = useState<number>(1);
      
  return (
    <div className='mb-6'>  
                            
                            <h1 className='text-3xl mb-6'>System Request</h1>
        {/* links */}
                                <div className="bg-[#2E183C] p-4 pt-0 rounded-2xl">
                                     <div className='w-full bg-[#8551a5] h-1 mb-4 rounded-2xl'></div>

                                     <div className='flex justify-between'>
                                    <Link href={finalHref1} className={`font-inder text-xl transition-all duration-500 ${step === 1 ? 'text-[#8551a5]' : 'text-white'}`} onClick={() => setStep(1)}>Windows</Link>
                                    <Link href={finalHref2} className={`font-inder text-xl transition-all duration-500 ${step === 2 ? 'text-[#8551a5]' : 'text-white'}`} onClick={() => setStep(2)}>MacOS</Link>
                                    <Link href={finalHref3} className={`font-inder text-xl transition-all duration-500 ${step === 3 ? 'text-[#8551a5]' : 'text-white'}`} onClick={() => setStep(3)}>Linux</Link>
                                    </div>
                                </div>
                                
                                {/* bar
                                <div className="w-full h-4  flex justify-between bg-[#656565] mt-2 rounded-xl">
                                        <div className={`w-[15%] rounded-xl h-full transition-all duration-500 ${step === 1 ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>
                                        <div className={`w-[30%] rounded-xl h-full transition-all duration-500 ${step === 2 ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>
                                        <div className={`w-[15%] rounded-xl h-full transition-all duration-500 ${step === 3 ? 'bg-[#8551a5]' : 'bg-transparent'}`}></div>

                                </div> */}
    </div>
  )
}
