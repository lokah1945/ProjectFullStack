// src/app/[locale]/page.tsx
// Localized home page — mirrors app/page.tsx but with locale from params

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  fetchFeaturedArticles,
  fetchTrendingArticles,
  fetchLatestArticles,
  fetchAdGroups,
  pickSiteAds,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { FeaturedHero } from '@/components/featured-hero';
import { TrendingStrip } from '@/components/trending-strip';
import { LatestList } from '@/components/latest-list';
import { AdBanner } from '@/components/ad-banner';
import { NativeAdCard } from '@/components/native-ad-card';
import { HeaderNav } from '@/components/header-nav';
import { Footer } from '@/components/footer';

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
  return {
    ...generateSiteMetadata(site),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/', id: '/id' },
    },
  };
}

interface LocaleHomePageProps {
  params: Promise<{ locale: string }>; // R1.1
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  // R1.1: await params
  const { locale } = await params;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  const [
    featuredRes,
    trendingRes,
    latestRes,
    adGroups,
    site,
    categories,
  ] = await Promise.all([
    fetchFeaturedArticles(siteSlug, 5, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 5, pageCount: 0, total: 0 } } })),
    fetchTrendingArticles(siteSlug, 6, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 6, pageCount: 0, total: 0 } } })),
    fetchLatestArticles(siteSlug, 10, 1, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } } })),
    fetchAdGroups(siteSlug).catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  const siteAds = pickSiteAds(adGroups);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1">
        {featuredRes.data.length > 0 && (
          <FeaturedHero articles={featuredRes.data} locale={locale} />
        )}

        {siteAds.headerBanner && (
          <div className="container-content py-4">
            <AdBanner slot={siteAds.headerBanner} />
          </div>
        )}

        {trendingRes.data.length > 0 && (
          <TrendingStrip articles={trendingRes.data} locale={locale} />
        )}

        {siteAds.betweenListBanner && (
          <div className="container-content py-4">
            <AdBanner slot={siteAds.betweenListBanner} />
          </div>
        )}

        <section className="container-content py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Latest Articles
              </h2>
              <LatestList
                articles={latestRes.data}
                pagination={latestRes.meta.pagination}
                locale={locale}
                basePath={`/${locale}/latest`}
              />
            </div>
            <aside className="hidden lg:block space-y-6">
              <AdBanner slot={siteAds.sidebarBanner} />
              <NativeAdCard slot={siteAds.inArticleNative} />
            </aside>
          </div>
        </section>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
