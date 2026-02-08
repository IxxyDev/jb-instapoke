import { useCallback, useRef } from "react";

const PREFETCH_MARGIN = "400px";

export function useInfiniteScroll(
  onIntersect: () => void,
  enabled: boolean = true,
): (node: HTMLElement | null) => void {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(onIntersect);
  callbackRef.current = onIntersect;

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || !enabled) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            callbackRef.current();
          }
        },
        { rootMargin: PREFETCH_MARGIN },
      );

      observerRef.current.observe(node);
    },
    [enabled],
  );

  return sentinelRef;
}
