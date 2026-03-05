// web-nextjs/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
