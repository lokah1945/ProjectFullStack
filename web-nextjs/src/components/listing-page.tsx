// src/components/listing-page.tsx
// Reusable server component wrapper for listing pages (Latest, Featured, Trending, Category)
import type { Article, StrapiPagination, SiteAds, Site, Category } from '@/types';
import { LatestList } from './latest-list';
import { SidebarWidgets } from './sidebar-widgets';
import { AdBanner } from './ad-banner';
import { HeaderNav } from './header-nav';
import { Footer } from './footer';

interface ListingPageProps {
  title: string;
  subtitle?: string;
  description?: string;
  articles: Article[];
  pagination: StrapiPagination;
  siteAds: SiteAds;
  site: Site | null;
  categories: Category[];
  locale: string;
  basePath: string;
  trendingArticles?: Article[];
  featuredArticles?: Article[];
  /** View mode for the list */
  layout?: 'list' | 'grid';
}

export function ListingPage({
  title,
  subtitle,
  description,
  articles,
  pagination,
  siteAds,
  site,
  categories,
  locale,
  basePath,
  trendingArticles = [],
  featuredArticles = [],
}: ListingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1" id="main-content">
        <div className="container-content py-8 lg:py-12">

          {/* Page header */}
          <header className="mb-8 pb-6 border-b border-gray-100">
            <h1
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 text-sm sm:text-base mt-1">{subtitle}</p>
            )}
            {description && (
              <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">{description}</p>
            )}
          </header>

          {/* Top header banner ad */}
          {siteAds.headerBanner && (
            <div className="mb-8 flex justify-center overflow-hidden">
              <AdBanner slot={siteAds.headerBanner} className="w-full" />
            </div>
          )}

          {/* Main grid: articles + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 xl:gap-12">

            {/* Article list */}
            <div className="min-w-0">
              <LatestList
                articles={articles}
                pagination={pagination}
                locale={locale}
                basePath={basePath}
                betweenListSlot={siteAds.betweenListBanner}
              />
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <SidebarWidgets
                trendingArticles={trendingArticles}
                featuredArticles={featuredArticles}
                sidebarSlot={siteAds.sidebarBanner}
                locale={locale}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
