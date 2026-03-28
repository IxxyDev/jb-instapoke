import { memo, useCallback, useRef, useState } from "react";
import styles from "./LazyImage.module.css";

type ImageStatus = "loading" | "loaded" | "error";

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  width,
  height,
}: LazyImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");
  const prevSrc = useRef(src);

  if (prevSrc.current !== src) {
    prevSrc.current = src;
    if (status !== "loading") {
      setStatus("loading");
    }
  }

  const onLoad = useCallback(() => setStatus("loaded"), []);
  const onError = useCallback(() => setStatus("error"), []);

  return (
    <div
      className={styles.container}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {status === "error" ? (
        <div className={styles.placeholder} role="img" aria-label={alt} />
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className={`${styles.image} ${status === "loaded" ? styles.loaded : ""}`}
          onLoad={onLoad}
          onError={onError}
        />
      )}
    </div>
  );
});
