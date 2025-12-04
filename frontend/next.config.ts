import type { NextConfig } from "next";
import path from "path";

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
  webpack(config) {
    // Resolve alias for @ to src directory
    // This matches tsconfig.json paths: "@/*": ["./src/*"]
    const srcPath = path.resolve(process.cwd(), 'src');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': srcPath,
    };
    
    return config;
  },
};

export default nextConfig;
