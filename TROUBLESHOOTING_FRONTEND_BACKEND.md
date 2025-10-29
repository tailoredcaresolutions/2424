# Frontend-Backend Communication Troubleshooting Guide

## Architecture Overview

Your system uses a **hybrid architecture**:

```
Frontend (Next.js on Vercel)
    ↓ HTTPS
Cloudflare Tunnel (psw-backend.tailoredcaresolutions.com or trycloudflare.com)
    ↓ Encrypted Tunnel
Backend (Express.js on localhost:4000 - Your Mac)
    ↓ Direct Access
Local Services (Ollama, Whisper, XTTS, Database)
```

### How Communication Works

1. **Frontend → Backend Request Flow**:
   - User action in browser (e.g., voice recording)
   - Frontend calls Next.js API route: `/api/transcribe-whisper`
   - Next.js API route proxies to backend: `fetch('${NEXT_PUBLIC_BACKEND_URL}/api/whisper/transcribe')`
   - Request goes through Cloudflare Tunnel
   - Tunnel forwards to `localhost:4000` on your Mac
   - Backend processes request and returns response
   - Response follows same path back to frontend

2. **Key Files**:
   - **Frontend API Routes** (`app/api/*/route.js`): Proxy requests to backend
   - **Backend Server** (`backend/server.js`): Runs on port 4000
   - **API Client** (`lib/api-client.ts`): Determines backend URL
   - **Backend Routes** (`backend/routes/*.js`): Handle actual processing

---

## Common Issues & Solutions

### Issue 1: "Connection Refused" or "Network Error"

**Symptoms:**
- Frontend can't reach backend
- API calls fail with network errors
- Browser console shows: `Failed to fetch` or `ECONNREFUSED`

**Diagnosis Steps:**

1. **Check if Backend Server is Running**:
   ```bash
   # On your Mac, verify backend is running
   curl http://localhost:4000/health
   
   # Should return: {"status":"healthy",...}
   ```

2. **Check if Tunnel is Running**:
   ```bash
   # Check if Cloudflare Tunnel process is active
   ps aux | grep cloudflared
   
   # Or check tunnel status
   cloudflared tunnel list
   ```

3. **Verify Environment Variable**:
   ```bash
   # In Vercel dashboard, check Environment Variables
   # NEXT_PUBLIC_BACKEND_URL should be set to your tunnel URL
   # Example: https://psw-backend.tailoredcaresolutions.com
   ```

**Solutions:**

#### Solution A: Start Backend Server
```bash
cd /Volumes/AI/psw-reporting-production/backend
npm start

# Should see:
# ✅ Backend server started successfully
# Port: 4000
```

#### Solution B: Start Cloudflare Tunnel
```bash
# Option 1: Quick tunnel (temporary URL)
cloudflared tunnel --url http://localhost:4000

# Option 2: Named tunnel (permanent URL)
cloudflared tunnel run psw-backend

# The script will show the tunnel URL
```

#### Solution C: Set Environment Variable
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add or update:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-tunnel-url.trycloudflare.com
   ```
3. **Important**: If updating, you must **Redeploy** the app for changes to take effect

---

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- Requests fail with status 0 or CORS errors

**Diagnosis:**

1. **Check Backend CORS Configuration**:
   ```bash
   # Open backend/server.js and check ALLOWED_ORIGINS
   cat backend/server.js | grep ALLOWED_ORIGINS
   ```

2. **Verify Vercel Domain is in CORS List**:
   The `ALLOWED_ORIGINS` in `backend/.env` should include:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-tunnel-url.trycloudflare.com
   ```

**Solution:**

1. **Update Backend CORS** (`backend/.env`):
   ```bash
   ALLOWED_ORIGINS=http://localhost:3000,https://psw-voice-documentation-xyz.vercel.app,https://psw-backend.tailoredcaresolutions.com
   ```
   
   Replace `psw-voice-documentation-xyz.vercel.app` with your actual Vercel URL.

2. **Restart Backend**:
   ```bash
   cd backend
   npm start
   ```

---

### Issue 3: Wrong Backend URL

**Symptoms:**
- Requests go to wrong URL
- 404 errors on backend
- Tunnel URL mismatch

**Diagnosis:**

Check what URL the frontend is using:
```javascript
// In browser console (F12)
console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
```

**Solution:**

1. **Get Your Tunnel URL**:
   ```bash
   # If using quick tunnel, the URL is shown when you start it
   cloudflared tunnel --url http://localhost:4000
   
   # Output will show:
   # +--------------------------------------------------------------------------------------------+
   # |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
   # |  https://random-name.trycloudflare.com                                                     |
   # +--------------------------------------------------------------------------------------------+
   ```

2. **Update Vercel Environment Variable**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Set `NEXT_PUBLIC复古 Architectural_URL` to your tunnel URL
   - **Redeploy** (Settings → Deployments → Latest → Redeploy)

---

### Issue 4: Backend Routes Not Matching

**Symptoms:**
- 404 errors from backend
- "Endpoint not found" errors
- Frontend calling wrong endpoint paths

**Diagnosis:**

Frontend API routes expect these backend endpoints:
- `/api/whisper/transcribe` (from `app/api/transcribe-whisper/route.js`)
- `/api/xtts/synthesize` (from `app/api/synthesize-xtts/route.js`)
- `/api/ollama/chat` (from `app/api/process-conversation-ai/route.js`)

**Solution:**

Verify backend routes exist:
```bash
# Check backend routes
ls backend/routes/
# Should include: whisper.js, xtts.js, ollama.js, etc.
```

