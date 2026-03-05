// src/middleware.ts
// Multi-site middleware: resolves domain → site slug/id/locale
// Injects minimal headers: x-site-slug, x-site-id, x-locale

import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:3200';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface SiteCache {
  slug: string;
  id: string;
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
  matcher: ['/((?!api|_next|_static|_vercel|.*\\..*).*)'],
};

export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);

  // Determine host — respect x-forwarded-host for reverse proxies
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || '';

  // Strip port if present
  const domain = host.split(':')[0] || '';

  // Detect locale from URL path prefix (/id/...)
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const urlLocale = localeMatch ? localeMatch[1] : null;
  // Only 'id' is a supported non-default locale
  const locale = urlLocale === 'id' ? 'id' : 'en';

  // Development fallback: localhost resolves to first available site
  let site: SiteCache | null = null;

  if (domain === 'localhost' || domain === '127.0.0.1') {
    // Try to resolve using localhost:3201 as domain, fallback to glimpseit
    site = await resolveSite('localhost:3201');
    if (!site) {
      site = await resolveSite('glimpseit.online');
    }
    if (!site) {
      // Hard fallback for local dev when Strapi is not running
      site = {
        slug: 'glimpseit',
        id: 'dev-fallback',
        defaultLocale: 'en',
        timestamp: Date.now(),
      };
    }
  } else {
    site = await resolveSite(domain);
  }

  if (!site) {
    // Unknown domain — let the request proceed without site headers
    return NextResponse.next({ request: { headers } });
  }

  // Inject minimal headers for downstream consumption
  headers.set('x-site-slug', site.slug);
  headers.set('x-site-id', site.id);
  headers.set('x-locale', locale);

  return NextResponse.next({
    request: { headers },
  });
}
