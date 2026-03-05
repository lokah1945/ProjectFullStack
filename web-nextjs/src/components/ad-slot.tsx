// src/components/ad-slot.tsx
// Ad slot component — DOM script injection (R4), lazy-load, device-aware, schedule-aware, CLS prevention
'use client';

import { useEffect, useRef, useState } from 'react';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useAdLazyLoad } from '@/hooks/use-ad-lazy-load';
import { getActivePreset, getMinHeightClass } from '@/lib/ad-utils';
import type { AdSlot } from '@/types';

interface AdSlotComponentProps {
  slot: AdSlot;
  className?: string;
}

/**
 * AdSlotComponent — fully compliant with platform rules:
 * R4: DOM script injection (createElement/appendChild, never dangerouslySetInnerHTML for scripts)
 * R4: Math.random() for code selection is in useEffect (NOT useState initializer) to prevent hydration mismatch
 * CLS: min-height placeholder based on sizePreset / responsiveSizes
 * Lazy: only loads after IntersectionObserver triggers + optional delay
 * Device: checks deviceTarget against current breakpoint
 * Schedule: checks scheduleStart/scheduleEnd
 */
export function AdSlotComponent({ slot, className = '' }: AdSlotComponentProps) {
  const breakpoint = useBreakpoint();
  const { containerRef, shouldLoad } = useAdLazyLoad({
    delayMs: slot.lazyDelayMs ?? 2000,
    rootMargin: '200px',
  });

  // Get active preset for this slot + breakpoint (returns null if not applicable)
  const preset = getActivePreset(slot, breakpoint);
  const minHeightClass = getMinHeightClass(slot.sizePreset ?? 'LEADERBOARD');

  // If slot is not active for this device/schedule, render nothing
  if (!preset) return null;

  return (
    <div
      ref={containerRef}
      className={`ad-slot-container ${className}`}
      data-slot-key={slot.slotKey}
      data-placement={slot.placement}
      role="complementary"
      aria-label="Advertisement"
    >
      <div
        className={`ad-slot-placeholder ${minHeightClass} w-full max-w-full flex items-center justify-center`}
        style={{ minHeight: preset.minHeight }}
      >
        {shouldLoad && slot.adUnit?.isActive && (
          <AdScriptInjector
            codes={slot.adUnit.codes}
            slotKey={slot.slotKey}
          />
        )}
      </div>
    </div>
  );
}

// ── Internal: DOM Script Injector (R4 compliant) ─────────────────────────────

interface AdScriptInjectorProps {
  codes: string[];
  slotKey: string;
}

function AdScriptInjector({ codes, slotKey }: AdScriptInjectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // R4: MUST be in useEffect to avoid hydration mismatch — NOT in useState initializer
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // R4: Select random code in useEffect
  useEffect(() => {
    if (codes && codes.length > 0) {
      const idx = Math.floor(Math.random() * codes.length);
      setSelectedCode(codes[idx]);
    }
  }, [codes]);

  // R4: DOM injection via createElement + appendChild (never dangerouslySetInnerHTML for scripts)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedCode) return;

    // Clear any previous content
    container.innerHTML = '';

    // Parse the ad HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedCode, 'text/html');

    // Process and inject all nodes
    const processNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;

        if (el.tagName === 'SCRIPT') {
          // Must use createElement for scripts — innerHTML/clone does NOT execute scripts
          const script = document.createElement('script');
          const originalScript = el as HTMLScriptElement;

          // Copy all attributes (async, defer, src, type, data-*, etc.)
          Array.from(originalScript.attributes).forEach((attr) => {
            // Set src separately to ensure proper loading
            if (attr.name !== 'src') {
              script.setAttribute(attr.name, attr.value);
            }
          });

          if (originalScript.src) {
            // External script — set src last to trigger load
            script.src = originalScript.src;
          } else {
            // Inline script — set text content
            script.textContent = originalScript.textContent ?? '';
          }

          container.appendChild(script);
        } else {
          // Non-script element — safe to clone with deep copy
          container.appendChild(document.importNode(el, true));
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        container.appendChild(document.importNode(node, false));
      }
    };

    // Process all body children
    Array.from(doc.body.childNodes).forEach(processNode);

    // Cleanup: clear container on unmount to prevent memory leaks
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [selectedCode]);

  return (
    <div
      ref={containerRef}
      data-ad-injector={slotKey}
      className="w-full h-full"
    />
  );
}
