// web-nextjs/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names with clsx + tailwind-merge.
 * Handles conditional classes and resolves conflicts correctly.
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
