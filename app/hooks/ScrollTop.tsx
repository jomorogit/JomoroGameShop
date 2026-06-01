"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Поднимаем наверх и окно, и корневой элемент документа
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };


    const timer = setTimeout(handleScroll, 20);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null; 
}