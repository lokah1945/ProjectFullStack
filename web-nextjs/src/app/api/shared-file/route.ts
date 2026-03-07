// src/app/api/shared-file/route.ts
// Serves static files from the filesystem.
//
// Two modes (determined by middleware):
//
//   source=shared  → reads from  web-nextjs/shared/{path}
//                    URL example: domain.com/shared/somefile.txt
//
//   source=site    → reads from  web-nextjs/sites/{siteName}/{path}
//                    URL example: domain.com/ads.txt
//
// Parameters are passed via custom headers (primary) and searchParams (fallback).

import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

// Force Node.js runtime (required for fs access)
export const runtime = 'nodejs';

// Disable static optimization — this route must always run dynamically
export const dynamic = 'force-dynamic';

// MIME type mapping for common file types
const MIME_TYPES: Record<string, string> = {
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.csv': 'text/csv; charset=utf-8',
  '.php': 'text/html; charset=utf-8',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Validate and normalize a relative path, preventing directory traversal.
 * Returns null if the path is invalid/dangerous.
 */
function sanitizePath(raw: string): string | null {
  const normalized = path.normalize(raw).replace(/^(\.\.([/\\]|$))+/, '');
  if (
    normalized.includes('..') ||
    normalized.startsWith('/') ||
    normalized.startsWith('\\')
  ) {
    return null;
  }
  return normalized;
}

/**
 * Try to read a file and return its buffer + stats.
 * Returns null if the file doesn't exist or isn't a regular file.
 */
async function tryReadFile(
  baseDir: string,
  relativePath: string
): Promise<{ buffer: Buffer; size: number; fullPath: string } | null> {
  const fullPath = path.join(baseDir, relativePath);

  // Ensure resolved path is still within the base directory
  if (!path.resolve(fullPath).startsWith(path.resolve(baseDir))) {
    return null;
  }

  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) return null;
    const buffer = await readFile(fullPath);
    return { buffer, size: fileStat.size, fullPath };
  } catch {
    return null;
  }
}

/**
 * Extract parameters from the request.
 * Uses custom headers (most reliable) with searchParams as fallback.
 */
function extractParams(request: NextRequest): {
  source: 'shared' | 'site' | null;
  filePath: string | null;
  siteName: string | null;
} {
  // Strategy 1: Custom headers (set by middleware — always reliable)
  const headerSource = request.headers.get('x-serve-source');
  const headerPath = request.headers.get('x-serve-path');
  const headerSite = request.headers.get('x-serve-site');
  if (headerSource && headerPath) {
    return {
      source: headerSource === 'shared' ? 'shared' : 'site',
      filePath: headerPath,
      siteName: headerSite,
    };
  }

  // Strategy 2: searchParams (standard rewrite approach)
  const spSource = request.nextUrl.searchParams.get('source');
  const spPath = request.nextUrl.searchParams.get('path');
  const spSite = request.nextUrl.searchParams.get('siteName');
  if (spSource && spPath) {
    return {
      source: spSource === 'shared' ? 'shared' : 'site',
      filePath: spPath,
      siteName: spSite,
    };
  }

  // Strategy 3: Parse from raw request.url (last resort)
  try {
    const url = new URL(request.url);
    const rawSource = url.searchParams.get('source');
    const rawPath = url.searchParams.get('path');
    const rawSite = url.searchParams.get('siteName');
    if (rawSource && rawPath) {
      return {
        source: rawSource === 'shared' ? 'shared' : 'site',
        filePath: rawPath,
        siteName: rawSite,
      };
    }
  } catch {
    // ignore parse errors
  }

  return { source: null, filePath: null, siteName: null };
}

/**
 * Build a successful file response.
 */
function fileResponse(
  result: { buffer: Buffer; size: number; fullPath: string },
  servedFrom: string
): NextResponse {
  return new NextResponse(new Uint8Array(result.buffer), {
    status: 200,
    headers: {
      'Content-Type': getMimeType(result.fullPath),
      'Content-Length': String(result.size),
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Served-From': servedFrom,
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { source, filePath: rawPath, siteName } = extractParams(request);

  if (!rawPath || !source) {
    console.error('[shared-file] Missing parameters.', {
      url: request.url,
      headerSource: request.headers.get('x-serve-source'),
      headerPath: request.headers.get('x-serve-path'),
      spSource: request.nextUrl.searchParams.get('source'),
      spPath: request.nextUrl.searchParams.get('path'),
    });
    return NextResponse.json(
      { error: 'Missing path parameter' },
      { status: 400 }
    );
  }

  const safePath = sanitizePath(rawPath);
  if (!safePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const projectRoot = process.cwd();

  // ── source=shared → read from shared/ directory only ────────────────────────
  if (source === 'shared') {
    const sharedDir = path.resolve(projectRoot, 'shared');
    const result = await tryReadFile(sharedDir, safePath);
    if (result) {
      return fileResponse(result, 'shared');
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // ── source=site → read from sites/{siteName}/ directory only ────────────────
  if (source === 'site') {
    if (!siteName) {
      return NextResponse.json(
        { error: 'Site could not be determined for this domain' },
        { status: 400 }
      );
    }

    const safeSiteName = sanitizePath(siteName);
    if (!safeSiteName) {
      return NextResponse.json({ error: 'Invalid site name' }, { status: 400 });
    }

    const sitesDir = path.resolve(projectRoot, 'sites');
    const siteDir = path.join(sitesDir, safeSiteName);

    // Security: ensure resolved path is within sites/
    if (!path.resolve(siteDir).startsWith(path.resolve(sitesDir))) {
      return NextResponse.json({ error: 'Invalid site name' }, { status: 400 });
    }

    const result = await tryReadFile(siteDir, safePath);
    if (result) {
      return fileResponse(result, `site:${safeSiteName}`);
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
}