Check route registration in `backend/routes/index.js`:
```javascript
router.use('/whisper', whisperRoutes);
router.use('/xtts', xttsRoutes);
router.use('/ollama', ollamaRoutes);
```

---

## Step-by-Step Diagnostic Procedure

### Step 1: Verify Backend is Running Locally

```bash
# Terminal 1: Start backend
cd /Volumes/AI/psw-reporting-production/backend
npm start

# Should see:
# ✅ Backend server started successfully
# Port: 4000
```

**Test locally:**
```bash
curl http://localhost:4000/health
# Should return JSON with status: "healthy"
```

### Step 2: Verify Tunnel is Running

```bash
# Terminal 2: Start tunnel
cd /Volumes/AI/psw-reporting-production
./scripts/start-tunnel.sh

# Or manually:
cloudflared tunnel --url http://localhost:4000
```

**Test tunnel URL:**
```bash
# Copy the tunnel URL shown (e.g., https://random-name.trycloudflare.com)
curl https://your-tunnel-url.trycloudflare.com/health
# Should return same JSON as localhost:4000/health
```

### Step 3: Verify Frontend Environment Variable

1. **In Vercel Dashboard**:
   - Go to Settings → Environment Variables
   - Check `NEXT_PUBLIC_BACKEND_URL` is set to your tunnel URL
   - **If changed, redeploy the app**

2. **In Browser Console** (on your Vercel app):
   ```javascript
   // Open browser dev tools (F12) → Console
   // This won't show the env var directly, but you can test:
   fetch('/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

### Step 4: Test Full Flow

1. **Open your Vercel app** in browser
2. **Open DevTools** (F12) → Network tab
3. **Trigger an action** (e.g., voice recording)
4. **Check Network tab** for API calls:
   - Should see requests to `/api/transcribe-whisper`
   - Click on the request → Check "Request URL" in Headers
   - Should show the tunnel URL or localhost (depending on environment)

### Step 5: Check Backend Logs

```bash
# Watch backend logs for incoming requests
cd backend
npm start
# Look for request logs when frontend makes calls
```

---

## Quick Fix Script

Run this script to diagnose all issues at once:

```bash
#!/bin/bash
echo "🔍 Diagnosing Frontend-Backend Communication..."

echo ""
echo "1️⃣  Checking Backend Server..."
if curl -s http://localhost:4000/health > /dev/null; then
    echo "   ✅ Backend is running on localhost:4000"
else
    echo "   ❌ Backend NOT running. Start with: cd backend && npm start"
fi

echo ""
echo "2️⃣  Checking Cloudflare Tunnel..."
if pgrep -f cloudflared > /dev/null; then
    echo "   ✅ Cloudflare Tunnel process is running"
else
    echo "   ❌ Tunnel NOT running. Start with: ./scripts/start-tunnel.sh"
fi

echo ""
echo "3️⃣  Checking Environment Variables..."
if [ -f .env.local ]; then
 Ich hatte echo "   ✅ .env.local exists"
    grep NEXT_PUBLIC_BACKEND_URL .env.local || echo "   ⚠️  NEXT_PUBLIC_BACKEND_URL not set in .env.local"
else
    echo "   ⚠️  .env.local not found (this is OK for production)"
fi

echo ""
echo "4️⃣  Checking Backend Routes..."
if [ -f backend/routes/whisper.js ] && [ -f backend/routes/xtts.js ]; then
    echo "   ✅ Backend routes exist"
else
    echo "   ❌ Missing backend routes"
fi

echo ""
echo "5️⃣  Testing Tunnel URL..."
dogmaURL=$(grep NEXT_PUBLIC_BACKEND_URL .env.local 2>/dev/null | cut -d'=' -f2)
if [ -n "$tunnelURL" ]; then
    if curl -s "$tunnelURL/health" > /dev/null; then
        echo "   ✅ Tunnel URL is reachable: $tunnelURL"
    else
        echo "   ❌ Tunnel URL not reachable: $tunnelURL"
    fi
else
    echo "   ⚠️  Tunnel URL not configured in .env.local"
fi

echo ""
echo "✅ Diagnosis complete!"
```

---

## Environment Setup Checklist

### Development (Local)

**`.env.local` (or `.env`):**
```bash
# For local development, frontend proxies through Next.js
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
# Or leave unset - defaults to window.location.origin
issues
```

### Production (Vercel)

**Vercel Environment Variables:**
```bash
NEXT_PUBLIC_BACKEND_URL=https://psw-backend.tailoredcaresolutions.com
# Or: https://your-tunnel-name.trycloudflare.com
```

**Backend `.env`:**
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-tunnel-url.trycloudflare.com
PORT=4000
```

---

## Still Not Working?

### Enable Debug Logging

1. **Frontend**: Check browser console (F12) for errors
2. **Backend**: Check terminal where `npm start` is running
3. **Network**: Check Network tab in browser DevTools

### Common Mistakes

- ❌ Forgetting to restart backend after changing `.env`
- ❌ Forgetting to redeploy Vercel after changing environment variables
- ❌ Using `localhost:4000` in production (won't work from Vercel)
- ❌ Tunnel URL changing (quick tunnels get new URLs on restart)
- ❌ CORS not including your Vercel domain

### Get Help

1. Check backend logs: `cd backend && npm start`
2. Check tunnel logs: Look at terminal running `cloudflared`
3. Test tunnel URL directly: `curl https://your-tunnel-url/health`
4. Verify environment variables in Vercel dashboard

---

**Last Updated**: Based on current architecture
**Architecture**: Frontend (Vercel) → Cloudflare Tunnel → Backend (localhost:4000) → Local Services

