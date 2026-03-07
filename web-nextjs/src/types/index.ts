// src/types/index.ts
// Central TypeScript type definitions for the multi-site blog/news platform

// ─────────────────────────────────────────────
// Ad System Types
// ─────────────────────────────────────────────

/**
 * Single ad slot — contains raw HTML code and a height for CLS prevention.
 * The code field is a plain text/html string, pasted directly in Strapi Admin.
 */
export interface AdSlot {
  code: string;
  height: number;
}

/**
 * Ad Group from Strapi — each slot is a plain text field (HTML code)
 * plus an integer height field.
 */
export interface AdGroup {
  documentId: string;
  name: string;
  enabled: boolean;
  sites?: Site[];
  headerBanner?: string | null;
  headerBannerHeight?: number | null;
  footerBanner?: string | null;
  footerBannerHeight?: number | null;
  sidebarBanner?: string | null;
  sidebarBannerHeight?: number | null;
  inArticleBanner?: string | null;
  inArticleBannerHeight?: number | null;
  inArticleNative?: string | null;
  inArticleNativeHeight?: number | null;
  betweenListBanner?: string | null;
  betweenListBannerHeight?: number | null;
  stickyBottom?: string | null;
  stickyBottomHeight?: number | null;
}

/**
 * Resolved ads for a specific site — one random AdGroup is picked,
 * and each slot is resolved to an AdSlot (code + height) or null.
 */
export interface SiteAds {
  headerBanner: AdSlot | null;
  footerBanner: AdSlot | null;
  sidebarBanner: AdSlot | null;
  inArticleBanner: AdSlot | null;
  inArticleNative: AdSlot | null;
  betweenListBanner: AdSlot | null;
  stickyBottom: AdSlot | null;
}

// ─────────────────────────────────────────────
// Media Types
// ─────────────────────────────────────────────

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

// ─────────────────────────────────────────────
// Site Configuration Types
// ─────────────────────────────────────────────

export interface SiteTheme {
  primaryColor: string;
  /** @deprecated Use site.logo media field instead */
  logoUrl?: string;
  /** @deprecated Use site.favicon media field instead */
  faviconUrl?: string;
}

export interface SiteNavConfig {
  showLatest: boolean;
  showFeatured: boolean;
  showTrending: boolean;
  maxCategoriesInNav: number;
}

export interface SiteSeoDefaults {
  title: string;
  description: string;
  /** @deprecated Use site.ogImage media field instead */
  ogImageUrl?: string;
}

export interface Site {
  documentId: string;
  name: string;
  slug: string;
  domains: string[];
  defaultLocale: string;
  enabled: boolean;
  theme: SiteTheme;
  navConfig: SiteNavConfig;
  seoDefaults: SiteSeoDefaults;
  description?: string;
  headCode?: string;
  bodyCode?: string;
  logo?: StrapiMedia | null;
  favicon?: StrapiMedia | null;
  ogImage?: StrapiMedia | null;
  articles?: Article[];
  categories?: Category[];
}

// ─────────────────────────────────────────────
// Content Types
// ─────────────────────────────────────────────

export interface Category {
  documentId: string;
  name: string;
  slug: string;
  isInNav: boolean;
  navOrder: number | null;
  site?: Site;
  articles?: Article[];
}

export interface Tag {
  documentId: string;
  name: string;
  slug: string;
  site?: Site;
  articles?: Article[];
}

export interface Author {
  documentId: string;
  name: string;
  slug: string;
  avatar?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
    formats?: Record<string, { url: string; width: number; height: number }>;
  } | null;
  bio?: string;
  articles?: Article[];
}

export interface ArticleSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

// BlocksContent: content type from @strapi/blocks-react-renderer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlocksContent = any[];

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
    formats?: Record<string, { url: string; width: number; height: number }>;
  } | null;
  content?: BlocksContent;
  seo?: ArticleSeo | null;
  publishedAt: string;
  site?: Site;
  category?: Category | null;
  tags?: Tag[];
  author?: Author | null;
}

// ─────────────────────────────────────────────
// Strapi API Response Types
// ─────────────────────────────────────────────

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: StrapiPagination;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Site Context (used by pages & layout)
// ─────────────────────────────────────────────

export interface SiteContext {
  slug: string;
  id: string;
  locale: string;
}

// ─────────────────────────────────────────────
// Page Props Helpers
// ─────────────────────────────────────────────

export interface PageProps {
  params: Promise<{ slug?: string; locale?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LocalePageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LocaleArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export interface LocaleCategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
