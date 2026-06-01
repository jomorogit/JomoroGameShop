"use client";
import { ChevronDown, ChevronUp} from "lucide-react"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export default function DropList() {
   const router = useRouter();
      const pathname = usePathname();
      const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [sort, setSort] = useState("Default")
  const [isUp, setIsUp] = useState(true);
  //Up - true, Down - false
  const onSelect = (val: string, direction: boolean) => {
  // 1. Берем ТЕКУЩИЕ параметры из URL, чтобы не стереть цену и жанры 
  const params = new URLSearchParams(searchParams.toString());

  // 2. Сразу обновляем локальное состояние (для визуализации в меню)
  setSort(val);
  setIsUp(direction);

  // 3. Определяем направление (простой тернарный оператор вместо функции)
  const dirSuffix = direction ? "Up" : "Down";

  // 4. Формируем полную строку. Используем "val", а не "sort", 
  // так как "sort" еще хранит старое значение!
  const sortFull = `${val}${dirSuffix}`;

  // 5. Записываем в параметры и пушим в роутер
  params.set("sortType", sortFull);
  
  router.push(`${pathname}?${params.toString()}`);
  
  // Закрываем выпадающий список
  setIsOpen(false);
};
  
  return (

    <div className="flex items-center lg:flex">
      <div className="w-full min-h-[50px] lg:w-80 px-4 py-2 bg-[#23122E] mr-4 rounded-md flex items-center pl-4">
        <span className="text-xl mr-2">Sorted by:  {sort} </span>
        {sort !== "Default" && (
          isUp ? <ChevronUp size={25} className="text-gray-400" /> : <ChevronDown size={25} className="text-gray-400" />
        )}
        
        
        
      </div>

      {/* Сортировка */}
      <div className="relative inline-block text-left">
      {/* Кнопка открытия */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#23122E] text-white cursor-pointer px-4 min-h-[50px] py-2 rounded-md bg-[#23122E] transition w-30 lg:w-40 flex items-center justify-between"
      >
        <span className="text-xl">Sort by</span>
       <ChevronDown size={25} className="text-gray-400 mt-2" />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#3b214d] border border-[#572b76] rounded-md shadow-lg z-10">
          <div className="py-1">

              {/* По популярности вверх */}
            <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
              onClick={() => onSelect("Default", true)}

            >
             Default
            </button>


             {/* По популярности вверх */}
            <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
              onClick={() => onSelect("Popularity", true)}

            >
              Popularity
              <ChevronUp size={25} className="text-gray-400 mt-2" />
            </button>


            {/* По популярности вниз */}
            <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
             onClick={() => onSelect("Popularity", false)}
            >
              Popularity
              <ChevronDown size={25} className="text-gray-400 mt-2" />
            </button>



            {/* По цене вверх */}
            <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
           onClick={() => onSelect("Price", true)}
            >
              Price
              <ChevronUp size={25} className="text-gray-400 mt-2" />
            </button>


            {/* По цене вниз */}
            <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
             onClick={() => onSelect("Price", false )}
            >
              Price
              <ChevronDown size={25} className="text-gray-400 mt-2" />
            </button>


            {/* По скидке */}
            {/* <button
            className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] flex justify-between items-center cursor-pointer"
             onClick={() => onSelect("Discount", true)}
            >
              Discount
              <ChevronUp size={25} className="text-gray-400 mt-2" />
            </button> */}


            <button
              className="w-full text-left block px-4 py-2 text-xl hover:bg-[#572b76] cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
}