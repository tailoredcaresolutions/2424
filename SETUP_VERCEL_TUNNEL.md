# Vercel → Cloudflare Tunnel Setup Guide

## Your Configuration

- **Vercel App**: Your app hosted on Vercel
- **Cloudflare Tunnel URL**: `https://pswback.tailoredcaresolutions.com`
- **Backend Server**: Running on `localhost:4000` on your Mac

## Quick Setup Steps

### Step 1: Ensure Backend is Running

On your Mac, start the backend server:
```bash
cd /Volumes/AI/psw-reporting-production/backend
npm start
```

Verify it's running:
```bash
curl http://localhost:4000/health
```

### Step 2: Ensure Cloudflare Tunnel is Running

Start the tunnel to connect `pswback.tailoredcaresolutions.com` → `localhost:4000`:

```bash
# If you have a named tunnel configured:
cloudflared tunnel run psw-backend

# Or check if it's already running:
ps aux | grep cloudflared
```

### Step 3: Verify Tunnel is Reachable

Test from your Mac:
```bash
curl https://pswback.tailoredcaresolutions.com/health
```

Should return the same JSON as `localhost:4000/health`.

### Step 4: Set Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add or Update:
   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://pswback.tailoredcaresolutions.com
   ```
   **Important**: Do NOT include trailing slash!

3. Apply to:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

4. **CRITICAL**: After adding/updating, you MUST redeploy:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on latest deployment
   - Click **Redeploy**
   - Or trigger a new deployment (push to Git)

### Step 5: Update Backend CORS

Edit `backend/.env` on your Mac:

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-app-name.vercel.app,https://pswback.tailoredcaresolutions.com
```

Replace `your-app-name.vercel.app` with your actual Vercel domain.

Then restart backend:
```bash
cd backend
npm start
```

## Testing the Connection

### From Browser Console (on your Vercel app):

```javascript
// Test 1: Check if environment variable is set (won't show value but will work)
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test 2: Direct tunnel test (if CORS allows)
fetch('https://pswback.tailoredcaresolutions.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### From Terminal:

```bash
# Test backend locally
curl http://localhost:4000/health

# Test tunnel from Mac
curl https://pswback.tailoredcaresolutions.com/health

# Test from Vercel server (if you have CLI access)
curl https://pswback.tailoredcaresolutions.com/health
```

## Troubleshooting

### Issue: "Connection Refused" from Vercel

**Check:**
1. ✅ Backend running: `curl http://localhost:4000/health`
2. ✅ Tunnel running: `ps aux | grep cloudflared`
3. ✅ Tunnel reachable: `curl https://pswback.tailoredcaresolutions.com/health`
4. ✅ Vercel env var set: Check Vercel dashboard
5. ✅ Redeployed: After changing env var

### Issue: CORS Errors

**Fix:**
1. Update `backend/.env` with your Vercel domain
2. Restart backend: `cd backend && npm start`
3. Clear browser cache and reload

### Issue: 404 Not Found

**Check:**
- Backend routes exist: `ls backend/routes/`
- Routes mounted correctly in `backend/routes/index.js`

## Architecture Flow

```
Browser (User)
    ↓
Vercel App (Frontend)
    ↓ fetch('/api/transcribe-whisper')
Next.js API Route (app/api/transcribe-whisper/route.js)
    ↓ fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/whisper/transcribe`)
Cloudflare Tunnel (pswback.tailoredcaresolutions.com)
    ↓ Encrypted
Backend Server (localhost:4000 on Mac)
    ↓
Local Services (Ollama, Whisper, XTTS, Database)
```

## Quick Diagnostic Commands

Run this on your Mac to check everything:

```bash
# Check backend
curl http://localhost:4000/health && echo "✅ Backend OK"

# Check tunnel
curl https://pswback.tailoredcaresolutions.com/health && echo "✅ Tunnel OK"

# Check processes
ps aux | grep -E "(node|cloudflared)" | grep -v grep && echo "✅ Services running"
```

## Environment Variables Summary

**Vercel (Production):**
```
NEXT_PUBLIC_BACKEND_URL=https://pswback.tailoredcaresolutions.com
```

**Backend `.env` (Your Mac):**
```
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://pswback.tailoredcaresolutions.com
```

---

**Last Updated**: Based on your tunnel URL `pswback.tailoredcaresolutions.com`

