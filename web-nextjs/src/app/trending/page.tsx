// src/app/trending/page.tsx
// Trending articles listing with pagination

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  fetchArticles,
  fetchFeaturedArticles,
  fetchAdSlots,
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

interface TrendingPageProps {
  searchParams: Promise<{ page?: string }>; // R1.1
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  // R1.1: await searchParams
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? '1') || 1;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [
    articlesRes,
    featuredRes,
    adSlots,
    site,
    categories,
  ] = await Promise.all([
    fetchArticles(siteSlug, {
      filters: { 'filters[isTrending][$eq]': 'true' },
      page,
      pageSize: 10,
      sort: 'publishedAt:desc',
      locale,
      revalidate: 120,
    }).catch(() => ({
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    })),
    fetchFeaturedArticles(siteSlug, 5, locale).catch(() => ({ data: [] })),
    fetchAdSlots().catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  return (
    <ListingPage
      title="Trending Now"
      subtitle="What everyone is reading right now"
      articles={articlesRes.data}
      pagination={articlesRes.meta.pagination}
      adSlots={adSlots}
      site={site}
      categories={categories}
      locale={locale}
      basePath="/trending"
      featuredArticles={featuredRes.data}
      listingAdSlotKey="listing_between_mrec"
    />
  );
}
