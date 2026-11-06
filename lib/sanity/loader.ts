import type { ImageLoaderProps } from "next/image";

/** Serves resized, auto-format images straight from the Sanity CDN. */
export function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  const join = src.includes("?") ? "&" : "?";
  return `${src}${join}w=${width}&q=${quality ?? 75}&auto=format&fit=max`;
}
