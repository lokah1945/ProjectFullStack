// src/components/footer.tsx
// Per-site footer with site info, navigation, category links, utilities
import type { Site, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  site: Site | null;
  categories: Category[];
  locale: string;
}

export function Footer({ site, categories, locale }: FooterProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';
  const year = new Date().getFullYear();

  // Top categories for footer (up to 6)
  const topCategories = categories
    .sort((a, b) => (a.navOrder ?? 99) - (b.navOrder ?? 99))
    .slice(0, 6);

  return (
    <footer className="bg-gray-950 text-gray-400 mt-16" aria-label="Site footer">
      {/* Main footer grid */}
      <div className="container-content py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* ── Brand column ────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`${prefix}/`} className="inline-block mb-4" aria-label={site?.name ?? 'Home'}>
              {site?.theme?.logoUrl ? (
                <Image
                  src={site.theme.logoUrl}
                  alt={`${site.name} logo`}
                  width={130}
                  height={32}
                  className="h-8 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {site?.name ?? 'News'}
                </span>
              )}
            </Link>
            {site?.seoDefaults?.description && (
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                {site.seoDefaults.description}
              </p>
            )}
          </div>

          {/* ── Navigation column ───────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href={`${prefix}/latest`} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                  Latest Articles
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/featured`} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                  Featured Stories
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/trending`} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                  Trending Now
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/search`} className="text-sm text-gray-500 hover:text-white transition-colors duration-150">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Categories column ───────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {topCategories.map((cat) => (
                <li key={cat.documentId}>
                  <Link
                    href={`${prefix}/category/${cat.slug}`}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-150"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources column ────────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/rss.xml"
                  className="text-sm text-gray-500 hover:text-white transition-colors duration-150 flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19.01 7.38 20 6.18 20 4.98 20 4 19.01 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
                  </svg>
                  RSS Feed
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="text-sm text-gray-500 hover:text-white transition-colors duration-150"
                >
                  Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  className="text-sm text-gray-500 hover:text-white transition-colors duration-150"
                >
                  Robots.txt
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {year} <span className="text-gray-500">{site?.name ?? 'News Platform'}</span>. All rights reserved.
          </p>
          <a
            href="https://www.perplexity.ai/computer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors duration-150"
          >
            Created with Perplexity Computer
          </a>
        </div>
      </div>
    </footer>
  );
}
