"use client";

import Image from "next/image";
import { isLocalUpload, isVideoUrl } from "@/lib/obrazy";
import { FabricWatermarkBadge } from "./ZnakWodnyTkaniny";

export function FabricCloseup({
  src,
  hex,
  alt,
  watermark,
}: {
  src?: string;
  hex: string;
  alt: string;
  watermark?: string;
}) {
  const video = Boolean(src && isVideoUrl(src));

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: hex }}
    >
      {video && src ? (
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          aria-label={alt}
        >
          <source src={src} />
        </video>
      ) : src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 448px"
          unoptimized={isLocalUpload(src)}
        />
      ) : null}
      <FabricWatermarkBadge src={watermark} size="lg" />
    </div>
  );
}
