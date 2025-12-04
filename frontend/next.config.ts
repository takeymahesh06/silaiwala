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
  webpack(config, { dir }) {
    // Resolve alias for @ to src directory
    // Use 'dir' parameter which Next.js provides - it's the project root directory
    // In Amplify with appRoot: frontend, this will be the frontend directory
    const srcPath = path.resolve(dir, 'src');
    
    // Ensure resolve object exists
    if (!config.resolve) {
      config.resolve = {};
    }
    
    // Set up alias - webpack will handle @/lib/api -> src/lib/api
    // Make sure to preserve existing aliases
    const existingAlias = config.resolve.alias || {};
    config.resolve.alias = {
      ...existingAlias,
      '@': srcPath,
    };
    
    // Ensure extensions are configured
    if (!config.resolve.extensions) {
      config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    }
    
    return config;
  },
};

export default nextConfig;
