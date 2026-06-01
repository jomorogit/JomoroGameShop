"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollTopLinks() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(1000, 1200);
  }, [pathname]);

  return null; 
}