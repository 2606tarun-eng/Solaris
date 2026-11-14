import { useState, type CSSProperties } from "react";

type SafeImgProps = {
  src?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Painted instead of the picture when the file is missing or broken. */
  fallbackStyle?: CSSProperties;
};

/**
 * <img> that never shows the browser's broken-image icon. If the file fails to
 * load (for example Git LFS pictures that were never downloaded), a soft
 * gradient takes its place so the layout still looks intentional.
 */
export default function SafeImg({ src, alt, className, loading, fallbackStyle }: SafeImgProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={className ? `${className} img-fallback` : "img-fallback"}
        style={fallbackStyle}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      />
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      draggable={false}
      onError={() => setFailedSrc(src)}
    />
  );
}

/** A round, softly lit ball in the given colour. */
export function ballGradient(color: string): CSSProperties {
  return {
    background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.55) 0%, ${color} 42%, rgba(0,0,0,0.88) 100%)`,
  };
}
