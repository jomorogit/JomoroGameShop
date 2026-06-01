"use client"
import React, { useState } from "react"
import { PriceSlider } from "../ui/PriceSlider"
import { Star, ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function Filters() {
    const router = useRouter();
    const pathname = usePathname();

    // 1. Состояния для раскрытия списков
    const [isGenres, setIsGenres] = useState(false);
    const [isPlatforms, setIsPlatforms] = useState(false);

    // 2. Состояние для цены 
    const [priceRange, setPriceRange] = useState([10, 80])

    // 3. Состояния для фильтров
    const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    const handleToggle = (value: string, currentArray: string[], setArray: (val: string[]) => void) => {
        if (currentArray.includes(value)) {
            setArray(currentArray.filter(item => item !== value));
        } else {
            setArray([...currentArray, value]);
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        
        params.set("minPrice", priceRange[0].toString());
        params.set("maxPrice", priceRange[1].toString());

        if (selectedRatings.length > 0) params.set("ratings", selectedRatings.join(","));
        if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
        if (selectedPlatforms.length > 0) params.set("platforms", selectedPlatforms.join(","));

        router.push(`${pathname}?${params.toString()}`);
        setIsFilters(false); 
    };

    const resetFilters = () => {
        setPriceRange([10, 80]);
        setSelectedRatings([]);
        setSelectedGenres([]);
        setSelectedPlatforms([]);
        router.push(pathname);
        setIsFilters(false); 
    };

    // Состояние для открытия мобильной шторки
    const [isFilters, setIsFilters] = useState<boolean>(false);
    const handleClick = () => setIsFilters(!isFilters);

    return (
        <div>
            {/* Кнопка открытия фильтров для мобилки (скрывается на lg:) */}
            <button 
                onClick={handleClick}
                className="w-full bg-[#23122E] h-14 rounded-2xl lg:hidden flex items-center justify-center gap-2 text-white active:scale-[0.99] transition-all mb-4"
            >
                <SlidersHorizontal size={20} className="text-purple-400" />
                <span className="text-lg font-medium">Filters</span>
            </button>
           
            {/* Твой оригинальный контейнер, теперь он адаптирован под мобильную шторку */}
           <div className={`
                fixed top-0 left-0 w-full h-[calc(100vh-3.5rem)] z-50 overflow-y-auto p-4 text-white bg-[#23122E] lg:rounded-2xl
                transition-transform duration-300
                lg:static lg:h-auto lg:w-72 lg:translate-x-0 lg:block lg:transition-none
                ${isFilters ? 'translate-x-0 flex flex-col' : '-translate-x-full hidden'}
            `}>
                
                {/* Шапка фильтров с кнопкой закрытия (крестик виден только на мобилке) */}
                <div className="flex justify-between items-center mb-10 lg:mb-2 mr-[40%]">
                    {isFilters && (
                        <button onClick={handleClick} className="p-1 w-14 h-14 rounded-lg bg-[#3d276b]/40 flex items-center justify-center lg:hidden">
                            <X size={36} className="text-white" />
                        </button>
                    )}
                    <h1 className="text-3xl">Filters</h1>

                </div>

                <span className="text-2xl">Price range</span>
                <div className="mt-4">
                    <PriceSlider
                        defaultValue={[10, 80]}
                        max={100}
                        min={0}
                        step={1}
                        value={priceRange}
                        onValueChange={(vals) => setPriceRange(vals)}
                    />
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-[15px]">0€</span>
                        <div className="bg-[#3D234D] px-3 py-1 rounded text-sm text-purple-400 font-mono w-25 flex justify-center">
                            {priceRange[0]}€ - {priceRange[1]}€
                        </div>
                        <span className="text-[15px]">100€+</span>
                    </div>
                </div>

                <span className="text-2xl mt-4 block">Rating</span>
                <div className="w-full h-auto flex flex-col mt-2 mb-4 gap-2">
                    <div className="flex items-center">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer"
                            checked={selectedRatings.includes("5")}
                            onChange={() => handleToggle("5", selectedRatings, setSelectedRatings)}
                        />
                        <span className="text-xl ml-2">5</span>
                        <Star className="ml-4 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                            checked={selectedRatings.includes("4")}
                            onChange={() => handleToggle("4", selectedRatings, setSelectedRatings)}
                        />
                        <span className="text-xl ml-2">4</span>
                        <Star className="ml-4 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                            checked={selectedRatings.includes("3")}
                            onChange={() => handleToggle("3", selectedRatings, setSelectedRatings)}
                        />
                        <span className="text-xl ml-2">3</span>
                        <Star className="ml-4 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                            checked={selectedRatings.includes("2")}
                            onChange={() => handleToggle("2", selectedRatings, setSelectedRatings)}
                        />
                        <span className="text-xl ml-2">2</span>
                        <Star className="ml-4 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                            checked={selectedRatings.includes("1")}
                            onChange={() => handleToggle("1", selectedRatings, setSelectedRatings)}
                        />
                        <span className="text-xl ml-2">1</span>
                        <Star className="ml-4 text-yellow-400 fill-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                        <Star className="ml-2 text-yellow-400 w-5 h-5" />
                    </div>
                </div>

                <div className="flex items-end cursor-pointer" onClick={() => setIsGenres(!isGenres)}>
                    <span className="text-2xl font-semibold mr-2">Genres</span>
                    {isGenres ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>

                {isGenres && (
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("RPG")}
                                onChange={() => handleToggle("RPG", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">RPG</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("Action")}
                                onChange={() => handleToggle("Action", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">Action</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("Strategy")}
                                onChange={() => handleToggle("Strategy", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">Strategy</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("Indie")}
                                onChange={() => handleToggle("Indie", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">Indie</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("Racing")}
                                onChange={() => handleToggle("Racing", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">Racing</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedGenres.includes("Horror")}
                                onChange={() => handleToggle("Horror", selectedGenres, setSelectedGenres)}
                            />
                            <span className="text-xl ml-2">Horror</span>
                        </div>
                        <Link href="/store/genres" className="w-full block bg-[#3D234D] rounded-[10px] p-2 mt-2 text-center hover:bg-[#402a4e]">
                            Show All Genres
                        </Link>
                    </div>
                )}

                <div className="flex items-end cursor-pointer mt-4" onClick={() => setIsPlatforms(!isPlatforms)}>
                    <span className="text-2xl font-semibold mr-2">Platforms</span>
                    {isPlatforms ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>

                {isPlatforms && (
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedPlatforms.includes("Windows")}
                                onChange={() => handleToggle("Windows", selectedPlatforms, setSelectedPlatforms)}
                            />
                            <span className="text-xl ml-2">Windows</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedPlatforms.includes("macOS")}
                                onChange={() => handleToggle("macOS", selectedPlatforms, setSelectedPlatforms)}
                            />
                            <span className="text-xl ml-2">macOS</span>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500 rounded cursor-pointer" 
                                checked={selectedPlatforms.includes("Linux")}
                                onChange={() => handleToggle("Linux", selectedPlatforms, setSelectedPlatforms)}
                            />
                            <span className="text-xl ml-2">Linux</span>
                        </div>
                    </div>
                )}

                <button onClick={applyFilters} className="w-full bg-[#64208e] p-2 text-xl rounded-md mt-6 hover:bg-[#882aaa] transition-colors">
                    Apply filters
                </button>

                <button onClick={resetFilters} className="w-full bg-red-500 p-2 text-xl rounded-md mt-4 hover:bg-red-600 transition-colors">
                    Remove all filters
                </button>
            </div>
        </div>
    )
}