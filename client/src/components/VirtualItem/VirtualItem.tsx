import type { ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";

const BUFFER = "600px";

const callbacks = new Map<Element, (visible: boolean) => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callbacks.get(entry.target)?.(entry.isIntersecting);
        }
      },
      { rootMargin: BUFFER },
    );
  }
  return sharedObserver;
}

function observe(el: Element, cb: (visible: boolean) => void) {
  callbacks.set(el, cb);
  getObserver().observe(el);
}

function unobserve(el: Element) {
  getObserver().unobserve(el);
  callbacks.delete(el);
  if (callbacks.size === 0) {
    sharedObserver?.disconnect();
    sharedObserver = null;
  }
}

interface VirtualItemProps {
  children: ReactNode;
  estimatedHeight: number;
}

export const VirtualItem = memo(function VirtualItem({
  children,
  estimatedHeight,
}: VirtualItemProps) {
  const [visible, setVisible] = useState(false);
  const heightRef = useRef(estimatedHeight);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    observe(node, setVisible);
    return () => unobserve(node);
  }, []);

  useEffect(() => {
    if (visible && ref.current) {
      heightRef.current = ref.current.offsetHeight;
    }
  }, [visible]);

  return (
    <div ref={ref} style={!visible ? { height: heightRef.current } : undefined}>
      {visible ? children : null}
    </div>
  );
});
