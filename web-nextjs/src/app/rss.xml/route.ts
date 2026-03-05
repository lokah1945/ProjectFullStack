// src/app/rss.xml/route.ts
// RSS 2.0 feed per site

import { headers } from 'next/headers';
import { fetchAllArticlesForSite, fetchSiteBySlug } from '@/lib/strapi';

// R1.2: Revalidate every hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3201';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

export async function GET() {
  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [articles, site] = await Promise.all([
    fetchAllArticlesForSite(siteSlug, locale).catch(() => []),
    fetchSiteBySlug(siteSlug).catch(() => null),
  ]);

  const baseUrl = SITE_URL;
  const siteName = site?.name ?? 'News Platform';
  const siteDescription =
    site?.seoDefaults?.description ?? `${siteName} RSS Feed`;
  const buildDate = new Date().toUTCString();

  const itemsXml = articles
    .slice(0, 100) // RSS best practice: limit to 100 most recent
    .map(article => {
      const articleUrl = `${baseUrl}/article/${article.slug}`;
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toUTCString()
        : buildDate;
      const imageUrl = resolveImageUrl(article.coverImage?.url ?? null);
      const description = escapeXml(article.excerpt ?? article.title);

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      ${article.category ? `<category>${escapeXml(article.category.name)}</category>` : ''}
      ${imageUrl ? `<enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0" />` : ''}
      ${article.author ? `<author>${escapeXml(article.author.name)}</author>` : ''}
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>${locale === 'id' ? 'id-ID' : 'en-US'}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <generator>Next.js Multi-Site Platform</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
