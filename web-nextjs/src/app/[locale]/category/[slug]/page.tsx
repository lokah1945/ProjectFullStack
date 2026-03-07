// src/app/[locale]/category/[slug]/page.tsx
// Localized category page

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  fetchArticlesByCategory,
  fetchCategories,
  fetchTrendingArticles,
  fetchAdGroups,
  pickSiteAds,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { ListingPage } from '@/components/listing-page';

// R1.2: Explicit revalidate
export const revalidate = 60;

// R1.1: params is Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params; // R1.1
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  const allCategories = await fetchCategories(siteSlug, locale).catch(() => []);
  const category = allCategories.find(c => c.slug === slug);

  return {
    ...generateSiteMetadata(site, {
      page: { title: category?.name ?? slug, path: `/${locale}/category/${slug}` },
    }),
    alternates: {
      languages: {
        en: `/category/${slug}`,
        id: `/id/category/${slug}`,
      },
    },
  };
}

interface LocaleCategoryPageProps {
  params: Promise<{ locale: string; slug: string }>; // R1.1
  searchParams: Promise<{ page?: string }>; // R1.1
}

export default async function LocaleCategoryPage({ params, searchParams }: LocaleCategoryPageProps) {
  // R1.1: await params and searchParams
  const { locale, slug } = await params;
  const resolvedSearch = await searchParams;
  const page = Number(resolvedSearch?.page ?? '1') || 1;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  const [articlesRes, allCategories, trendingRes, adGroups, site] = await Promise.all([
    fetchArticlesByCategory(siteSlug, slug, page, 10, locale).catch(() => ({
      data: [],
      meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } },
    })),
    fetchCategories(siteSlug, locale).catch(() => []),
    fetchTrendingArticles(siteSlug, 5, locale).catch(() => ({ data: [] })),
    fetchAdGroups(siteSlug).catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
  ]);

  const navCategories = await fetchNavCategories(siteSlug, locale).catch(() => []);
  const category = allCategories.find(c => c.slug === slug);

  if (!category && articlesRes.data.length === 0) notFound();

  const siteAds = pickSiteAds(adGroups);
  const categoryName = category?.name ?? slug.replace(/-/g, ' ');

  return (
    <ListingPage
      title={categoryName}
      subtitle={`Browse all articles in ${categoryName}`}
      articles={articlesRes.data}
      pagination={articlesRes.meta.pagination}
      siteAds={siteAds}
      site={site}
      categories={navCategories}
      locale={locale}
      basePath={`/${locale}/category/${slug}`}
      trendingArticles={trendingRes.data}
    />
  );
}
