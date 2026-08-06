import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // destination: 'http://localhost:3001/api/:path*',
        destination: 'https://short-news.ru/api/:path*',
      },
    ];
  },
};

export default nextConfig;
