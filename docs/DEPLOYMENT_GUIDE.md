# PSW Voice Documentation - Hybrid Deployment Guide

## ⚠️ PHIPA Compliance Notice (Ontario Healthcare)

**STOP! READ THIS FIRST:** This system handles Personal Health Information (PHI) and must comply with Ontario's **PHIPA** (Personal Health Information Protection Act, 2004).

**Before deploying:**
1. Read [PHIPA_COMPLIANCE_ONTARIO.md](PHIPA_COMPLIANCE_ONTARIO.md) - Complete compliance guide
2. Consult with a healthcare privacy lawyer specializing in Ontario PHIPA
3. Complete a Privacy Impact Assessment (PIA)
4. Obtain approval from your organization's privacy officer

**Key Compliance Points:**
- ✅ All PHI stays on your Mac in Ontario (never crosses border)
- ✅ 100% local AI processing (no cloud AI services)
- ✅ Encryption at rest (SQLCipher AES-256) and in transit (TLS 1.3)
- ✅ Audit trails for all data access
- ⚠️ Consent processes must be implemented before production use
- ⚠️ Breach response procedures must be established

**This deployment guide provides technical instructions. Legal compliance requires additional organizational policies and procedures beyond technical implementation.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Frontend (Next.js 16 + React 19)             │  │
│  │  - UI Components                                      │  │
│  │  - Pages & Routing                                    │  │
│  │  - Client-side State                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE TUNNEL                         │
│           (Secure encrypted connection)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   YOUR MAC (Local)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Backend Server (Express.js)                   │  │
│  │  - API Routes                                         │  │
│  │  - Authentication & MFA                               │  │
│  │  - SQLCipher Database                                 │  │
│  │  - Backup Management                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AI Services (Local)                      │  │
│  │  - Ollama (LLaMA 3.3 70B)  - localhost:11434         │  │
│  │  - Whisper.cpp (STT)       - localhost:9000          │  │
│  │  - Coqui XTTS (TTS)        - localhost:8020          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### 1. GitHub Account
- Free account at https://github.com

### 2. Vercel Account
- Free account at https://vercel.com
- Connect with your GitHub account

### 3. Local Mac Setup
- macOS with M-series chip (M1/M2/M3)
- Node.js 22.21.0+ installed
- Ollama running (see [LOCAL_AI_MODELS_SETUP.md](LOCAL_AI_MODELS_SETUP.md))
- Whisper.cpp server running
- Coqui XTTS server running

### 4. Cloudflare Account (Optional but Recommended)
- Free account at https://cloudflare.com
- Needed for permanent tunnel URL

---

## Step 1: Prepare Local Environment

### 1.1 Configure Backend Environment

```bash
cd /Volumes/AI/psw-reporting-production/backend

# Copy environment template
cp .env.example .env

# Edit with your settings
nano .env
```

**Required settings:**
```bash
PORT=4000
DATABASE_ENCRYPTION_KEY=CHANGE_THIS_TO_SECURE_32_BYTE_KEY
DATABASE_PATH=../data/local_psw_data.db
OLLAMA_HOST=http://localhost:11434
LOCAL_WHISPER_URL=http://localhost:9000/transcribe
LOCAL_TTS_URL=http://localhost:8020/tts
```

### 1.2 Install Backend Dependencies

```bash
cd backend
npm install
```

### 1.3 Test Backend Locally

```bash
# Start backend server
npm start

# In another terminal, test health check
curl http://localhost:4000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T...",
  "uptime": 1.234,
  "services": {
    "database": { "status": "ok" },
    "ollama": { "status": "ok" },
    "filesystem": { "status": "ok" }
  }
}
```

---

## Step 2: Setup Cloudflare Tunnel

Follow the detailed guide: [CLOUDFLARE_TUNNEL_SETUP.md](CLOUDFLARE_TUNNEL_SETUP.md)

### Quick Setup:

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Quick tunnel (temporary URL)
cloudflared tunnel --url http://localhost:4000
```

**Save the tunnel URL** (e.g., `https://random-name.trycloudflare.com`)

---

## Step 3: Push to GitHub

### 3.1 Initialize Git Repository (if not done)

```bash
cd /Volumes/AI/psw-reporting-production

# Check current status
git status

# If not a repo, initialize
git init
git add .
git commit -m "Initial commit - hybrid architecture"
```

### 3.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `psw-voice-documentation`
3. Description: "PSW Voice Documentation System - Private Testing"
4. **Visibility:** ✅ **Private** (Keep it private for testing)
5. Click "Create repository"

### 3.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/psw-voice-documentation.git

# Push code
git branch -M main
git push -u origin main
```

**⚠️ Important:** Verify `.env` files are NOT pushed:
```bash
# Check what was pushed
git log --name-only -1

# .env files should NOT appear
# If they do, remove them immediately:
git rm --cached .env .env.local backend/.env
git commit -m "Remove env files"
git push
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `psw-voice-documentation`
4. Click "Import"

### 4.2 Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 22.x

### 4.3 Configure Environment Variables

Click "Environment Variables" and add:

```bash
# Required
NEXT_PUBLIC_BACKEND_URL=https://your-tunnel-url.trycloudflare.com
NEXTAUTH_SECRET=generate-a-secure-random-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Optional
NEXT_PUBLIC_APP_NAME=PSW Voice Documentation
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
```

**Generate secure secret:**
```bash
openssl rand -base64 32
```

### 4.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be available at: `https://your-app.vercel.app`

---

## Step 5: Update CORS Configuration

### 5.1 Update Backend CORS

Edit `backend/.env`:

```bash
# Add your Vercel URL
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://your-tunnel-url.trycloudflare.com
```

### 5.2 Restart Backend

