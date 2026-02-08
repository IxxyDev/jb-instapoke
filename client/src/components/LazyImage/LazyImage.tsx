import { memo, useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  const onLoad = useCallback(() => setStatus("loaded"), []);
  const onError = useCallback(() => setStatus("error"), []);

  return (
    <div
      className={styles.container}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {status === "error" ? (
        <div className={styles.placeholder} aria-label={alt} />
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
