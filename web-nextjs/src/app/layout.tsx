// src/app/layout.tsx
// Root layout — site-aware, font injection, CSS variables, header/footer

import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { fetchSiteBySlug } from '@/lib/strapi';
import type { Site } from '@/types';

// ── Font Loading ──────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['600', '700', '800'],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'News Platform',
    template: '%s | News Platform',
  },
  description: 'Multi-site news and blog platform',
};

// ── Layout Component ──────────────────────────────────────────────────────────

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';
  const locale = headersList.get('x-locale') ?? 'en';

  // Fetch site config for theme + nav
  let site: Site | null = null;
  try {
    site = await fetchSiteBySlug(siteSlug);
  } catch {
    // Site config unavailable — use defaults
  }

  const primaryColor = site?.theme?.primaryColor ?? '#0F4C81';
  const primaryDark = `color-mix(in srgb, ${primaryColor} 80%, black)`;
  const primaryLight = `color-mix(in srgb, ${primaryColor} 15%, white)`;

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        {/* Site-specific CSS variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${primaryColor};
                --color-primary-dark: ${primaryDark};
                --color-primary-light: ${primaryLight};
              }
            `,
          }}
        />
        {/* Favicon */}
        {site?.theme?.faviconUrl && (
          <link rel="icon" href={site.theme.faviconUrl} />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        {/* Header and Footer are rendered by child layouts or pages */}
        {/* This root layout provides the shell only */}
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
