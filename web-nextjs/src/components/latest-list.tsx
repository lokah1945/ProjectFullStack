// src/components/latest-list.tsx
// Vertical article list with ad insertion every 5th item
import type { Article, StrapiPagination, AdSlot } from '@/types';
import { ArticleCard } from './article-card';
import { AdSlotComponent } from './ad-slot';
import { Pagination } from './pagination';

interface LatestListProps {
  articles: Article[];
  pagination?: StrapiPagination;
  locale?: string;
  basePath?: string;
  /** Ad slot for listing_between placement */
  listingBetweenSlot?: AdSlot | null;
}

export function LatestList({
  articles,
  pagination,
  locale = 'en',
  basePath = '/latest',
  listingBetweenSlot,
}: LatestListProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-400 font-medium">No articles found.</p>
        <p className="text-sm text-gray-300 mt-1">Check back later for new content.</p>
      </div>
    );
  }

  // Interleave ad slots every 5 items
  const listItems: Array<{ type: 'article'; article: Article } | { type: 'ad' }> = [];
  articles.forEach((article, idx) => {
    listItems.push({ type: 'article', article });
    // Insert ad after every 5th article (index 4, 9, 14, ...)
    if ((idx + 1) % 5 === 0 && listingBetweenSlot?.adUnit?.isActive) {
      listItems.push({ type: 'ad' });
    }
  });

  return (
    <section aria-label="Article list">
      <div className="divide-y divide-gray-50">
        {listItems.map((item, idx) => {
          if (item.type === 'ad' && listingBetweenSlot) {
            return (
              <div
                key={`ad-${idx}`}
                className="py-5 flex justify-center"
                aria-label="Advertisement"
              >
                <AdSlotComponent slot={listingBetweenSlot} />
              </div>
            );
          }

          if (item.type === 'article') {
            return (
              <div key={item.article.documentId} className="py-4">
                <ArticleCard
                  article={item.article}
                  variant="horizontal"
                  locale={locale}
                  priority={idx < 3}
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.pageCount > 1 && (
        <Pagination
          pagination={pagination}
          basePath={`${prefix}${basePath}`}
        />
      )}
    </section>
  );
}
