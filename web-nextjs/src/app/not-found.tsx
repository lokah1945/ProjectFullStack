// src/app/not-found.tsx
// Custom 404 page

import { headers } from 'next/headers';
import { fetchSiteBySlug, fetchNavCategories } from '@/lib/strapi';
import { HeaderNav } from '@/components/header-nav';
import { Footer } from '@/components/footer';

export default async function NotFound() {
  // R1.1: await headers()
  let siteSlug = 'glimpseit';
  let locale = 'en';

  try {
    const headersList = await headers();
    siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
    locale = headersList.get('x-locale') ?? 'en';
  } catch {
    // Headers unavailable in some contexts
  }

  const [site, categories] = await Promise.all([
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div
            className="text-8xl font-display font-black mb-6 select-none"
            style={{ color: 'var(--color-primary)' }}
          >
            404
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-colors hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              Go to Homepage
            </a>
            <a
              href="/latest"
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Latest Articles
            </a>
            <a
              href="/search"
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Search
            </a>
          </div>
        </div>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
