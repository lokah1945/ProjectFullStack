// src/components/content-renderer.tsx
// Renders Strapi v5 Blocks content using @strapi/blocks-react-renderer with premium typography
'use client';

import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import type { BlocksContent } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:3200';

interface ContentRendererProps {
  content: BlocksContent;
  className?: string;
}

/**
 * ContentRenderer — renders Strapi Blocks JSON with:
 * - Premium heading styles (h1–h6) using Plus Jakarta Sans
 * - Responsive images with Next.js Image
 * - Styled links (external: target _blank, rel noopener)
 * - Ordered / unordered lists
 * - Blockquotes with primary color accent
 * - Code blocks with syntax-friendly dark theme
 * - Inline code styling
 * - Text modifiers (bold, italic, underline, strikethrough, code)
 */
export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  if (!content || content.length === 0) {
    return (
      <div className="py-8 text-center text-gray-300 text-sm">
        No content available.
      </div>
    );
  }

  return (
    <div className={`prose prose-article max-w-none ${className}`}>
      <BlocksRenderer
        content={content}
        blocks={{
          // ── Images ─────────────────────────────────────────────
          image: ({ image }) => {
            const src = image.url.startsWith('http')
              ? image.url
              : `${STRAPI_URL}${image.url}`;

            return (
              <figure className="my-8 not-prose">
                <div className="relative w-full rounded-xl overflow-hidden bg-gray-100"
                  style={{ aspectRatio: image.width && image.height ? `${image.width}/${image.height}` : '16/9' }}>
                  <Image
                    src={src}
                    alt={image.alternativeText ?? ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 740px"
                  />
                </div>
                {image.caption && (
                  <figcaption className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            );
          },

          // ── Headings ────────────────────────────────────────────
          heading: ({ children, level }) => {
            const sizeClasses: Record<number, string> = {
              1: 'text-3xl sm:text-4xl',
              2: 'text-2xl sm:text-3xl',
              3: 'text-xl sm:text-2xl',
              4: 'text-lg sm:text-xl',
              5: 'text-base sm:text-lg',
              6: 'text-sm sm:text-base',
            };
            const marginClasses: Record<number, string> = {
              1: 'mt-10 mb-5',
              2: 'mt-8 mb-4',
              3: 'mt-7 mb-3',
              4: 'mt-6 mb-3',
              5: 'mt-5 mb-2',
              6: 'mt-4 mb-2',
            };

            const className = [
              sizeClasses[level] ?? 'text-xl',
              marginClasses[level] ?? 'mt-6 mb-3',
              'font-bold text-gray-900 leading-tight tracking-tight',
            ].join(' ');

            // Use a div with role for all heading levels to avoid JSX element type issues
            if (level === 1) return <h1 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h1>;
            if (level === 2) return <h2 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h2>;
            if (level === 3) return <h3 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h3>;
            if (level === 4) return <h4 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h4>;
            if (level === 5) return <h5 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h5>;
            return <h6 className={className} style={{ fontFamily: 'var(--font-jakarta)' }}>{children}</h6>;
          },

          // ── Paragraphs ──────────────────────────────────────────
          paragraph: ({ children }) => (
            <p className="text-gray-700 leading-[1.85] mb-5 text-base sm:text-[17px]">
              {children}
            </p>
          ),

          // ── Links ───────────────────────────────────────────────
          link: ({ children, url }) => {
            const isExternal = url.startsWith('http') || url.startsWith('//');
            return (
              <Link
                href={url}
                className="text-[var(--color-primary)] underline underline-offset-2 hover:text-[var(--color-primary-dark)] transition-colors duration-150 decoration-[var(--color-primary-light)]"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
              </Link>
            );
          },

          // ── Lists ───────────────────────────────────────────────
          list: ({ children, format }) => {
            if (format === 'ordered') {
              return (
                <ol className="list-decimal pl-6 my-5 space-y-2 text-gray-700">
                  {children}
                </ol>
              );
            }
            return (
              <ul className="list-disc pl-6 my-5 space-y-2 text-gray-700">
                {children}
              </ul>
            );
          },

          'list-item': ({ children }) => (
            <li className="text-gray-700 leading-relaxed pl-1">
              {children}
            </li>
          ),

          // ── Blockquotes ─────────────────────────────────────────
          quote: ({ children }) => (
            <blockquote
              className="border-l-[3px] pl-5 pr-4 py-1 my-7 italic text-gray-600 text-lg leading-relaxed bg-gray-50/50 rounded-r-xl"
              style={{ borderColor: 'var(--color-primary)' }}
            >
              {children}
            </blockquote>
          ),

          // ── Code blocks ─────────────────────────────────────────
          code: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto my-7 text-sm leading-relaxed">
              <code className="font-mono text-sm">{children}</code>
            </pre>
          ),
        }}
        modifiers={{
          bold: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          italic: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          underline: ({ children }) => (
            <span className="underline underline-offset-2">{children}</span>
          ),
          strikethrough: ({ children }) => (
            <s className="line-through text-gray-400">{children}</s>
          ),
          code: ({ children }) => (
            <code className="font-mono text-sm bg-gray-100 text-rose-600 px-1.5 py-0.5 rounded text-[0.875em]">
              {children}
            </code>
          ),
        }}
      />
    </div>
  );
}
