// src/lib/seo.ts
// SEO metadata generation for site, article, and page contexts

import type { Metadata } from 'next';
import type { Site, Article } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3201';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';

/**
 * Resolves a potentially relative Strapi media URL to an absolute URL.
 */
function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_URL}${url}`;
}

/**
 * Resolves OG image URL from new media field or legacy seoDefaults.ogImageUrl.
 * Priority: article seo > article cover > site.ogImage media > site.seoDefaults.ogImageUrl
 */
function resolveOgImageUrl(site: Site | null): string | undefined {
  // New: media upload field
  if (site?.ogImage?.url) return resolveMediaUrl(site.ogImage.url);
  // Legacy: string in seoDefaults JSON
  if (site?.seoDefaults?.ogImageUrl) return resolveMediaUrl(site.seoDefaults.ogImageUrl);
  return undefined;
}

/**
 * Generates Next.js Metadata from site config + optional page/article overrides.
 * Merges: article.seo > site.seoDefaults
 */
export function generateSiteMetadata(
  site: Site | null,
  opts?: {
    page?: {
      title?: string;
      description?: string;
      path?: string;
    };
    article?: Article;
  }
): Metadata {
  const { page, article } = opts ?? {};

  const siteName = site?.name ?? 'News Platform';
  const seoDefaults = site?.seoDefaults;

  // ── Title ──────────────────────────────────
  let title: string;
  if (article?.seo?.metaTitle) {
    title = article.seo.metaTitle;
  } else if (article?.title) {
    title = `${article.title} | ${siteName}`;
  } else if (page?.title) {
    title = `${page.title} | ${siteName}`;
  } else {
    title = seoDefaults?.title ?? siteName;
  }

  // ── Description ────────────────────────────
  let description: string;
  if (article?.seo?.metaDescription) {
    description = article.seo.metaDescription;
  } else if (article?.excerpt) {
    description = article.excerpt;
  } else if (page?.description) {
    description = page.description;
  } else {
    description = seoDefaults?.description ?? '';
  }

  // ── OG Image ───────────────────────────────
  let ogImage: string | undefined;
  if (article?.seo?.ogImage) {
    ogImage = resolveMediaUrl(article.seo.ogImage);
  } else if (article?.coverImage?.url) {
    ogImage = resolveMediaUrl(article.coverImage.url);
  } else {
    ogImage = resolveOgImageUrl(site);
  }

  // ── Canonical URL ──────────────────────────
  let canonical: string | undefined;
  if (article?.slug) {
    canonical = `${SITE_URL}/article/${article.slug}`;
  } else if (page?.path) {
    canonical = `${SITE_URL}${page.path}`;
  }

  // ── Build Metadata ─────────────────────────
  const metadata: Metadata = {
    title,
    description: description || undefined,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description: description || undefined,
      siteName,
      locale: 'en_US',
      type: article ? 'article' : 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      ...(canonical ? { url: canonical } : {}),
      ...(article?.publishedAt
        ? { publishedTime: article.publishedAt }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(canonical ? { alternates: { canonical } } : {}),
    robots: {
      index: true,
      follow: true,
    },
  };

  return metadata;
}

/**
 * Generates structured data (JSON-LD) for an article page.
 */
export function generateArticleJsonLd(
  article: Article,
  site: Site | null
): string {
  const siteUrl = SITE_URL;
  const imageUrl = resolveMediaUrl(article.coverImage?.url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? '',
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: article.author
      ? {
          '@type': 'Person',
          name: article.author.name,
          url: `${siteUrl}/author/${article.author.slug}`,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: site?.name ?? 'News Platform',
      url: siteUrl,
    },
    url: `${siteUrl}/article/${article.slug}`,
    creator: {
      '@type': 'SoftwareApplication',
      name: 'Perplexity Computer',
      url: 'https://www.perplexity.ai/computer',
    },
  };

  return JSON.stringify(jsonLd);
}
