// src/app/[locale]/layout.tsx
// Locale-aware layout — wraps all /[locale]/* routes

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { fetchSiteBySlug } from '@/lib/strapi';
import { headers } from 'next/headers';

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

// Only 'id' is a supported non-default locale
const SUPPORTED_LOCALES = ['id'];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params; // R1.1
  return {
    alternates: {
      languages: {
        'en': '/',
        'id': '/id',
      },
    },
    ...(locale === 'id' ? { locale: 'id-ID' } : {}),
  };
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // R1.1
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // R1.1: await params
  const { locale } = await params;

  // Only 'id' is supported; anything else → 404
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  // R1.1: await headers()
  const headersList = await headers();
  const siteSlug = headersList.get('x-site-slug') ?? 'glimpseit';

  let site = null;
  try {
    site = await fetchSiteBySlug(siteSlug);
  } catch {
    // Non-fatal
  }

  const primaryColor = site?.theme?.primaryColor ?? '#0F4C81';
  const primaryDark = `color-mix(in srgb, ${primaryColor} 80%, black)`;
  const primaryLight = `color-mix(in srgb, ${primaryColor} 15%, white)`;

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${primaryColor};
              --color-primary-dark: ${primaryDark};
              --color-primary-light: ${primaryLight};
            }
          `,
        }} />
        {site?.theme?.faviconUrl && (
          <link rel="icon" href={site.theme.faviconUrl} />
        )}
        {/* hreflang for SEO */}
        <link rel="alternate" hrefLang="en" href="/" />
        <link rel="alternate" hrefLang={locale} href={`/${locale}`} />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
