// src/components/sidebar-widgets.tsx
// Sticky sidebar: trending top 5, featured top 5, ad slots
import type { Article, AdSlot } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { AdSlotComponent } from './ad-slot';

interface SidebarWidgetsProps {
  trendingArticles?: Article[];
  featuredArticles?: Article[];
  adSlots?: AdSlot[];
  locale?: string;
}

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';

function resolveImageUrl(url?: string | null): string {
  if (!url) return '/placeholder-cover.jpg';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface ArticleWidgetProps {
  title: string;
  articles: Article[];
  locale: string;
  icon?: 'trending' | 'star';
}

function ArticleWidget({ title, articles, locale, icon = 'trending' }: ArticleWidgetProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      {/* Widget header */}
      <div className="flex items-center gap-2 mb-4">
        {icon === 'trending' ? (
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 3.5L8 9.5h5L7 20.5l10-9H12l4.5-8H13.5z" />
            </svg>
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">{title}</h3>
      </div>

      {/* Article list */}
      <div className="space-y-3">
        {articles.slice(0, 5).map((article, idx) => (
          <Link
            key={article.documentId}
            href={`${prefix}/article/${article.slug}`}
            className="group flex items-start gap-3"
            aria-label={`${idx + 1}. ${article.title}`}
          >
            {/* Rank number */}
            <span
              className="flex-shrink-0 w-5 h-5 mt-0.5 rounded text-[10px] font-bold flex items-center justify-center text-white"
              style={{ background: idx < 3 ? 'var(--color-primary)' : '#9ca3af' }}
              aria-hidden="true"
            >
              {idx + 1}
            </span>

            {/* Thumbnail */}
            <div className="relative w-14 h-11 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={resolveImageUrl(article.coverImage?.url)}
                alt={article.title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            {/* Title + date */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-150">
                {article.title}
              </h4>
              <time dateTime={article.publishedAt} className="text-[10px] text-gray-400 mt-1 block">
                {formatDate(article.publishedAt)}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SidebarWidgets({
  trendingArticles = [],
  featuredArticles = [],
  adSlots = [],
  locale = 'en',
}: SidebarWidgetsProps) {
  // Find sidebar ad slots
  const sidebarMrecSlot = adSlots.find(
    (s) => s.slotKey === 'article_sidebar_mrec' || s.placement === 'sidebar'
  );
  const skyscraperSlot = adSlots.find(
    (s) => s.slotKey === 'sidebar_skyscraper' || s.sizePreset === 'WIDE_SKYSCRAPER'
  );

  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      {/* Top sidebar MREC ad */}
      {sidebarMrecSlot && (
        <div className="flex justify-center">
          <AdSlotComponent slot={sidebarMrecSlot} />
        </div>
      )}

      {/* Trending articles */}
      {trendingArticles.length > 0 && (
        <ArticleWidget
          title="Trending Now"
          articles={trendingArticles}
          locale={locale}
          icon="trending"
        />
      )}

      {/* Skyscraper ad slot */}
      {skyscraperSlot && (
        <div className="flex justify-center">
          <AdSlotComponent slot={skyscraperSlot} />
        </div>
      )}

      {/* Featured articles */}
      {featuredArticles.length > 0 && (
        <ArticleWidget
          title="Must Read"
          articles={featuredArticles}
          locale={locale}
          icon="star"
        />
      )}
    </aside>
  );
}
