// src/components/trending-strip.tsx
// Horizontal scrollable trending articles with numbered rank badges
import type { Article } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface TrendingStripProps {
  articles: Article[];
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

export function TrendingStrip({ articles, locale = 'en' }: TrendingStripProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';

  if (!articles || articles.length === 0) return null;

  const items = articles.slice(0, 6);

  return (
    <section aria-label="Trending articles" className="w-full border-y border-gray-100 bg-gray-50/60">
      <div className="container-content py-6 lg:py-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white px-3 py-1.5 rounded-full"
            style={{ background: 'var(--color-primary)' }}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 3.5L8 9.5h5L7 20.5l10-9H12l4.5-8H13.5z" />
            </svg>
            Trending
          </div>
          <span className="hidden sm:block text-sm text-gray-400 font-medium">What everyone&apos;s reading</span>
        </div>

        {/* Scrollable cards */}
        <div
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {items.map((article, idx) => (
            <Link
              key={article.documentId}
              href={`${prefix}/article/${article.slug}`}
              className="group flex-shrink-0 w-40 sm:w-48 lg:w-auto block"
              style={{ scrollSnapAlign: 'start' }}
              aria-label={`#${idx + 1} Trending: ${article.title}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3">
                <Image
                  src={resolveImageUrl(article.coverImage?.url)}
                  alt={article.coverImage?.alternativeText ?? article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 16vw"
                />
                {/* Rank badge */}
                <span
                  className="absolute top-2 left-2 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-sm"
                  style={{ background: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  {idx + 1}
                </span>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" />
              </div>

              {/* Content */}
              <div>
                {article.category && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider block mb-1 truncate"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {article.category.name}
                  </span>
                )}
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-150">
                  {article.title}
                </h3>
                <time
                  dateTime={article.publishedAt}
                  className="text-[10px] text-gray-400 mt-1 block"
                >
                  {formatDate(article.publishedAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
