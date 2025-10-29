/**
 * Vitest Configuration
 * PSW Voice Documentation System - Unit Testing
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/unit/**/*.test.js'],
    exclude: ['tests/e2e/**/*', 'PSWMobileApp/**/*', 'node_modules/**/*'],
    // Auto-reset environment variables between tests for isolation
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/e2e/',
        'PSWMobileApp/',
        '*.config.ts',
        '*.config.js',
        '.next/',
        'scripts/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
