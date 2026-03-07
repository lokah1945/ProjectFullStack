// src/app/trending/page.tsx
// Trending articles listing — sorted by view velocity (avg views/hour, 3 days)

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  fetchTrendingArticles,
  fetchFeaturedArticles,
  fetchAdGroups,
  pickSiteAds,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { ListingPage } from '@/components/listing-page';

// R1.2: Explicit revalidate
export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  return generateSiteMetadata(site, { page: { title: 'Trending', path: '/trending' } });
}

export default async function TrendingPage() {
  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [
    trendingRes,
    featuredRes,
    adGroups,
    site,
    categories,
  ] = await Promise.all([
    fetchTrendingArticles(siteSlug, 20, locale).catch(() => ({
      data: [],
      meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
    })),
    fetchFeaturedArticles(siteSlug, 5, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 5, pageCount: 0, total: 0 } } })),
    fetchAdGroups(siteSlug).catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  const siteAds = pickSiteAds(adGroups);

  return (
    <ListingPage
      title="Trending Now"
      subtitle="What everyone is reading right now"
      articles={trendingRes.data}
      pagination={trendingRes.meta.pagination}
      siteAds={siteAds}
      site={site}
      categories={categories}
      locale={locale}
      basePath="/trending"
      featuredArticles={featuredRes.data}
    />
  );
}
