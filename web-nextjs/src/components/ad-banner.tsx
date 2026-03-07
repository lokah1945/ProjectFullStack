// src/components/ad-banner.tsx
// AdBanner — renders a single ad slot's HTML code inside an iframe sandbox.
// This approach guarantees ad scripts (including document.write-based ones)
// execute correctly, since the iframe provides a fresh document context.
'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import type { AdSlot } from '@/types';

interface AdBannerProps {
  slot: AdSlot | null;
  className?: string;
}

/**
 * Build a complete HTML document string for the ad iframe.
 * The ad code is placed inside <body> so scripts run in a fresh document
 * where document.write() still works (critical for Adstera iframe ads).
 */
function buildSrcdoc(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  body { display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>${code}</body>
</html>`;
}

export function AdBanner({ slot, className = '' }: AdBannerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize srcdoc to avoid re-renders
  const srcdoc = useMemo(() => {
    if (!slot) return '';
    return buildSrcdoc(slot.code);
  }, [slot]);

  // IntersectionObserver lazy load
  useEffect(() => {
    const el = outerRef.current;
    if (!el || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  if (!slot) return null;

  return (
    <div
      ref={outerRef}
      className={`ad-banner-container w-full ${className}`}
      style={{ minHeight: `${slot.height}px`, width: '100%' }}
      role="complementary"
      aria-label="Advertisement"
    >
      {isVisible && srcdoc && (
        <iframe
          srcDoc={srcdoc}
          style={{
            width: '100%',
            height: `${slot.height}px`,
            border: 'none',
            overflow: 'hidden',
            display: 'block',
          }}
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          title="Advertisement"
        />
      )}
    </div>
  );
}
