import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
    "bg-[#EF4444] text-[#B91C1C] border border-[#991B1B]", // Dark Red
    "bg-[#3B82F6] text-[#1E40AF] border border-[#1E3A8A]", // Dark Blue
    "bg-[#FACC15] text-[#A16207] border border-[#854D0E]", // Dark Yellow
    "bg-[#22C55E] text-[#15803D] border border-[#166534]"  // Dark Green
  ];

export const fontColors = [
    "text-[#B91C1C]",
    "text-[#1E40AF]",
    "text-[#A16207]",
    "text-[#15803D]"
];

export const getFontColor = (color) =>{
    if(color >= 0 && color < fontColors.length){
        return fontColors[color];
    }
    return fontColors[0];
}

export const getColor = (color) => {
    if(color >= 0 && color < colors.length){
        return colors[color];
    }
    return colors[0];
}

export const animationDefaultOptions = {
    loop : true,
    autoplay : true,
}
