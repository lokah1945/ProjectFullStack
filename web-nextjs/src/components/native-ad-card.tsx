// src/components/native-ad-card.tsx
// Native ad card — looks like an article card, DOM script injection (R4), "Sponsored" label
'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdSlot } from '@/types';

interface NativeAdCardProps {
  slot: AdSlot | undefined | null;
  className?: string;
}

/**
 * NativeAdCard:
 * - Blends with article list design
 * - Prominent "Sponsored" label for disclosure
 * - R4 compliant: DOM injection via createElement, Math.random in useEffect
 * - IntersectionObserver-based lazy load
 * - Cleans up on unmount
 */
export function NativeAdCard({ slot, className = '' }: NativeAdCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // R4: Code selection must be in useEffect (NOT useState initializer)
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // R4: Select random code in useEffect to avoid hydration mismatch
  useEffect(() => {
    if (slot?.adUnit?.codes && slot.adUnit.codes.length > 0) {
      const idx = Math.floor(Math.random() * slot.adUnit.codes.length);
      setSelectedCode(slot.adUnit.codes[idx]);
    }
  }, [slot?.adUnit?.codes]);

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

  // R4: DOM script injection via createElement + appendChild
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedCode || !isVisible) return;

    // Clear previous
    container.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(selectedCode, 'text/html');

    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        if (el.tagName === 'SCRIPT') {
          const script = document.createElement('script');
          const orig = el as HTMLScriptElement;

          Array.from(orig.attributes).forEach((attr) => {
            if (attr.name !== 'src') script.setAttribute(attr.name, attr.value);
          });

          if (orig.src) {
            script.src = orig.src;
          } else {
            script.textContent = orig.textContent ?? '';
          }

          container.appendChild(script);
        } else {
          container.appendChild(document.importNode(el, true));
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        container.appendChild(document.importNode(node, false));
      }
    });

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [selectedCode, isVisible]);

  // Don't render if slot is disabled/inactive
  if (!slot || !slot.adUnit?.isActive) return null;

  return (
    <div
      ref={outerRef}
      className={`relative rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm ${className}`}
      data-slot-key={slot.slotKey}
      role="complementary"
      aria-label="Sponsored content"
    >
      {/* Sponsored label — top right badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[10px] font-semibold text-gray-400 bg-white/90 backdrop-blur-sm border border-gray-100 px-2 py-0.5 rounded-full">
          Sponsored
        </span>
      </div>

      {/* Ad content container — min-height prevents CLS */}
      <div
        ref={containerRef}
        className="min-h-[250px] w-full flex items-center justify-center"
        data-native-ad={slot.slotKey}
        aria-hidden="true"
      />
    </div>
  );
}
