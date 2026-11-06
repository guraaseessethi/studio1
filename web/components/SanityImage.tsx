"use client";

import Image from "next/image";
import type { ImageData } from "@/lib/content/types";
import { sanityLoader } from "@/lib/sanity/loader";

type Props = {
  image: ImageData;
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
};

/** Fills its (positioned) parent. Sanity images go through the Sanity CDN; local ones through Next. */
export function SanityImage({ image, sizes, priority, className, alt }: Props) {
  const remote = image.src.startsWith("https://cdn.sanity.io");
  return (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={remote ? sanityLoader : undefined}
      placeholder={image.lqip ? "blur" : "empty"}
      blurDataURL={image.lqip}
      className={className}
      style={{ objectFit: "cover", objectPosition: image.position }}
    />
  );
}
