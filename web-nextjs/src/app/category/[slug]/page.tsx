// src/app/category/[slug]/page.tsx
// Category page — articles filtered by category with pagination

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  fetchArticlesByCategory,
  fetchCategories,
  fetchTrendingArticles,
  fetchAdSlots,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { ListingPage } from '@/components/listing-page';

// R1.2: Explicit revalidate
export const revalidate = 60;

// R1.1: params is Promise in Next.js 15
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // R1.1
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  const allCategories = await fetchCategories(siteSlug, locale).catch(() => []);
  const category = allCategories.find(c => c.slug === slug);

  return generateSiteMetadata(site, {
    page: {
      title: category?.name ?? slug,
      path: `/category/${slug}`,
    },
  });
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>; // R1.1
  searchParams: Promise<{ page?: string }>; // R1.1
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // R1.1: await params and searchParams
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const page = Number(resolvedSearch?.page ?? '1') || 1;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [
    articlesRes,
    allCategories,
    trendingRes,
    adSlots,
    site,
  ] = await Promise.all([
    fetchArticlesByCategory(siteSlug, slug, page, 10, locale).catch(() => ({
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    })),
    fetchCategories(siteSlug, locale).catch(() => []),
    fetchTrendingArticles(siteSlug, 5, locale).catch(() => ({ data: [] })),
    fetchAdSlots().catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
  ]);

  // Resolve nav categories
  const navCategories = await fetchNavCategories(siteSlug, locale).catch(() => []);

  // Find the current category
  const category = allCategories.find(c => c.slug === slug);

  // 404 if no articles AND category doesn't exist
  if (!category && articlesRes.data.length === 0) {
    notFound();
  }

  const categoryName = category?.name ?? slug.replace(/-/g, ' ');

  return (
    <ListingPage
      title={categoryName}
      subtitle={`Browse all articles in ${categoryName}`}
      articles={articlesRes.data}
      pagination={articlesRes.meta.pagination}
      adSlots={adSlots}
      site={site}
      categories={navCategories}
      locale={locale}
      basePath={`/category/${slug}`}
      trendingArticles={trendingRes.data}
      listingAdSlotKey="listing_between_mrec"
    />
  );
}
