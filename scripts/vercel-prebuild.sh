#!/bin/bash
# Vercel Pre-Build Script
# Removes all backend-only files that use SQLite before Next.js build runs

echo "🧹 Cleaning backend-only files from Vercel deployment..."

# Remove SQLite-dependent libraries
rm -rf lib/monitoring
rm -rf lib/database
rm -rf lib/search

# Remove SQLite-dependent API routes
rm -rf app/api/ai
rm -rf app/api/monitoring
rm -rf app/api/health

echo "✅ Backend files removed - ready for frontend-only build!"
