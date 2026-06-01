'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode, Scrollbar } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'swiper/css/scrollbar';

export interface MediaItem {
  id: number;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt?: string;
}

interface SliderProps {
  media: MediaItem[];
}

export default function GameMediaSlider({ media }: SliderProps) {
  // 1. Состояние для предотвращения ошибок гидратации
  const [isMounted, setIsMounted] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

 useEffect(() => {
  const handle = requestAnimationFrame(() => {
    setIsMounted(true);
  });
  return () => cancelAnimationFrame(handle);
}, []);

  // Если компонент еще не смонтирован на клиенте — показываем скелетон (плейсхолдер)
  if (!isMounted) {
    return (
      <div className="w-full space-y-2">
        <div className="aspect-video bg-[#1a1b26] rounded-lg animate-pulse" />
        <div className="h-24 bg-[#1a1b26] rounded-lg animate-pulse" />
        <div className="h-8 bg-[#171a21] rounded animate-pulse" />
      </div>
    );
  }

  // Защита: Если массив медиа пустой
  if (!media || media.length === 0) {
    return <div className="p-10 text-center bg-black/20 rounded">No media available</div>;
  }

  // Защита: Фильтруем элементы без src (это частая причина падений Next/Image)
  const safeMedia = media.filter(item => item && item.src);

  return (
    <div className="w-full space-y-2">
      {/* --- ГЛАВНЫЙ СЛАЙДЕР --- */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        // Безопасная передача thumbs
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={[Navigation, Thumbs, FreeMode]}
        className="aspect-video rounded-lg overflow-hidden bg-black"
      >
        {safeMedia.map((item) => (
          <SwiperSlide key={item.id} className="flex items-center justify-center">
            {item.type === 'image' ? (
              <Image 
                src={item.src} 
                alt={item.alt || "Game Image"} 
                fill 
                className="object-contain" 
                priority={true} 
              />
            ) : (
              <video controls className="w-full h-full" poster={item.poster}>
                <source src={item.src} type="video/mp4" />
              </video>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* --- СЛАЙДЕР МИНИАТЮР --- */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={5}
        freeMode={true}
        watchSlidesProgress={true}
        // Используем встроенные классы Swiper для навигации (это безопаснее)
        navigation={{
          nextEl: '.custom-next',
          prevEl: '.custom-prev',
        }}
        scrollbar={{
          el: '.custom-scrollbar-track',
          draggable: true,
          hide: false,
        }}
        modules={[FreeMode, Navigation, Thumbs, Scrollbar]}
        className="h-24 cursor-pointer"
      >
        {safeMedia.map((item) => (
          <SwiperSlide 
            key={item.id} 
            className="opacity-50 transition-opacity [.swiper-slide-thumb-active&]:opacity-100 rounded overflow-hidden"
          >
            <div className="relative w-full h-full bg-[#3D234D]">
              <Image 
                src={item.type === 'image' ? item.src : (item.poster || item.src)} 
                alt="" 
                fill 
                className="object-cover" 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* --- ПАНЕЛЬ УПРАВЛЕНИЯ --- */}
      <div className="flex items-center bg-[#171a21] p-1 rounded gap-1 h-8 select-none">
        
        {/* Кнопка "Назад" */}
        <button className="custom-prev h-full px-4 bg-[#3D234D] hover:bg-[#3f2a4d] rounded-sm transition-colors flex items-center justify-center group z-10 cursor-pointer">
          <div className="w-2 h-2 border-l-2 border-b-2 border-gray-400 group-hover:border-white rotate-45 ml-1" />
        </button>

        {/* Трек Скроллбара */}
        <div className="custom-scrollbar-track relative flex-1 h-full bg-[#101822] rounded-sm overflow-hidden cursor-pointer">
          {/* Сюда Swiper вставит .swiper-scrollbar-drag */}
        </div>

        {/* Кнопка "Вперед" */}
        <button className="custom-next h-full px-4 bg-[#3D234D] hover:bg-[#3f2a4d] rounded-sm transition-colors flex items-center justify-center group z-10 cursor-pointer">
          <div className="w-2 h-2 border-r-2 border-t-2 border-gray-400 group-hover:border-white rotate-45 mr-1" />
        </button>

      </div>

      {/* Безопасные стили (без styled-jsx, чтобы не ломать App Router) */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Стилизуем ползунок внутри нашего кастомного трека */
        .custom-scrollbar-track .swiper-scrollbar-drag {
          background: #3D234D !important;
          border-radius: 2px !important;
          height: 100% !important;
          top: 0 !important;
          left: 0;
          position: absolute;
        }
        .custom-scrollbar-track .swiper-scrollbar-drag:hover {
          background: #3f2a4d !important;
        }
        /* Делаем кнопки неактивными, когда достигнут конец */
        .custom-prev.swiper-button-disabled,
        .custom-next.swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}} />
    </div>
  );
}