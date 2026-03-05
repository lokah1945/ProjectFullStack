// src/app/error.tsx
// Error boundary — 'use client' required
'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-display font-bold text-gray-900 mb-3">
          Something went wrong
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          We encountered an unexpected error. This has been logged and we&apos;re working on it.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
