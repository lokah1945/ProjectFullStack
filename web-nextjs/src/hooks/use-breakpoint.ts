// src/hooks/use-breakpoint.ts
// Returns current breakpoint based on window width
'use client';

import { useEffect, useState } from 'react';
import type { Breakpoint } from '@/lib/ad-utils';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

/**
 * Returns the current breakpoint: 'mobile' | 'tablet' | 'desktop'.
 * SSR-safe: returns 'desktop' on the server.
 *
 * Responds to window resize events with debouncing.
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    function update() {
      setBreakpoint(getBreakpoint(window.innerWidth));
    }

    // Set initial value
    update();

    let timer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(update, 100);
    }

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return breakpoint;
}
