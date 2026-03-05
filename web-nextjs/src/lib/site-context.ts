// src/lib/site-context.ts
// Reads site context from headers injected by middleware

import { headers } from 'next/headers';
import type { SiteContext, Site, Category } from '@/types';
import { fetchSiteBySlug, fetchNavCategories } from '@/lib/strapi';

/**
 * Reads the minimal site context injected by middleware.
 * MUST use await headers() — Next.js 15 async API (R1.1).
 */
export async function getSiteContext(): Promise<SiteContext> {
  const headersList = await headers(); // R1.1: await required

  const slug = headersList.get('x-site-slug') ?? 'glimpseit';
  const id = headersList.get('x-site-id') ?? '';
  const locale = headersList.get('x-locale') ?? 'en';

  return { slug, id, locale };
}

/**
 * Reads site context and returns the site slug/id/locale without throwing.
 * Returns defaults if headers are unavailable.
 */
export async function getSiteContextSafe(): Promise<SiteContext> {
  try {
    return await getSiteContext();
  } catch {
    return { slug: 'glimpseit', id: '', locale: 'en' };
  }
}

/**
 * Fetches the full site config including categories from Strapi.
 * Uses the slug from middleware headers.
 */
export async function fetchFullSiteConfig(
  slug?: string
): Promise<{ site: Site | null; categories: Category[] }> {
  const headersList = await headers(); // R1.1
  const siteSlug = slug ?? headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [site, categories] = await Promise.all([
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  return { site, categories };
}

/**
 * Gets site context + full config in one call for layout/pages.
 */
export async function getFullSiteContext(): Promise<{
  context: SiteContext;
  site: Site | null;
  categories: Category[];
}> {
  const headersList = await headers(); // R1.1
  const slug = headersList.get('x-site-slug') ?? 'glimpseit';
  const id = headersList.get('x-site-id') ?? '';
  const locale = headersList.get('x-locale') ?? 'en';

  const context: SiteContext = { slug, id, locale };

  const [site, categories] = await Promise.all([
    fetchSiteBySlug(slug).catch(() => null),
    fetchNavCategories(slug, locale).catch(() => []),
  ]);

  return { context, site, categories };
}
