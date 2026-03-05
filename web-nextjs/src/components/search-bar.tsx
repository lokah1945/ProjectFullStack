// src/components/search-bar.tsx
// Full-featured search bar: debounced, fetches from /api/articles/search, shows results with pagination
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import type { Article, StrapiPagination } from '@/types';

interface SearchResult {
  articles: Article[];
  pagination: StrapiPagination;
}

interface SearchBarProps {
  /** Initial query to prefill (e.g. from URL search params) */
  initialQuery?: string;
  /** Current locale for result links */
  locale?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
  className?: string;
  /** Inline results mode vs standalone input mode */
  showResults?: boolean;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3200';

function resolveImageUrl(url?: string | null): string {
  if (!url) return '/placeholder-cover.jpg';
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * SearchBar — debounced search with inline results display.
 * Uses /api/articles/search (Next.js route handler) rather than Strapi directly.
 * Supports pagination for result pages.
 */
export function SearchBar({
  initialQuery = '',
  locale = 'en',
  placeholder = 'Search articles…',
  debounceMs = 300,
  className = '',
  showResults = true,
}: SearchBarProps) {
  const prefix = locale !== 'en' ? `/${locale}` : '';
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Perform search
  const doSearch = useCallback(
    async (q: string, p: number) => {
      if (!q.trim() || q.trim().length < 2) {
        setResults(null);
        setLoading(false);
        setError(null);
        return;
      }

      // Cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: q.trim(),
          page: String(p),
          pageSize: '8',
          ...(locale !== 'en' ? { locale } : {}),
        });

        const res = await fetch(`/api/articles/search?${params.toString()}`, {
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const data: SearchResult = await res.json();
        setResults(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled — ignore
        }
        setError('Search failed. Please try again.');
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  // Trigger search on debounced query change or page change
  useEffect(() => {
    setPage(1);
    doSearch(debouncedQuery, 1);
  }, [debouncedQuery, doSearch]);

  // Re-search when page changes (triggered by user clicking pagination)
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      doSearch(debouncedQuery, newPage);
      // Scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [debouncedQuery, doSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setPage(1);
    inputRef.current?.focus();
  }, []);

  const hasResults = results && results.articles.length > 0;
  const noResults = results && results.articles.length === 0 && debouncedQuery.trim().length >= 2 && !loading;

  return (
    <div className={`w-full ${className}`}>
      {/* ── Search Input ───────────────────────── */}
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          {loading ? (
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-base text-gray-900 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent placeholder-gray-400 transition-all duration-150"
          aria-label="Search articles"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Results Section ───────────────────── */}
      {showResults && (
        <div className="mt-6">
          {/* Error state */}
          {error && (
            <div className="flex items-center gap-3 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !results && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading results">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="skeleton w-24 h-18 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="skeleton h-3 rounded w-16" />
                    <div className="skeleton h-4 rounded w-full" />
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 font-medium">
                No results for &ldquo;<span className="text-gray-700">{debouncedQuery}</span>&rdquo;
              </p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term or browse our categories.</p>
            </div>
          )}

          {/* Results list */}
          {hasResults && (
            <div>
              {/* Results count */}
              <p className="text-sm text-gray-500 mb-4">
                Found <span className="font-semibold text-gray-700">{results.pagination.total}</span>{' '}
                result{results.pagination.total !== 1 ? 's' : ''} for{' '}
                &ldquo;<span className="text-gray-700">{debouncedQuery}</span>&rdquo;
              </p>

              {/* Article cards */}
              <div className="divide-y divide-gray-50">
                {results.articles.map((article) => (
                  <Link
                    key={article.documentId}
                    href={`${prefix}/article/${article.slug}`}
                    className="group flex gap-4 items-start py-4 hover:bg-gray-50 rounded-xl px-3 -mx-3 transition-colors duration-150"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={resolveImageUrl(article.coverImage?.url)}
                        alt={article.coverImage?.alternativeText ?? article.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <span className="category-badge mb-1.5 inline-block">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {article.author && (
                          <>
                            <span className="text-xs text-gray-500">{article.author.name}</span>
                            <span className="text-gray-300" aria-hidden>·</span>
                          </>
                        )}
                        <time dateTime={article.publishedAt} className="text-xs text-gray-400">
                          {formatDate(article.publishedAt)}
                        </time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Inline pagination for search results */}
              {results.pagination.pageCount > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Previous results page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </button>

                  <span className="text-sm text-gray-500 px-3">
                    Page {page} of {results.pagination.pageCount}
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= results.pagination.pageCount}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    aria-label="Next results page"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
