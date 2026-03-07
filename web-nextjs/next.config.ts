// web-nextjs/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fix cross-origin warning: "Cross origin request detected from www.domain to /_next/* resource"
  // Next.js 15 requires explicit allowedDevOrigins for cross-origin HMR/dev requests.
  // In production (pm2), this is also needed when www subdomain differs from the canonical domain.
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    'glimpseit.online',
    'www.glimpseit.online',
    'cryptonice.online',
    'www.cryptonice.online',
    'healthandbeauty.my.id',
    'www.healthandbeauty.my.id',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3200',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.glimpseit.online',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.cryptonice.online',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.healthandbeauty.my.id',
        pathname: '/uploads/**',
      },
      // Allow Strapi media from same-origin /uploads/ (when proxied or same-server)
      {
        protocol: 'https',
        hostname: 'glimpseit.online',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptonice.online',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'healthandbeauty.my.id',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
