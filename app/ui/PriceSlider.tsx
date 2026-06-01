"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const PriceSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  
  // Получаем массив значений, чтобы отрисовать нужное кол-во ползунков
  const values = props.value || props.defaultValue || [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#2d2d3d]">
        <SliderPrimitive.Range className="absolute h-full bg-purple-500" />
      </SliderPrimitive.Track>
      
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-5 w-5 rounded-full border-2 border-purple-500 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.5)] cursor-pointer"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
PriceSlider.displayName = SliderPrimitive.Root.displayName

export { PriceSlider }