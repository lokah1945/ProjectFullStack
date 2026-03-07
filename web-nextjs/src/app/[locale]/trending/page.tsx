// src/app/[locale]/trending/page.tsx
// Localized trending articles listing — sorted by view velocity (avg views/hour, 3 days)

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params; // R1.1
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  return generateSiteMetadata(site, { page: { title: 'Trending', path: `/${locale}/trending` } });
}

interface LocaleTrendingPageProps {
  params: Promise<{ locale: string }>; // R1.1
}

export default async function LocaleTrendingPage({ params }: LocaleTrendingPageProps) {
  // R1.1: await params
  const { locale } = await params;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  const [trendingRes, featuredRes, adGroups, site, categories] = await Promise.all([
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
      basePath={`/${locale}/trending`}
      featuredArticles={featuredRes.data}
    />
  );
}
