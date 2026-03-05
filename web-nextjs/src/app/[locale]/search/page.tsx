// src/app/[locale]/search/page.tsx
// Localized search page — client component

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import type { Article, StrapiPagination } from '@/types';
import Image from 'next/image';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3200';

function resolveImageUrl(url?: string | null): string {
  if (!url) return '/placeholder-cover.jpg';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

interface SearchResult {
  data: Article[];
  meta: { pagination: StrapiPagination };
}

export default function LocaleSearchPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'id';
  const searchParamsHook = useSearchParams();
  const initialQuery = searchParamsHook.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<StrapiPagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setResults([]);
      setPagination(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3200';
      const searchParams = new URLSearchParams({
        q: q.trim(),
        locale,
        page: String(p),
        pageSize: '10',
      });

      const res = await fetch(`${strapiUrl}/api/articles/search?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Search failed');

      const data: SearchResult = await res.json();
      setResults(data.data ?? []);
      setPagination(data.meta?.pagination ?? null);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    setPage(1);
    performSearch(debouncedQuery, 1);
  }, [debouncedQuery, performSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    performSearch(debouncedQuery, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container-content py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Search Articles</h1>
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
              aria-label="Search articles"
              autoFocus
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: 'var(--color-primary)' }} />
          </div>
        )}

        {!isLoading && hasSearched && (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {pagination?.total ?? 0} result{(pagination?.total ?? 0) !== 1 ? 's' : ''} for{' '}
              <strong className="text-gray-800">&ldquo;{debouncedQuery}&rdquo;</strong>
            </p>

            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium text-gray-500">No articles found</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(article => (
                  <a key={article.documentId} href={`/${locale}/article/${article.slug}`}
                    className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                    {article.coverImage?.url && (
                      <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={resolveImageUrl(article.coverImage.url)} alt={article.title} fill className="object-cover" sizes="96px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <span className="category-badge mb-1 inline-block text-xs">{article.category.name}</span>
                      )}
                      <h2 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {pagination && pagination.pageCount > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <button onClick={() => handlePageChange(page - 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    ← Prev
                  </button>
                )}
                {Array.from({ length: Math.min(pagination.pageCount, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${p === page ? 'text-white' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
                    style={p === page ? { background: 'var(--color-primary)' } : {}}>
                    {p}
                  </button>
                ))}
                {page < pagination.pageCount && (
                  <button onClick={() => handlePageChange(page + 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Next →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base text-gray-500">Start typing to search for articles</p>
          </div>
        )}
      </main>
    </div>
  );
}
