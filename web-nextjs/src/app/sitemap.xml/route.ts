// src/app/sitemap.xml/route.ts
// XML Sitemap per site, generated server-side

import { headers } from 'next/headers';
import { fetchAllArticlesForSite, fetchSiteBySlug, fetchNavCategories } from '@/lib/strapi';

// R1.2: Revalidate every hour
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3201';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  const [articles, categories] = await Promise.all([
    fetchAllArticlesForSite(siteSlug, locale).catch(() => []),
    fetchNavCategories(siteSlug, locale).catch(() => []),
  ]);

  const site = await fetchSiteBySlug(siteSlug).catch(() => null);
  const baseUrl = SITE_URL;

  const staticUrls = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/latest`, priority: '0.9', changefreq: 'hourly' },
    { url: `${baseUrl}/featured`, priority: '0.8', changefreq: 'daily' },
    { url: `${baseUrl}/trending`, priority: '0.8', changefreq: 'hourly' },
    { url: `${baseUrl}/search`, priority: '0.5', changefreq: 'monthly' },
  ];

  const categoryUrls = categories.map(cat => ({
    url: `${baseUrl}/category/${cat.slug}`,
    priority: '0.7',
    changefreq: 'daily',
  }));

  const articleUrls = articles.map(article => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastmod: article.publishedAt
      ? new Date(article.publishedAt).toISOString().split('T')[0]
      : undefined,
    priority: '0.6',
    changefreq: 'weekly',
  }));

  const allUrls: Array<{ url: string; lastmod?: string; priority: string; changefreq: string }> =
    [...staticUrls, ...categoryUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    ({ url, lastmod, priority, changefreq }) => `  <url>
    <loc>${escapeXml(url)}</loc>${
      lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
    }
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
