// src/components/pagination.tsx
// Responsive pagination component with prev/next and page numbers
import type { StrapiPagination } from '@/types';
import Link from 'next/link';

interface PaginationProps {
  pagination: StrapiPagination;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ pagination, basePath, searchParams = {} }: PaginationProps) {
  const { page, pageCount } = pagination;

  if (pageCount <= 1) return null;

  function buildUrl(p: number): string {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  }

  // Build windowed page list — max 7 visible, centered around current
  function getPages(): number[] {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, -1, pageCount]; // -1 = ellipsis
    }
    if (page >= pageCount - 3) {
      return [1, -1, pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
    }
    return [1, -1, page - 1, page, page + 1, -2, pageCount]; // -2 = trailing ellipsis
  }

  const pages = getPages();

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 py-6"
    >
      {/* Prev */}
      {page > 1 ? (
        <Link
          href={buildUrl(page - 1)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-150"
          aria-label="Previous page"
          rel="prev"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-lg cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Page numbers — hidden on small mobile, shown from sm: */}
      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p < 0) {
            // Ellipsis
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                aria-hidden="true"
              >
                …
              </span>
            );
          }
          const isCurrent = p === page;
          return (
            <Link
              key={p}
              href={buildUrl(p)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${p}`}
              className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-150 ${
                isCurrent
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
              }`}
              style={isCurrent ? { background: 'var(--color-primary)' } : {}}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Mobile: current / total indicator */}
      <span className="flex sm:hidden items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg">
        {page} / {pageCount}
      </span>

      {/* Next */}
      {page < pageCount ? (
        <Link
          href={buildUrl(page + 1)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-150"
          aria-label="Next page"
          rel="next"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
