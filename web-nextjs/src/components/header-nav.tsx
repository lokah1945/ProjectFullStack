// src/components/header-nav.tsx
// Premium sticky header with logo, nav categories, search, language switcher, mobile drawer
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Site, Category } from '@/types';
import { LanguageSwitcher } from './language-switcher';

interface HeaderNavProps {
  site: Site | null;
  categories: Category[];
  locale: string;
}

// Search icon SVG
function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

// Hamburger icon
function MenuIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// Close icon
function CloseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Chevron down for categories dropdown
function ChevronIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Resolves the logo URL from new media field or legacy theme.logoUrl.
 * Prefers site.logo (media upload) over site.theme.logoUrl (deprecated string).
 */
function resolveLogoUrl(site: Site | null): string | null {
  if (site?.logo?.url) return site.logo.url;
  if (site?.theme?.logoUrl) return site.theme.logoUrl;
  return null;
}

export function HeaderNav({ site, categories, locale }: HeaderNavProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  // Nav categories (isInNav: true, sorted by navOrder)
  const navCategories = categories
    .filter((c) => c.isInNav)
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99))
    .slice(0, site?.navConfig?.maxCategoriesInNav ?? 6);

  // Categories for dropdown (remaining non-nav or overflow)
  const allCategories = categories
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99));

  // Track scroll for backdrop
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const primaryColor = site?.theme?.primaryColor ?? '#0F4C81';
  const logoUrl = resolveLogoUrl(site);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="container-content">
          <nav className="flex items-center justify-between h-16 gap-4" aria-label="Main navigation">

            {/* ── Logo ────────────────────────────────── */}
            <Link
              href={`${prefix}/`}
              className="flex items-center gap-2.5 flex-shrink-0 group"
              aria-label={`${site?.name ?? 'Home'} — Go to homepage`}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={site?.logo?.alternativeText ?? `${site?.name ?? 'Site'} logo`}
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
                />
              ) : (
                <span
                  className="text-xl font-bold tracking-tight font-[var(--font-jakarta)]"
                  style={{ color: primaryColor }}
                >
                  {site?.name ?? 'News'}
                </span>
              )}
            </Link>

            {/* ── Desktop Navigation ──────────────────── */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {/* Static nav links */}
              {site?.navConfig?.showLatest !== false && (
                <Link
                  href={`${prefix}/latest`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  Latest
                </Link>
              )}
              {site?.navConfig?.showFeatured !== false && (
                <Link
                  href={`${prefix}/featured`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  Featured
                </Link>
              )}
              {site?.navConfig?.showTrending !== false && (
                <Link
                  href={`${prefix}/trending`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                >
                  Trending
                </Link>
              )}

              {/* Category nav links */}
              {navCategories.map((cat) => (
                <Link
                  key={cat.documentId}
                  href={`${prefix}/category/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150 whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}

              {/* More categories dropdown */}
              {allCategories.length > navCategories.length && (
                <div className="relative">
                  <button
                    onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                    onBlur={() => setTimeout(() => setCatDropdownOpen(false), 200)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                    aria-expanded={catDropdownOpen}
                    aria-haspopup="true"
                  >
                    More
                    <ChevronIcon className={`w-3.5 h-3.5 transition-transform duration-150 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {catDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                      {allCategories
                        .filter((c) => !navCategories.find((n) => n.documentId === c.documentId))
                        .map((cat) => (
                          <Link
                            key={cat.documentId}
                            href={`${prefix}/category/${cat.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Desktop Actions ──────────────────────── */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Search */}
              <Link
                href={`${prefix}/search`}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                aria-label="Search articles"
              >
                <SearchIcon />
              </Link>

              {/* Language switcher */}
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* ── Mobile Actions ───────────────────────── */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                href={`${prefix}/search`}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <MenuIcon />
              </button>
            </div>

          </nav>
        </div>
      </header>

      {/* ── Mobile Drawer ──────────────────────────────── */}
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link
            href={`${prefix}/`}
            onClick={() => setMobileOpen(false)}
            className="font-bold text-lg"
            style={{ color: primaryColor }}
          >
            {site?.name ?? 'News'}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Main nav links */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Navigation</p>
            {site?.navConfig?.showLatest !== false && (
              <Link href={`${prefix}/latest`} onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Latest
              </Link>
            )}
            {site?.navConfig?.showFeatured !== false && (
              <Link href={`${prefix}/featured`} onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Featured
              </Link>
            )}
            {site?.navConfig?.showTrending !== false && (
              <Link href={`${prefix}/trending`} onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                Trending
              </Link>
            )}
          </div>

          {/* Categories */}
          {allCategories.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2">Categories</p>
              {allCategories.map((cat) => (
                <Link
                  key={cat.documentId}
                  href={`${prefix}/category/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Language</span>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      </div>
    </>
  );
}
