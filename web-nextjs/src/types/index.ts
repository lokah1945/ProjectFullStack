// src/types/index.ts
// Central TypeScript type definitions for the multi-site blog/news platform

// ─────────────────────────────────────────────
// Ad System Types
// ─────────────────────────────────────────────

export type SizePreset = {
  width: number;
  height: number;
  minHeight: number;
};

export type SizePresetMap = {
  MOBILE_BANNER_50: SizePreset;
  MOBILE_BANNER_100: SizePreset;
  MREC: SizePreset;
  LARGE_MREC: SizePreset;
  LEADERBOARD: SizePreset;
  LARGE_LEADERBOARD: SizePreset;
  BILLBOARD: SizePreset;
  WIDE_SKYSCRAPER: SizePreset;
  HALF_PAGE: SizePreset;
  [key: string]: SizePreset;
};

export type AdUnitType = 'banner' | 'native_object';

export type AdDeviceTarget = 'all' | 'mobile' | 'tablet' | 'desktop';

export type AdPlacement =
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'in_article'
  | 'between_list'
  | 'sticky_bottom'
  | 'search_top'
  | 'search_bottom'
  | 'listing_between';

export interface AdUnit {
  documentId: string;
  name: string;
  type: AdUnitType;
  codes: string[];
  isActive: boolean;
}

export interface AdSlot {
  documentId: string;
  slotKey: string;
  placement: AdPlacement;
  sizePreset: string;
  enabled: boolean;
  adUnit: AdUnit | null;
  deviceTarget: AdDeviceTarget;
  responsiveSizes?: Record<string, string> | null;
  lazyDelayMs: number;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
}

// ─────────────────────────────────────────────
// Site Configuration Types
// ─────────────────────────────────────────────

export interface SiteTheme {
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
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
  ogImageUrl: string;
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
  isFeatured: boolean;
  isTrending: boolean;
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
