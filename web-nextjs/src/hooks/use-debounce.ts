// src/hooks/use-debounce.ts
// Generic debounce hook
'use client';

import { useEffect, useState } from 'react';

/**
 * Debounces a value, only updating after `delay` ms of no changes.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 300);
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
