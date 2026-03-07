// src/middleware.ts
// Multi-site middleware: resolves domain → site slug/id/locale
// Injects minimal headers: x-site-slug, x-site-id, x-locale
// Rewrites file-extension paths to shared-file API
//
// File serving rules:
//   domain.com/shared/somefile.txt  → reads from  web-nextjs/shared/somefile.txt
//   domain.com/somefile.txt         → reads from  web-nextjs/sites/{SiteName}/somefile.txt

import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface SiteCache {
  slug: string;
  id: string;
  name: string;
  defaultLocale: string;
  timestamp: number;
}

// In-memory TTL cache: domain → site info
const siteCache = new Map<string, SiteCache>();

function getCached(domain: string): SiteCache | null {
  const entry = siteCache.get(domain);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    siteCache.delete(domain);
    return null;
  }
  return entry;
}

async function resolveSite(domain: string): Promise<SiteCache | null> {
  // Check cache first
  const cached = getCached(domain);
  if (cached) return cached;

  try {
    // Use public endpoint (auth: false) — no Bearer token needed
    const url = `${STRAPI_URL}/api/sites/by-domain?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
      next: { revalidate: 0 }, // bypass Next.js cache in middleware
    });

    if (!res.ok) {
      console.warn(`[Middleware] Site lookup failed for ${domain}: ${res.status}`);
      return null;
    }

    const body = await res.json();

    // Handle both {data: {...}} and {data: [...]} response shapes
    const siteData = Array.isArray(body.data) ? body.data[0] : body.data;
    if (!siteData) return null;

    const entry: SiteCache = {
      slug: siteData.slug as string,
      id: siteData.documentId as string,
      name: siteData.name as string,
      defaultLocale: (siteData.defaultLocale as string) || 'en',
      timestamp: Date.now(),
    };

    siteCache.set(domain, entry);
    return entry;
  } catch (err) {
    console.error(`[Middleware] Error resolving site for ${domain}:`, err);
    return null;
  }
}

export const config = {
  // Match all paths EXCEPT internal Next.js paths (_next, _static, _vercel).
  // /api is NOT excluded here so that we can intercept file-extension paths.
  // Real /api/* requests are short-circuited inside the middleware function.
  matcher: ['/((?!_next|_static|_vercel).*)'],
};

export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;

  // ── Skip real API routes — don't process /api/* paths ──────────────────────
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ── Determine site for this request ────────────────────────────────────────
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || '';
  const domain = host.split(':')[0] || '';

  let site: SiteCache | null = null;

  if (domain === 'localhost' || domain === '127.0.0.1') {
    site = await resolveSite('localhost:3201');
    if (!site) {
      site = await resolveSite('glimpseit.online');
    }
    if (!site) {
      site = {
        slug: 'glimpseit',
        id: 'dev-fallback',
        name: 'GlimpseIt',
        defaultLocale: 'en',
        timestamp: Date.now(),
      };
    }
  } else {
    site = await resolveSite(domain);
  }

  // ── File serving ───────────────────────────────────────────────────────────
  //
  // Known public/ assets that Next.js must serve directly — never rewrite these.
  const PUBLIC_PREFIXES = [
    '/logos/',
    '/favicons/',
    '/og/',
    '/placeholder-',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap',
  ];
  const isPublicAsset = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Check if path has a file extension (e.g. .txt, .php, .html)
  const hasFileExtension = /\.([a-zA-Z0-9]+)$/.test(pathname);

  if (hasFileExtension && !isPublicAsset) {
    // ── Case 1: /shared/somefile.txt → read from shared/ directory ──────────
    // URL pattern: domain.com/shared/anything.ext
    if (pathname.startsWith('/shared/')) {
      const relativePath = pathname.slice('/shared/'.length); // "somefile.txt"
      if (relativePath && !relativePath.startsWith('_')) {
        const rewriteHeaders = new Headers(request.headers);
        rewriteHeaders.set('x-serve-source', 'shared');
        rewriteHeaders.set('x-serve-path', relativePath);

        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = '/api/shared-file';
        rewriteUrl.searchParams.set('source', 'shared');
        rewriteUrl.searchParams.set('path', relativePath);

        return NextResponse.rewrite(rewriteUrl, {
          request: { headers: rewriteHeaders },
        });
      }
    }

    // ── Case 2: /somefile.txt → read from sites/{SiteName}/ directory ───────
    // URL pattern: domain.com/anything.ext  (no /shared/ prefix)
    const relativePath = pathname.slice(1); // remove leading /
    if (
      relativePath &&
      !relativePath.startsWith('_') &&
      !relativePath.startsWith('api/')
    ) {
      const rewriteHeaders = new Headers(request.headers);
      rewriteHeaders.set('x-serve-source', 'site');
      rewriteHeaders.set('x-serve-path', relativePath);
      if (site?.name) {
        rewriteHeaders.set('x-serve-site', site.name);
      }

      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = '/api/shared-file';
      rewriteUrl.searchParams.set('source', 'site');
      rewriteUrl.searchParams.set('path', relativePath);
      if (site?.name) {
        rewriteUrl.searchParams.set('siteName', site.name);
      }

      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: rewriteHeaders },
      });
    }
  }

  // ── Site resolution for page routes ────────────────────────────────────────
  if (!site) {
    return NextResponse.next({ request: { headers } });
  }

  // Detect locale from URL path prefix (/id/...)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const urlLocale = localeMatch ? localeMatch[1] : null;
  const locale = urlLocale === 'id' ? 'id' : 'en';

  // Inject minimal headers for downstream consumption
  headers.set('x-site-slug', site.slug);
  headers.set('x-site-id', site.id);
  headers.set('x-locale', locale);

  return NextResponse.next({
    request: { headers },
  });
}
