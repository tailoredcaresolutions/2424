/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel deployment - standalone output for optimal performance
  output: 'standalone',

  // CRITICAL FIX #1: Tell Next.js these packages are EXTERNAL (not bundled)
  // ALL AI RUNS LOCALLY - these packages only exist on Mac, not Vercel
  serverExternalPackages: [
    'better-sqlite3',
    'better-sqlite3-multiple-ciphers',
    'pino',
    'pino-pretty',
    'ioredis',
    'otplib',
    'qrcode',
    'next-rate-limit',
  ],

  // CRITICAL FIX #2: Exclude backend files from deployment bundle
  // Context7 official pattern from Next.js docs
  outputFileTracingExcludes: {
    '*': [
      './backend/**/*',
      './lib/monitoring/**/*',
      './lib/database/**/*',
      './lib/search/**/*',
      './lib/cache/**/*',
      './app/api/ai/**/*',
      './app/api/monitoring/**/*',
      './app/api/health/**/*',
      './app/api/performance/**/*',
      './app/api/backup/**/*',
      './app/api/search/**/*',
      './node_modules/better-sqlite3/**/*',
      './node_modules/better-sqlite3-multiple-ciphers/**/*',
    ],
  },

  // React Compiler (automatic memoization) - stable in Next.js 16
  reactCompiler: false,

  // Allow dev access from network devices
  allowedDevOrigins: ['192.168.1.187', 'localhost'],

  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  experimental: {},

  turbopack: {},

  // Webpack fallback
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "bufferutil": false,
      "utf-8-validate": false,
      "fs": false,
      "path": false,
    };

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

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
}

module.exports = nextConfig
