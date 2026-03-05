// src/app/[locale]/latest/page.tsx
// Localized latest articles listing

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  fetchLatestArticles,
  fetchTrendingArticles,
  fetchFeaturedArticles,
  fetchAdSlots,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { ListingPage } from '@/components/listing-page';

// R1.2: Explicit revalidate
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params; // R1.1
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  return generateSiteMetadata(site, { page: { title: 'Latest', path: `/${locale}/latest` } });
}

interface LocaleLatestPageProps {
  params: Promise<{ locale: string }>; // R1.1
  searchParams: Promise<{ page?: string }>; // R1.1
}

export default async function LocaleLatestPage({ params, searchParams }: LocaleLatestPageProps) {
  // R1.1: await params and searchParams
  const { locale } = await params;
  const resolvedSearch = await searchParams;
  const page = Number(resolvedSearch?.page ?? '1') || 1;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  const [articlesRes, trendingRes, featuredRes, adSlots, site, categories] = await Promise.all([
    fetchLatestArticles(siteSlug, 10, page, locale).catch(() => ({
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    })),
    fetchTrendingArticles(siteSlug, 5, locale).catch(() => ({ data: [] })),
    fetchFeaturedArticles(siteSlug, 5, locale).catch(() => ({ data: [] })),
    fetchAdSlots().catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  return (
    <ListingPage
      title="Latest Articles"
      subtitle="Stay up to date with the most recent content"
      articles={articlesRes.data}
      pagination={articlesRes.meta.pagination}
      adSlots={adSlots}
      site={site}
      categories={categories}
      locale={locale}
      basePath={`/${locale}/latest`}
      trendingArticles={trendingRes.data}
      featuredArticles={featuredRes.data}
    />
  );
}
