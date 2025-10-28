/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment - standalone output for optimal performance
  output: 'standalone',

  // Turbopack is now STABLE in Next.js 16 (released Oct 21, 2025)
  // Use --turbopack flag in dev script for explicit control
  // Next.js 16 features: Cache Components, Build Adapters API, React Compiler stable

  // React Compiler (automatic memoization) - now stable and top-level in Next.js 16
  reactCompiler: false,  // Temporarily disabled for production cutover

  // Allow dev access from network devices (iPhone, tablets, etc.)
  allowedDevOrigins: ['192.168.1.187', 'localhost'],

  // Image optimization for Vercel
  images: {
    domains: [],
    unoptimized: false,
  },

  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for Next.js 16
  experimental: {
    // Turbopack is stable, no experimental config needed
    // Cache Components enabled via `use cache` directive in code
  },

  // Note: API routes are now handled by local backend server
  // SQLite packages not needed on Vercel (frontend only)
  serverExternalPackages: [],

  // Turbopack configuration (empty config to acknowledge migration from webpack)
  turbopack: {},

  // Webpack configuration (fallback for non-Turbopack builds)
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "bufferutil": false,
      "utf-8-validate": false,
      "fs": false,
      "path": false,
    };

    // Optimize for better-sqlite3
    config.externals = config.externals || [];

    if (!isServer) {
      config.externals.push('better-sqlite3', 'better-sqlite3-multiple-ciphers');
    } else {
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
        'better-sqlite3-multiple-ciphers': 'commonjs better-sqlite3-multiple-ciphers',
      });
    }

    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
}

module.exports = nextConfig
