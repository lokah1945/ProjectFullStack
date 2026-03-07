// src/lib/strapi.ts
// Centralized Strapi API fetch helper with auth and caching

import type {
  StrapiListResponse,
  StrapiSingleResponse,
  Article,
  Category,
  Site,
  AdGroup,
  SiteAds,
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
  'populate[0]=coverImage&populate[1]=category&populate[2]=tags&populate[3]=author.avatar&populate[4]=site';

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

/**
 * Fetch featured articles — sorted by total views in last 3 days.
 * Uses custom endpoint GET /api/articles/featured (auth: false).
 * Falls back to latest articles when no view data exists yet.
 */
export async function fetchFeaturedArticles(
  siteSlug: string,
  limit = 5,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  const params = new URLSearchParams({
    site: siteSlug,
    limit: String(limit),
    locale,
  });

  try {
    return await fetchStrapiPublic<StrapiListResponse<Article>>(
      `/api/articles/featured?${params.toString()}`,
      { revalidate: 120 }
    );
  } catch {
    // Fallback: return latest articles via standard endpoint
    return fetchArticles(siteSlug, {
      pageSize: limit,
      locale,
      revalidate: 120,
    });
  }
}

/**
 * Fetch trending articles — sorted by view velocity (avg views/hour) in last 3 days.
 * Uses custom endpoint GET /api/articles/trending (auth: false).
 * Falls back to latest articles when no view data exists yet.
 */
export async function fetchTrendingArticles(
  siteSlug: string,
  limit = 6,
  locale = 'en'
): Promise<StrapiListResponse<Article>> {
  const params = new URLSearchParams({
    site: siteSlug,
    limit: String(limit),
    locale,
  });

  try {
    return await fetchStrapiPublic<StrapiListResponse<Article>>(
      `/api/articles/trending?${params.toString()}`,
      { revalidate: 120 }
    );
  } catch {
    // Fallback: return latest articles via standard endpoint
    return fetchArticles(siteSlug, {
      pageSize: limit,
      locale,
      revalidate: 120,
    });
  }
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

  const path = `/api/articles?${params.toString()}&${ARTICLE_POPULATE}`;

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
  const path = `/api/articles/${documentId}?${params.toString()}&${ARTICLE_POPULATE}`;

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
    'populate[0]': 'avatar',
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
    'populate[0]': 'categories',
    'populate[1]': 'logo',
    'populate[2]': 'favicon',
    'populate[3]': 'ogImage',
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
// Ad Group Helpers
// ─────────────────────────────────────────────

/**
 * Fetch all enabled ad groups for a specific site.
 *
 * Strategy: fetch ALL ad groups via authenticated core REST API (with Bearer token),
 * populate the `sites` relation, then filter client-side by siteSlug.
 */
export async function fetchAdGroups(siteSlug: string): Promise<AdGroup[]> {
  const params = new URLSearchParams({
    'filters[enabled][$eq]': 'true',
    'pagination[pageSize]': '100',
    'populate[sites][fields][0]': 'slug',
  });

  const path = `/api/ad-groups?${params.toString()}`;
  try {
    const res = await fetchStrapi<StrapiListResponse<AdGroup>>(path, {
      revalidate: 30,
    });

    const allGroups = res.data ?? [];

    // Client-side filter: only groups linked to the requested site
    return allGroups.filter((group) => {
      if (!group.sites || !Array.isArray(group.sites)) return false;
      return group.sites.some((s) => s.slug === siteSlug);
    });
  } catch (err) {
    console.error(
      '[fetchAdGroups] Failed to fetch ad groups via authenticated API.',
      'If 403: ensure your API Token (Settings → API Tokens) has "find" permission for Ad-group.',
      err
    );

    // Fallback: try custom public endpoint (auth: false)
    try {
      const fallbackPath = `/api/ad-groups/by-site?site=${encodeURIComponent(siteSlug)}`;
      const fallbackRes = await fetchStrapiPublic<{ data: AdGroup[] }>(fallbackPath, {
        revalidate: 30,
      });
      return fallbackRes.data ?? [];
    } catch (fallbackErr) {
      console.error(
        '[fetchAdGroups] Fallback also failed. Ads will not render.',
        fallbackErr
      );
      return [];
    }
  }
}

/**
 * Helper to resolve a single ad slot from an AdGroup field.
 * Returns AdSlot if code is non-empty, null otherwise.
 */
function resolveSlot(
  code: string | null | undefined,
  height: number | null | undefined,
  defaultHeight: number
): AdSlot | null {
  if (!code || code.trim() === '') return null;
  return { code, height: height ?? defaultHeight };
}

/**
 * Pick one random enabled AdGroup and resolve all its slots into SiteAds.
 *
 * Logic:
 *   1. If no groups → all slots are null (no ads)
 *   2. If multiple groups → pick one at random (rotation at group level)
 *   3. Each slot: non-empty code → AdSlot, empty/null → null
 *
 * NOTE: This runs on the server during SSR. The random pick means
 * different page renders may show different ad groups. For consistent
 * rotation across a session, consider cookie-based group selection.
 */
export function pickSiteAds(groups: AdGroup[]): SiteAds {
  const empty: SiteAds = {
    headerBanner: null,
    footerBanner: null,
    sidebarBanner: null,
    inArticleBanner: null,
    inArticleNative: null,
    betweenListBanner: null,
    stickyBottom: null,
  };

  if (!groups || groups.length === 0) return empty;

  // Pick one random group
  const group = groups[Math.floor(Math.random() * groups.length)];
  if (!group.enabled) return empty;

  return {
    headerBanner: resolveSlot(group.headerBanner, group.headerBannerHeight, 90),
    footerBanner: resolveSlot(group.footerBanner, group.footerBannerHeight, 90),
    sidebarBanner: resolveSlot(group.sidebarBanner, group.sidebarBannerHeight, 250),
    inArticleBanner: resolveSlot(group.inArticleBanner, group.inArticleBannerHeight, 250),
    inArticleNative: resolveSlot(group.inArticleNative, group.inArticleNativeHeight, 250),
    betweenListBanner: resolveSlot(group.betweenListBanner, group.betweenListBannerHeight, 90),
    stickyBottom: resolveSlot(group.stickyBottom, group.stickyBottomHeight, 50),
  };
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
