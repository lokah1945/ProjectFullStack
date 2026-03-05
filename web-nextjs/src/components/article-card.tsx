// src/components/article-card.tsx
// Reusable article card — horizontal (list) and vertical (grid) variants
import type { Article } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

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
    year: 'numeric',
  });
}

interface ArticleCardProps {
  article: Article;
  variant?: 'horizontal' | 'vertical';
  locale?: string;
  priority?: boolean;
  /** Show excerpt text */
  showExcerpt?: boolean;
  /** Show author name */
  showAuthor?: boolean;
  className?: string;
}

export function ArticleCard({
  article,
  variant = 'vertical',
  locale = 'en',
  priority = false,
  showExcerpt = true,
  showAuthor = true,
  className = '',
}: ArticleCardProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';
  const href = `${prefix}/article/${article.slug}`;
  const imageUrl = resolveImageUrl(article.coverImage?.url);

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className={`group flex gap-4 items-start rounded-xl p-3 -mx-3 hover:bg-gray-50 transition-colors duration-150 ${className}`}
      >
        {/* Thumbnail */}
        <div className="relative w-28 h-20 sm:w-32 sm:h-22 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={article.coverImage?.alternativeText ?? article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 112px, 128px"
            priority={priority}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {article.category && (
              <span className="category-badge mb-2 inline-block">
                {article.category.name}
              </span>
            )}
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-150">
              {article.title}
            </h3>
            {showExcerpt && article.excerpt && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {showAuthor && article.author && (
              <>
                <span className="text-xs text-gray-500 font-medium">
                  {article.author.name}
                </span>
                <span className="text-xs text-gray-300" aria-hidden>·</span>
              </>
            )}
            <time
              dateTime={article.publishedAt}
              className="text-xs text-gray-400"
            >
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  // Vertical (grid) variant
  return (
    <Link
      href={href}
      className={`group block rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 article-card ${className}`}
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={article.coverImage?.alternativeText ?? article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {article.category && (
          <span className="category-badge mb-2 inline-block">
            {article.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-150">
          {article.title}
        </h3>
        {showExcerpt && article.excerpt && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {showAuthor && article.author && (
            <>
              <span className="text-xs text-gray-500 font-medium">
                {article.author.name}
              </span>
              <span className="text-xs text-gray-300" aria-hidden>·</span>
            </>
          )}
          <time
            dateTime={article.publishedAt}
            className="text-xs text-gray-400"
          >
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </Link>
  );
}
