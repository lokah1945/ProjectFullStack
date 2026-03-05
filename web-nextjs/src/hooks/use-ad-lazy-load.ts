// src/hooks/use-ad-lazy-load.ts
// IntersectionObserver-based lazy load trigger for ad slots
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseAdLazyLoadOptions {
  /** Delay in ms after entering viewport before triggering load */
  delayMs?: number;
  /** IntersectionObserver rootMargin — preload before visible */
  rootMargin?: string;
  /** IntersectionObserver threshold */
  threshold?: number;
}

/**
 * Returns a ref to attach to the ad container and a boolean
 * indicating whether the ad should be rendered.
 *
 * Usage:
 *   const { containerRef, shouldLoad } = useAdLazyLoad({ delayMs: 2000 });
 *   <div ref={containerRef}>{shouldLoad && <ActualAd />}</div>
 */
export function useAdLazyLoad(opts?: UseAdLazyLoadOptions) {
  const { delayMs = 2000, rootMargin = '200px', threshold = 0 } = opts ?? {};

  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Already loaded — no need to observe
    if (shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            timerRef.current = setTimeout(() => {
              setShouldLoad(true);
            }, delayMs);
          } else {
            setShouldLoad(true);
          }
          // Stop observing once triggered
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delayMs, rootMargin, threshold, shouldLoad]);

  return { containerRef, shouldLoad };
}
