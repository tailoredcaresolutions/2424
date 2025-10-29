# Vercel Deployment Notes

## Architecture Overview

This application uses a **hybrid architecture** for PHIPA compliance:

- **Frontend (Vercel)**: Next.js 16 app serving UI and public pages
- **Backend (Local Mac)**: Express server running AI, database, and sensitive operations
- **Connection**: Cloudflare Tunnel connects frontend to backend

## Frontend Deployment (Vercel)

### What Gets Deployed to Vercel

✅ **Included in Vercel deployment:**
- Next.js app (`app/`, `pages/`)
- React components (`components/`)
- Public assets (`public/`)
- Frontend dependencies only
- Static pages and client-side code

❌ **Excluded from Vercel deployment (via .vercelignore):**
- `backend/` - Express server runs locally
- `lib/database/`, `lib/monitoring/`, `lib/search/`, `lib/cache/` - Backend services
- API routes that use SQLite/Redis (`app/api/ai/`, `app/api/monitoring/`, etc.)
- All `.md` documentation files (except README.md)
- Test files and reports

### Dependencies Structure

**Frontend `package.json`:**
- **dependencies**: Only frontend-required packages (React, Next.js, Tailwind, etc.)
- **optionalDependencies**: Backend packages needed for local dev but excluded from Vercel
- **devDependencies**: Build tools and type definitions

Backend packages in `optionalDependencies` won't break Vercel build but are available locally.

### Vercel Configuration

**`vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://psw-backend.tailoredcaresolutions.com/api/:path*"
    }
  ]
}
```

All API calls are proxied to the backend server via Cloudflare Tunnel.

**`next.config.js`:**
- `output: 'standalone'` - Optimized Vercel deployment
- `serverExternalPackages` - Marks backend packages as external
- `outputFileTracingExcludes` - Excludes backend code from bundle

## Backend Deployment (Local Mac)

### Starting the Backend

**For local development:**
```bash
cd backend
npm install
npm start
```

**For production (with tunnel):**
```bash
./scripts/start-everything.sh
```

This script starts:
1. Backend Express server (port 4000)
2. Cloudflare Tunnel (connects to Vercel)

⚠️ **Important**: `start-everything.sh` is for **local development only**, NOT for Vercel deployment.

### Backend Dependencies

Backend has its own `package.json` with:
- better-sqlite3-multiple-ciphers (encrypted database)
- pino (logging)
- ioredis (caching)
- ollama, whisper, xtts clients (AI services)

These dependencies are NOT needed on Vercel and are excluded via configuration.

## Design System (Liquid Glass)

### Color Palette

- **Primary Blue**: `#1B365D` - Main brand color
- **Gold Accent**: `#D4A574` - Secondary accent color

These are defined in:
- `tailwind.config.ts` - Tailwind color tokens
- `app/globals.css` - CSS variables

### Liquid Glass Classes

Custom CSS classes for iOS 26-style glass morphism:
- `.liquid-glass` - Standard blue glass effect
- `.liquid-glass-light` - Light glass effect
- `.liquid-glass-gold` - Gold accent glass
- `.liquid-glass-dark` - Deep layer glass
- `.liquid-glass-card` - Content container glass

**Note**: Tailwind v4 doesn't support `@apply` with custom classes, so we use standard CSS.

### Touch Targets (iOS HIG Compliance)

Minimum touch target: **44px × 44px**

Defined in CSS:
```css
:root {
  --touch-target-min: 44px;
}

.btn, button, a {
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
}
```

## Build Process

### Local Build

```bash
npm install
npm run build
```

Build succeeds with these fixes:
- ✅ Removed Google Fonts import (uses system fonts)
- ✅ Fixed Tailwind `@apply` issues with custom classes
- ✅ Excluded backend TypeScript files from frontend build
- ✅ Added type definitions for optional backend dependencies

### Vercel Build

Vercel automatically:
1. Runs `npm install` (frontend dependencies only)
2. Runs `npm run build`
3. Excludes files listed in `.vercelignore`
4. Deploys standalone Next.js output

## Environment Variables

### Frontend (Vercel)

Set in Vercel dashboard:
```bash
NEXT_PUBLIC_BACKEND_URL=https://psw-backend.tailoredcaresolutions.com
NEXT_PUBLIC_APP_NAME=PSW Voice Documentation
NEXT_PUBLIC_ENVIRONMENT=production
```

### Backend (Local)

Set in `backend/.env`:
```bash
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
DATABASE_ENCRYPTION_KEY=your-secure-key
NODE_ENV=production
```

## Troubleshooting

### Build Fails with "Module not found"

**Problem**: Backend package imported in frontend code

**Solution**: 
1. Check that package is in `optionalDependencies`
2. Verify `serverExternalPackages` includes it in `next.config.js`
3. Confirm file is excluded in `outputFileTracingExcludes`

### Tailwind CSS Errors

**Problem**: `Cannot apply unknown utility class liquid-glass`

**Solution**: Don't use `@apply` with custom classes in Tailwind v4. Use standard CSS instead.

### TypeScript Errors for Backend Files

**Problem**: TypeScript checking backend files during frontend build

**Solution**: Add directories to `exclude` in `tsconfig.json`:
```json
{
  "exclude": [
    "node_modules",
    "backend/**/*",
    "lib/database/**/*",
    "lib/monitoring/**/*"
  ]
}
```

## Deployment Checklist

- [ ] Backend running on local Mac in Ontario
- [ ] Cloudflare Tunnel connected and tested
- [ ] Vercel environment variables set
- [ ] Backend ALLOWED_ORIGINS includes Vercel URL
- [ ] Database encryption key changed from default
- [ ] Build succeeds locally (`npm run build`)
- [ ] No backend dependencies in main `dependencies`
- [ ] `.vercelignore` excludes backend files
- [ ] Touch targets meet 44px minimum
- [ ] Brand colors (#1B365D, #D4A574) consistent

## Support

For deployment issues, check:
- `DEPLOYMENT_INSTRUCTIONS.md` - Full deployment guide
- `PHIPA_COMPLIANCE_ONTARIO.md` - Compliance requirements
- `PROJECT_CONTEXT.md` - Complete technical documentation
