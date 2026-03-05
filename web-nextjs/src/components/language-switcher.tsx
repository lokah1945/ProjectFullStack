// src/components/language-switcher.tsx
// Locale switcher between en and id — reads current path, navigates to correct locale URL
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface LanguageSwitcherProps {
  currentLocale: string;
  className?: string;
}

const LOCALES = [
  { code: 'en', label: 'EN', ariaLabel: 'Switch to English' },
  { code: 'id', label: 'ID', ariaLabel: 'Switch to Indonesian' },
] as const;

/**
 * LanguageSwitcher:
 * - Reads current pathname from usePathname()
 * - For 'en': strips /id prefix (or returns /)
 * - For 'id': prepends /id prefix
 * - Uses <Link> for client-side navigation
 * - Active locale is visually highlighted with primary color
 */
export function LanguageSwitcher({ currentLocale, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname();

  function buildLocaleUrl(targetLocale: string): string {
    if (targetLocale === 'en') {
      // Remove /id prefix if present
      const stripped = pathname.replace(/^\/id(\/|$)/, (_, slash) => slash ?? '/');
      return stripped || '/';
    }
    // targetLocale === 'id'
    if (pathname.startsWith(`/${targetLocale}`)) return pathname;
    return `/${targetLocale}${pathname}`;
  }

  return (
    <div
      className={`flex items-center rounded-lg overflow-hidden border border-gray-200 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {LOCALES.map(({ code, label, ariaLabel }) => {
        const isActive = currentLocale === code;
        return (
          <Link
            key={code}
            href={buildLocaleUrl(code)}
            aria-label={ariaLabel}
            aria-current={isActive ? 'true' : undefined}
            className={`px-2.5 py-1 text-xs font-bold tracking-wide transition-all duration-150 ${
              isActive
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={isActive ? { background: 'var(--color-primary)' } : {}}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
