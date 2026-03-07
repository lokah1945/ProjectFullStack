// src/components/view-tracker.tsx
// Client-side component that records an article page view on mount.
// Fires once per page load. Silent on failure — never blocks rendering.
'use client';

import { useEffect } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3200';

interface ViewTrackerProps {
  documentId: string;
}

export function ViewTracker({ documentId }: ViewTrackerProps) {
  useEffect(() => {
    if (!documentId) return;

    const controller = new AbortController();

    fetch(`${STRAPI_URL}/api/articles/${documentId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    }).catch(() => {
      // Silently fail — view tracking should never break the page
    });

    return () => controller.abort();
  }, [documentId]);

  // Renders nothing — purely side-effect component
  return null;
}
