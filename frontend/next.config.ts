import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'https://silaiwala-backend-v3-production.up.railway.app';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
