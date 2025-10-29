# Quick Setup: Vercel → Your Mac (Port 4000)

## Your Tunnel Configuration

✅ **Cloudflare Tunnel**: `https://pswback.tailoredcaresolutions.com`  
✅ **Backend Port**: `4000` on your Mac

## ⚡ Quick Setup (3 Steps)

### Step 1: Set Vercel Environment Variable

**Go to Vercel Dashboard**:
1. Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   NEXT_PUBLIC_BACKEND_URL = https://pswback.tailoredcaresolutions.com
   ```
   ⚠️ **No trailing slash!**

3. **CRITICAL**: Click **Redeploy** (or push to Git to trigger deployment)

### Step 2: Ensure Services Are Running

**On your Mac**, run:
```bash
# Check if backend is running
curl http://localhost:4000/health

# If not running, start it:
cd /Volumes/AI/psw-reporting-production/backend
npm start
```

**Start tunnel** (if not running):
```bash
# Check if tunnel is running
ps aux | grep cloudflared

# If not, start it (adjust command based on your tunnel setup)
cloudflared tunnel run <your-tunnel-name>
```

### Step 3: Verify Connection

**Test from your Mac:**
```bash
# Should return backend health JSON
curl https://pswback.tailoredcaresolutions.com/health
```

**Test from Vercel app** (browser console):
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 🔍 Diagnostic Script

Run this to check everything:
```bash
./scripts/diagnose-connection.sh
```

---

## 📋 Configuration Summary

**Vercel Environment Variable:**
```
NEXT_PUBLIC_BACKEND_URL=https://pswback.tailoredcaresolutions.com
```

**Backend `.env` (on Mac):**
```
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://pswback.tailoredcaresolutions.com
```

**Architecture:**
```
Vercel Frontend → NEXT_PUBLIC_BACKEND_URL → pswback.tailoredcaresolutions.com → localhost:4000
```

---

See `SETUP_VERCEL_TUNNEL.md` for detailed troubleshooting.

