// src/components/featured-hero.tsx
// Hero section: 1 large featured article + 2–4 supporting articles
import type { Article } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface FeaturedHeroProps {
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
    year: 'numeric',
  });
}

export function FeaturedHero({ articles, locale = 'en' }: FeaturedHeroProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';
  const [main, ...rest] = articles;
  if (!main) return null;

  const supporting = rest.slice(0, 3);

  return (
    <section aria-label="Featured articles" className="w-full">
      <div className="container-content py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 xl:gap-8">

          {/* ── Main Hero ───────────────────────────────── */}
          <Link
            href={`${prefix}/article/${main.slug}`}
            className="group block relative rounded-2xl overflow-hidden bg-gray-100 article-card"
            aria-label={`Read: ${main.title}`}
          >
            {/* Cover image */}
            <div className="relative aspect-[16/9] md:aspect-[21/11] lg:aspect-[16/9] xl:aspect-[21/11]">
              <Image
                src={resolveImageUrl(main.coverImage?.url)}
                alt={main.coverImage?.alternativeText ?? main.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              {main.category && (
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/25 px-3 py-1 rounded-full mb-3">
                  {main.category.name}
                </span>
              )}
              <h1 className="font-bold text-xl md:text-2xl xl:text-3xl leading-tight mb-2 group-hover:underline decoration-white/50 underline-offset-2 transition-all duration-150"
                style={{ fontFamily: 'var(--font-jakarta)' }}>
                {main.title}
              </h1>
              {main.excerpt && (
                <p className="text-sm md:text-base text-white/75 line-clamp-2 leading-relaxed max-w-2xl">
                  {main.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 mt-4">
                {main.author && (
                  <>
                    {main.author.avatar?.url && (
                      <Image
                        src={resolveImageUrl(main.author.avatar.url)}
                        alt={main.author.name}
                        width={28}
                        height={28}
                        className="rounded-full object-cover ring-1 ring-white/30"
                      />
                    )}
                    <span className="text-xs text-white/80 font-medium">{main.author.name}</span>
                    <span className="text-white/40" aria-hidden>·</span>
                  </>
                )}
                <time dateTime={main.publishedAt} className="text-xs text-white/60">
                  {formatDate(main.publishedAt)}
                </time>
              </div>
            </div>
          </Link>

          {/* ── Supporting Articles ──────────────────────── */}
          {supporting.length > 0 && (
            <div className="flex flex-col gap-4">
              {supporting.map((article, idx) => (
                <Link
                  key={article.documentId}
                  href={`${prefix}/article/${article.slug}`}
                  className="group flex gap-4 items-start rounded-xl p-3 -mx-3 hover:bg-gray-50 transition-colors duration-150"
                  aria-label={`Read: ${article.title}`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-18 sm:w-28 sm:h-20 lg:w-24 lg:h-18 xl:w-28 xl:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={resolveImageUrl(article.coverImage?.url)}
                      alt={article.coverImage?.alternativeText ?? article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="112px"
                      priority={idx < 2}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    {article.category && (
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-150"
                      style={{ fontFamily: 'var(--font-jakarta)' }}>
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {article.author && (
                        <>
                          <span className="text-xs text-gray-500">{article.author.name}</span>
                          <span className="text-gray-300" aria-hidden>·</span>
                        </>
                      )}
                      <time dateTime={article.publishedAt} className="text-xs text-gray-400">
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
