"use client";

import Image from "next/image";
import { isLocalUpload } from "@/lib/obrazy";

type WatermarkSize = "sm" | "md" | "lg";

const shellClass: Record<WatermarkSize, string> = {
  sm: "right-0.5 bottom-0.5",
  md: "right-2.5 bottom-2.5 sm:right-3 sm:bottom-3",
  lg: "right-3 bottom-3 sm:right-5 sm:bottom-5",
};

const frameClass: Record<WatermarkSize, string> = {
  sm: "",
  md: "rounded-md bg-white/80 px-1.5 py-1 shadow-sm ring-1 ring-black/5 backdrop-blur-[1px]",
  lg: "rounded-lg bg-white/82 px-2 py-1.5 shadow-md ring-1 ring-black/[0.06] backdrop-blur-[2px] sm:px-2.5 sm:py-2",
};

const imageClass: Record<WatermarkSize, string> = {
  sm: "h-3 w-auto max-w-[1.35rem] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
  md: "h-5 w-auto max-w-[4rem] object-contain sm:h-6 sm:max-w-[4.5rem]",
  lg: "h-7 w-auto max-w-[5.5rem] object-contain sm:h-9 sm:max-w-[7rem]",
};

export function FabricWatermarkBadge({
  src,
  size = "lg",
  className = "",
}: {
  src?: string;
  size?: WatermarkSize;
  className?: string;
}) {
  const url = src?.trim();
  if (!url) return null;

  return (
    <div
      className={`pointer-events-none absolute z-10 ${shellClass[size]} ${className}`}
      aria-hidden
    >
      <div className={frameClass[size]}>
        <Image
          src={url}
          alt=""
          width={112}
          height={48}
          className={imageClass[size]}
          unoptimized={isLocalUpload(url)}
        />
      </div>
    </div>
  );
}
