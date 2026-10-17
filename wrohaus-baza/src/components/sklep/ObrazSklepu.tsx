import Image from "next/image";
import { mediaSrcSet, shouldUnoptimizeImage, sizedMediaUrl } from "@/lib/obrazy";

/** next/image rzuca 500 przy hoście spoza remotePatterns — wtedy zwykły img. */
export function StoreImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  fit = "cover",
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const url = src?.trim();
  if (!url) return null;
  const objectClass = fit === "contain" ? "object-contain" : "object-cover";

  if (shouldUnoptimizeImage(url)) {
    const srcSet = mediaSrcSet(url);
    return (
      // Native <img>: uploads skip the Next optimizer and idą przez /api/media?w=
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={srcSet ? sizedMediaUrl(url, 640) : url}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={
          fill
            ? `absolute inset-0 h-full w-full ${objectClass} ${className ?? ""}`.trim()
            : className
        }
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill={fill}
      className={`${objectClass} ${className ?? ""}`.trim()}
      sizes={sizes}
      priority={priority}
    />
  );
}