```bash
# Stop backend (Ctrl+C)
# Restart
cd backend
npm start
```

---

## Step 6: Verify Deployment

### 6.1 Test Frontend

1. Open `https://your-app.vercel.app` in browser
2. Check console for errors (F12)
3. Should see landing page

### 6.2 Test Backend Connection

```bash
# From browser console (F12)
fetch('https://your-tunnel-url.trycloudflare.com/health')
  .then(r => r.json())
  .then(console.log)
```

### 6.3 Test End-to-End

1. Navigate to voice recording page
2. Try recording voice (should connect to Whisper)
3. Try AI features (should connect to Ollama)
4. Check database operations (search, reports)

---

## Step 7: Production Checklist

### PHIPA Compliance (Ontario Healthcare) - REQUIRED

- [ ] **Read [PHIPA_COMPLIANCE_ONTARIO.md](PHIPA_COMPLIANCE_ONTARIO.md)**
- [ ] Consult healthcare privacy lawyer (Ontario PHIPA)
- [ ] Complete Privacy Impact Assessment (PIA)
- [ ] Implement formal patient consent tracking
- [ ] Establish breach response plan (IPC: 1-800-387-0073)
- [ ] Document retention/disposal policies (10 years minimum)
- [ ] Obtain privacy officer approval
- [ ] Train all users on PHIPA requirements
- [ ] Verify all PHI stays in Ontario (no cross-border transfer)
- [ ] Disable Sentry or configure PII scrubbing (no PHI in error logs)

### Security

- [ ] Change default admin password
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ bytes)
- [ ] Generate strong `DATABASE_ENCRYPTION_KEY` (32+ bytes)
- [ ] Enable MFA for ALL user accounts (PHIPA best practice)
- [ ] Add API key authentication (recommended)
- [ ] Review CORS allowed origins (Vercel + tunnel only)
- [ ] Enable rate limiting
- [ ] Verify encryption at rest (SQLCipher working)
- [ ] Verify encryption in transit (TLS 1.3 via tunnel)
- [ ] Test audit logging (all access recorded)

### Performance

- [ ] Verify Ollama is using M3 Ultra presets
- [ ] Test backend response times (`/api/health`)
- [ ] Monitor Vercel analytics
- [ ] Check Cloudflare Tunnel latency

### Monitoring

- [ ] Set up Sentry error tracking (optional)
- [ ] Configure log retention
- [ ] Set up backup schedule
- [ ] Test disaster recovery

### Documentation

- [ ] Update README.md with your URLs
- [ ] Document custom configuration
- [ ] Save tunnel URL and credentials
- [ ] Create runbook for common issues

---

## Maintenance

### Update Frontend

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Vercel will auto-deploy (2-3 minutes)
```

### Update Backend

```bash
# Stop backend (Ctrl+C)
# Make changes
# Restart backend
cd backend
npm start
```

### Update Dependencies

```bash
# Frontend
npm update

# Backend
cd backend
npm update
```

---

## Troubleshooting

### Frontend shows "API Error"

**Check:**
1. Is backend running? (`lsof -i :4000`)
2. Is tunnel running? (`pgrep cloudflared`)
3. Is `NEXT_PUBLIC_BACKEND_URL` correct in Vercel?
4. Check CORS configuration in backend

**Fix:**
```bash
# Restart backend
cd backend
npm start

# Restart tunnel
cloudflared tunnel --url http://localhost:4000
```

### Vercel Build Fails

**Common causes:**
1. TypeScript errors → Check `npm run build` locally
2. Missing dependencies → Check `package.json`
3. Environment variables → Verify in Vercel dashboard

**Fix:**
```bash
# Test build locally
npm run build

# Check logs in Vercel dashboard
# Settings → Deployments → Click failed deployment → View logs
```

### Database Connection Fails

**Check:**
1. Database file exists: `ls -la data/local_psw_data.db`
2. Encryption key is correct in `backend/.env`
3. File permissions: `chmod 644 data/local_psw_data.db`

### Ollama Not Responding

**Check:**
```bash
# Is Ollama running?
pgrep ollama

# Start if not running
ollama serve &

# Test API
curl http://localhost:11434/api/tags
```

### Tunnel Connection Lost

**Check:**
```bash
# Is cloudflared running?
pgrep cloudflared

# Restart tunnel
cloudflared tunnel --url http://localhost:4000
```

---

## Costs

### Free Tier Limits

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Vercel** | 100 GB bandwidth/month | Hobby plan |
| **GitHub** | Unlimited public repos | Private repos available |
| **Cloudflare Tunnel** | Unlimited | Free forever |
| **Your Mac** | Local compute | M3 Ultra recommended |

**Total Monthly Cost: $0** 🎉

### If You Need More

- **Vercel Pro:** $20/month (1TB bandwidth)
- **GitHub Pro:** $4/month (advanced features)
- **Cloudflare:** Free tier is sufficient

---

## Next Steps

1. **Test thoroughly** - Try all features
2. **Monitor logs** - Watch for errors
3. **Backup database** - `npm run backup` (or `/api/backup/create`)
4. **Document changes** - Keep notes on customizations
5. **Set up monitoring** - Sentry, Vercel Analytics

---

## Support

- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Ollama Docs:** https://ollama.ai/docs

---

## Architecture Benefits

✅ **Privacy First** - All AI processing on your Mac
✅ **Low Cost** - Free tier for everything
✅ **Scalable** - Frontend scales automatically on Vercel
✅ **Flexible** - Easy to update frontend or backend independently
✅ **Secure** - Encrypted tunnel, no exposed ports
✅ **Fast** - Vercel CDN for frontend, local AI for speed

---

**Congratulations! Your PSW Voice Documentation System is now deployed! 🎉**
