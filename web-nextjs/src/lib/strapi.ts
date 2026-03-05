// src/lib/strapi.ts
// Centralized Strapi API fetch helper with auth and caching

import type {
  StrapiListResponse,
  StrapiSingleResponse,
  Article,
  Category,
  Site,
  AdSlot,
  Tag,
  Author,
} from '@/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || '';

// ─────────────────────────────────────────────
// Core Fetch Helpers
// ─────────────────────────────────────────────

/**
 * Authenticated fetch for protected Strapi endpoints.
 * Includes Authorization: Bearer token (R3) and explicit revalidate (R1.2).
 */
export async function fetchStrapi<T>(
  path: string,
  opts?: { revalidate?: number }
): Promise<T> {
  const url = `${STRAPI_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      'Content-Type': 'application/json',
    },
    next: { revalidate: opts?.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(
      `Strapi error ${res.status}: ${res.statusText} for ${path}`
    );
  }

  return res.json() as Promise<T>;
}

/**
 * Public fetch for endpoints with auth: false (health, by-domain, search).
 * No Bearer token, explicit revalidate (R1.2).
 */
export async function fetchStrapiPublic<T>(
  path: string,
  opts?: { revalidate?: number }
): Promise<T> {
  const url = `${STRAPI_URL}${path}`;
  const res = await fetch(url, {
    next: { revalidate: opts?.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(
      `Strapi error ${res.status}: ${res.statusText} for ${path}`
    );
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Article Helpers
// ─────────────────────────────────────────────

const ARTICLE_POPULATE =
  'populate[coverImage]=true&populate[category]=true&populate[tags]=true&populate[author][populate][avatar]=true&populate[site]=true';

export async function fetchArticles(
  siteSlug: string,
  opts?: {
    filters?: Record<string, string | boolean | number>;
    page?: number;
    pageSize?: number;
    sort?: string;
    locale?: string;
    revalidate?: number;
  }
): Promise<StrapiListResponse<Article>> {
  const {
    page = 1,
    pageSize = 10,
    sort = 'publishedAt:desc',
    locale = 'en',
    revalidate = 60,
  } = opts ?? {};

  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
    sort,
    locale,
  });

  // Apply extra filters
  if (opts?.filters) {
    for (const [key, value] of Object.entries(opts.filters)) {
      params.set(key, String(value));
    }
  }

  const path = `/api/articles?${params.toString()}&${ARTICLE_POPULATE}`;
  return fetchStrapi<StrapiListResponse<Article>>(path, { revalidate });
}

export async function fetchFeaturedArticles(
  siteSlug: string,
  limit = 5,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  return fetchArticles(siteSlug, {
    filters: { 'filters[isFeatured][$eq]': 'true' },
    pageSize: limit,
    locale,
    revalidate: 120,
  });
}

export async function fetchTrendingArticles(
  siteSlug: string,
  limit = 6,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  return fetchArticles(siteSlug, {
    filters: { 'filters[isTrending][$eq]': 'true' },
    pageSize: limit,
    locale,
    revalidate: 120,
  });
}

export async function fetchLatestArticles(
  siteSlug: string,
  limit = 10,
  page = 1,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  return fetchArticles(siteSlug, {
    page,
    pageSize: limit,
    sort: 'publishedAt:desc',
    locale,
    revalidate: 60,
  });
}

export async function fetchArticleBySlug(
  siteSlug: string,
  slug: string,
  locale = 'en'
): Promise<Article | null> {
  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'filters[slug][$eq]': slug,
    locale,
  });

  const path = `/api/articles?${params.toString()}&${ARTICLE_POPULATE}&populate[content]=true`;

  try {
    const res = await fetchStrapi<StrapiListResponse<Article>>(path, {
      revalidate: 300,
    });
    return res.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchArticle(
  documentId: string,
  locale = 'en'
): Promise<Article | null> {
  const params = new URLSearchParams({ locale });
  const path = `/api/articles/${documentId}?${params.toString()}&${ARTICLE_POPULATE}&populate[content]=true`;

  try {
    const res = await fetchStrapi<StrapiSingleResponse<Article>>(path, {
      revalidate: 300,
    });
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchArticlesByCategory(
  siteSlug: string,
  categorySlug: string,
  page = 1,
  pageSize = 10,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  return fetchArticles(siteSlug, {
    filters: { 'filters[category][slug][$eq]': categorySlug },
    page,
    pageSize,
    sort: 'publishedAt:desc',
    locale,
    revalidate: 60,
  });
}

export async function fetchRelatedArticles(
  siteSlug: string,
  categorySlug: string,
  excludeDocumentId: string,
  limit = 4,
  locale = 'en'
): Promise<Article[]> {
  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'filters[category][slug][$eq]': categorySlug,
    'filters[documentId][$ne]': excludeDocumentId,
    'pagination[pageSize]': String(limit),
    sort: 'publishedAt:desc',
    locale,
  });

  const path = `/api/articles?${params.toString()}&${ARTICLE_POPULATE}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Article>>(path, {
      revalidate: 120,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Category Helpers
// ─────────────────────────────────────────────

export async function fetchCategories(
  siteSlug: string,
  locale = 'en'
): Promise<Category[]> {
  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'pagination[pageSize]': '50',
    sort: 'navOrder:asc',
    locale,
  });

  const path = `/api/categories?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Category>>(path, {
      revalidate: 300,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchNavCategories(
  siteSlug: string,
  locale = 'en'
): Promise<Category[]> {
  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'filters[isInNav][$eq]': 'true',
    'pagination[pageSize]': '10',
    sort: 'navOrder:asc',
    locale,
  });

  const path = `/api/categories?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Category>>(path, {
      revalidate: 300,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Tag Helpers
// ─────────────────────────────────────────────

export async function fetchTags(
  siteSlug: string,
  locale = 'en'
): Promise<Tag[]> {
  const params = new URLSearchParams({
    'filters[site][slug][$eq]': siteSlug,
    'pagination[pageSize]': '50',
    locale,
  });

  const path = `/api/tags?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Tag>>(path, {
      revalidate: 300,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Author Helpers
// ─────────────────────────────────────────────

export async function fetchAuthorBySlug(slug: string): Promise<Author | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate[avatar]=true': 'true',
  });

  const path = `/api/authors?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Author>>(path, {
      revalidate: 600,
    });
    return res.data?.[0] ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// Site Config Helpers
// ─────────────────────────────────────────────

export async function fetchSiteConfig(
  domain: string
): Promise<Site | null> {
  try {
    const res = await fetchStrapiPublic<{ data: Site | null }>(
      `/api/sites/by-domain?domain=${encodeURIComponent(domain)}`,
      { revalidate: 300 }
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchSiteBySlug(slug: string): Promise<Site | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate[categories]=true': 'true',
  });

  const path = `/api/sites?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Site>>(path, {
      revalidate: 300,
    });
    return res.data?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchAllSites(): Promise<Site[]> {
  const path = `/api/sites?pagination[pageSize]=50`;
  try {
    const res = await fetchStrapi<StrapiListResponse<Site>>(path, {
      revalidate: 600,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Ad Slot Helpers
// ─────────────────────────────────────────────

export async function fetchAdSlots(): Promise<AdSlot[]> {
  const params = new URLSearchParams({
    'filters[enabled][$eq]': 'true',
    'pagination[pageSize]': '50',
    'populate[adUnit]=true': 'true',
  });

  const path = `/api/ad-slots?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<AdSlot>>(path, {
      revalidate: 300,
    });
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchAdSlotByKey(slotKey: string): Promise<AdSlot | null> {
  const params = new URLSearchParams({
    'filters[slotKey][$eq]': slotKey,
    'filters[enabled][$eq]': 'true',
    'populate[adUnit]=true': 'true',
  });

  const path = `/api/ad-slots?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<AdSlot>>(path, {
      revalidate: 300,
    });
    return res.data?.[0] ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// All Articles for Sitemap / RSS
// ─────────────────────────────────────────────

export async function fetchAllArticlesForSite(
  siteSlug: string,
  locale = 'en'
): Promise<Article[]> {
  const allArticles: Article[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const params = new URLSearchParams({
      'filters[site][slug][$eq]': siteSlug,
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'excerpt',
      'fields[3]': 'publishedAt',
      locale,
    });

    try {
      const res = await fetchStrapi<StrapiListResponse<Article>>(
        `/api/articles?${params.toString()}`,
        { revalidate: 3600 }
      );

      if (!res.data || res.data.length === 0) break;
      allArticles.push(...res.data);

      if (page >= res.meta.pagination.pageCount) break;
      page++;
    } catch {
      break;
    }
  }

  return allArticles;
}
