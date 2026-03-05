// src/app/article/[slug]/page.tsx
// Article detail page with sidebar, in-article ads, related articles

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  fetchTrendingArticles,
  fetchFeaturedArticles,
  fetchAdSlots,
  fetchSiteBySlug,
  fetchNavCategories,
} from '@/lib/strapi';
import { generateSiteMetadata, generateArticleJsonLd } from '@/lib/seo';
import { getInArticleSlots } from '@/lib/ad-utils';
import { AdSlotComponent } from '@/components/ad-slot';
import { NativeAdCard } from '@/components/native-ad-card';
import { SidebarWidgets } from '@/components/sidebar-widgets';
import { AdInsertionEngine } from '@/components/ad-insertion-engine';
import { HeaderNav } from '@/components/header-nav';
import { Footer } from '@/components/footer';

// R1.2: Explicit revalidate
export const revalidate = 300;

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';
function resolveImageUrl(url?: string | null): string {
  if (!url) return '/placeholder-cover.jpg';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

// R1.1: params is Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // R1.1
  const headersList = await headers(); // R1.1
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [article, site] = await Promise.all([
    fetchArticleBySlug(siteSlug, slug, locale).catch(() => null),
    fetchSiteBySlug(siteSlug).catch(() => null),
  ]);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return generateSiteMetadata(site, { article });
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>; // R1.1
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // R1.1: await params
  const { slug } = await params;

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [
    article,
    adSlots,
    site,
    categories,
  ] = await Promise.all([
    fetchArticleBySlug(siteSlug, slug, locale).catch(() => null),
    fetchAdSlots().catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  if (!article) {
    notFound();
  }

  // Fetch related articles and sidebar data
  const categorySlug = article.category?.slug ?? '';
  const [relatedArticles, trendingArticles, featuredArticles] = await Promise.all([
    categorySlug
      ? fetchRelatedArticles(siteSlug, categorySlug, article.documentId, 4, locale).catch(() => [])
      : Promise.resolve([]),
    fetchTrendingArticles(siteSlug, 5, locale).then(r => r.data).catch(() => []),
    fetchFeaturedArticles(siteSlug, 5, locale).then(r => r.data).catch(() => []),
  ]);

  // Get in-article ad slots
  const inArticleSlots = getInArticleSlots(adSlots);
  const articleTopLeaderboard = adSlots.find(s => s.slotKey === 'article_top_leaderboard');
  const articleBottomLeaderboard = adSlots.find(s => s.slotKey === 'article_bottom_leaderboard');
  const nativeArticleBottom = adSlots.find(s => s.slotKey === 'native_article_bottom');

  const jsonLd = generateArticleJsonLd(article, site);

  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <HeaderNav site={site} categories={categories} locale={locale} />

      <main className="flex-1">
        {/* Article Top Leaderboard Ad */}
        {articleTopLeaderboard && (
          <div className="container-content pt-4">
            <AdSlotComponent slot={articleTopLeaderboard} />
          </div>
        )}

        <article className="container-content py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
            {/* Main Article Content */}
            <div>
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <a href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</a>
                <span aria-hidden>›</span>
                {article.category && (
                  <>
                    <a
                      href={`/category/${article.category.slug}`}
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      {article.category.name}
                    </a>
                    <span aria-hidden>›</span>
                  </>
                )}
                <span className="text-gray-700 truncate">{article.title}</span>
              </nav>

              {/* Category Badge */}
              {article.category && (
                <a href={`/category/${article.category.slug}`} className="category-badge mb-4 inline-block">
                  {article.category.name}
                </a>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-900 leading-tight mb-4">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed mb-6 pb-6 border-b border-gray-100">
                  {article.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
                {article.author && (
                  <div className="flex items-center gap-2">
                    {article.author.avatar?.url && (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={resolveImageUrl(article.author.avatar.url)}
                          alt={article.author.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    )}
                    <span className="font-medium text-gray-700">{article.author.name}</span>
                  </div>
                )}
                <time dateTime={article.publishedAt} className="text-gray-400">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </time>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {article.tags.map(tag => (
                      <span key={tag.documentId} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cover Image */}
              {article.coverImage?.url && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-gray-100">
                  <Image
                    src={resolveImageUrl(article.coverImage.url)}
                    alt={article.coverImage.alternativeText ?? article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 740px"
                    priority
                  />
                </div>
              )}

              {/* Article Content with Ad Insertion */}
              {article.content && article.content.length > 0 ? (
                <AdInsertionEngine
                  content={article.content}
                  inArticleSlots={inArticleSlots}
                  className="prose max-w-none"
                />
              ) : (
                <p className="text-gray-400">Content not available.</p>
              )}

              {/* Article Bottom Leaderboard */}
              {articleBottomLeaderboard && (
                <div className="mt-8">
                  <AdSlotComponent slot={articleBottomLeaderboard} />
                </div>
              )}

              {/* Native ad at bottom */}
              {nativeArticleBottom && (
                <div className="mt-6">
                  <NativeAdCard slot={nativeArticleBottom} />
                </div>
              )}

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-100">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
                    Related Articles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedArticles.map(related => (
                      <a
                        key={related.documentId}
                        href={`/article/${related.slug}`}
                        className="group flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-[var(--color-primary-light)] hover:bg-gray-50 transition-colors article-card"
                      >
                        {related.coverImage?.url && (
                          <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={resolveImageUrl(related.coverImage.url)}
                              alt={related.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {related.category && (
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
                              {related.category.name}
                            </span>
                          )}
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-[var(--color-primary)] transition-colors">
                            {related.title}
                          </h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <SidebarWidgets
                  trendingArticles={trendingArticles}
                  featuredArticles={featuredArticles}
                  adSlots={adSlots}
                  locale={locale}
                />
              </div>
            </aside>
          </div>
        </article>
      </main>

      <Footer site={site} categories={categories} locale={locale} />
    </div>
  );
}
