"use client";
import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToMiddle() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 1200);
  }, [pathname]);

  return null; 
}