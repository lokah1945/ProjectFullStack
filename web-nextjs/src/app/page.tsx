// src/app/page.tsx
// Home page — Featured Hero + AdBanner + Trending Strip + AdBanner + Latest List + NativeAdCard

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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  return generateSiteMetadata(site);
}

export default async function HomePage() {
  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  // Parallel data fetching
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

  const featuredArticles = featuredRes.data;
  const trendingArticles = trendingRes.data;
  const latestArticles = latestRes.data;
  const latestPagination = latestRes.meta.pagination;

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1">
        {/* Featured Hero Section */}
        {featuredArticles.length > 0 && (
          <FeaturedHero articles={featuredArticles} locale={locale} />
        )}

        {/* Header Banner Ad */}
        {siteAds.headerBanner && (
          <div className="container-content py-4">
            <AdBanner slot={siteAds.headerBanner} />
          </div>
        )}

        {/* Trending Strip */}
        {trendingArticles.length > 0 && (
          <TrendingStrip articles={trendingArticles} locale={locale} />
        )}

        {/* Between-list Banner Ad */}
        {siteAds.betweenListBanner && (
          <div className="container-content py-4">
            <AdBanner slot={siteAds.betweenListBanner} />
          </div>
        )}

        {/* Latest Articles */}
        <section className="container-content py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Latest Articles
              </h2>
              <LatestList
                articles={latestArticles}
                pagination={latestPagination}
                locale={locale}
                basePath="/latest"
              />
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block space-y-6">
              {/* Sidebar ad */}
              <AdBanner slot={siteAds.sidebarBanner} />

              {/* Native ad */}
              <NativeAdCard slot={siteAds.inArticleNative} />
            </aside>
          </div>
        </section>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
