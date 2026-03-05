// src/app/page.tsx
// Home page — Featured Hero + AdSlot + Trending Strip + AdSlot + Latest List + NativeAdCard

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  fetchFeaturedArticles,
  fetchTrendingArticles,
  fetchLatestArticles,
  fetchAdSlots,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata } from '@/lib/seo';
import { FeaturedHero } from '@/components/featured-hero';
import { TrendingStrip } from '@/components/trending-strip';
import { LatestList } from '@/components/latest-list';
import { AdSlotComponent } from '@/components/ad-slot';
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
    adSlots,
    site,
    categories,
  ] = await Promise.all([
    fetchFeaturedArticles(siteSlug, 5, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 5, pageCount: 0, total: 0 } } })),
    fetchTrendingArticles(siteSlug, 6, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 6, pageCount: 0, total: 0 } } })),
    fetchLatestArticles(siteSlug, 10, 1, locale).catch(() => ({ data: [], meta: { pagination: { page: 1, pageSize: 10, pageCount: 0, total: 0 } } })),
    fetchAdSlots().catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  const featuredArticles = featuredRes.data;
  const trendingArticles = trendingRes.data;
  const latestArticles = latestRes.data;
  const latestPagination = latestRes.meta.pagination;

  // Get specific ad slots
  const heroBillboardSlot = adSlots.find(s => s.slotKey === 'home_hero_billboard');
  const trendingLeaderboardSlot = adSlots.find(s => s.slotKey === 'home_trending_leaderboard');
  const nativeHomeFeedSlot = adSlots.find(s => s.slotKey === 'native_home_feed');

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1">
        {/* Featured Hero Section */}
        {featuredArticles.length > 0 && (
          <FeaturedHero articles={featuredArticles} locale={locale} />
        )}

        {/* Home Hero Billboard Ad */}
        {heroBillboardSlot && (
          <div className="container-content py-4">
            <AdSlotComponent slot={heroBillboardSlot} />
          </div>
        )}

        {/* Trending Strip */}
        {trendingArticles.length > 0 && (
          <TrendingStrip articles={trendingArticles} locale={locale} />
        )}

        {/* Trending Leaderboard Ad */}
        {trendingLeaderboardSlot && (
          <div className="container-content py-4">
            <AdSlotComponent slot={trendingLeaderboardSlot} />
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
              {adSlots.find(s => s.slotKey === 'article_sidebar_mrec') && (
                <AdSlotComponent
                  slot={adSlots.find(s => s.slotKey === 'article_sidebar_mrec')!}
                />
              )}

              {/* Native ad */}
              {nativeHomeFeedSlot && (
                <NativeAdCard slot={nativeHomeFeedSlot} />
              )}
            </aside>
          </div>
        </section>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
