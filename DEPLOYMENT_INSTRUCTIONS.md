# 🚀 Final Deployment Instructions

## Your Configuration

**Cloudflare Tunnel URL:** `https://psw-backend.tailoredcaresolutions.com`
**Status:** ✅ Tunnel created and configured

---

## Step 1: Setup Backend Environment (Local Mac)

```bash
cd /Volumes/AI/psw-reporting-production/backend

# Create .env from example
cp .env.example .env

# Edit .env file
nano .env
```

**Required changes in backend/.env:**

```bash
# Generate a secure 32+ byte key
DATABASE_ENCRYPTION_KEY=YOUR_SECURE_KEY_HERE

# Your tunnel URL is already configured
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://psw-backend.tailoredcaresolutions.com

# Other settings (adjust as needed)
PORT=4000
DATABASE_PATH=../data/local_psw_data.db
OLLAMA_HOST=http://localhost:11434
LOCAL_WHISPER_URL=http://localhost:9000/transcribe
LOCAL_TTS_URL=http://localhost:8020/tts
```

**Generate secure keys:**
```bash
# Database encryption key (32+ bytes)
openssl rand -base64 32

# NextAuth secret (32+ bytes)
openssl rand -base64 32
```

Copy these values into your `.env` file.

---

## Step 2: Test Backend Locally

```bash
# Install dependencies
npm install

# Start backend
npm start
```

**Test it:**
```bash
# In another terminal
curl http://localhost:4000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {...}
}
```

---

## Step 3: Test Tunnel Connection

```bash
# Test tunnel
curl https://psw-backend.tailoredcaresolutions.com/health
```

Should return the same health check response.

**✅ If this works, your tunnel is correctly routing to your Mac!**

---

## Step 4: Prepare for GitHub

### A. Verify No Secrets

```bash
cd /Volumes/AI/psw-reporting-production

# Check what will be committed
git status

# Make sure these are NOT listed (should be gitignored):
# - .env
# - .env.local
# - backend/.env
# - data/*.db
```

### B. Review .gitignore

Your `.gitignore` already excludes:
- ✅ `.env` and `.env*.local`
- ✅ `backend/.env`
- ✅ `data/` directory
- ✅ Database files
- ✅ Secrets and keys

### C. Final Security Check

```bash
# Search for any hardcoded secrets
grep -r "CHANGE_THIS" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "your-secret" . --exclude-dir=node_modules --exclude-dir=.git

# Should only find references in .env.example files (which is fine)
```

---

## Step 5: Push to GitHub

### A. Initialize Git (if not already done)

```bash
cd /Volumes/AI/psw-reporting-production

# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - PHIPA-compliant PSW documentation system"
```

### B. Create GitHub Repository

1. Go to: https://github.com/new
2. **Repository name:** `psw-voice-documentation`
3. **Description:** "PHIPA-compliant PSW documentation system with 100% local AI"
4. **Visibility:** ✅ **Private** (Keep it private!)
5. **DO NOT** initialize with README (you already have one)
6. Click **Create repository**

### C. Push to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/psw-voice-documentation.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 6: Deploy to Vercel

### A. Connect GitHub to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. If not connected, click **"Connect GitHub"**
4. Find and select: `psw-voice-documentation`
5. Click **Import**

### B. Configure Build Settings

Vercel should auto-detect Next.js. Verify:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave blank)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 22.x

### C. Add Environment Variables

Click **"Environment Variables"** and add:

#### Required:
```bash
NEXT_PUBLIC_BACKEND_URL=https://psw-backend.tailoredcaresolutions.com
NEXTAUTH_SECRET=your-secure-secret-here-32-bytes
NEXTAUTH_URL=https://your-app.vercel.app
```

Use the secure key you generated earlier for `NEXTAUTH_SECRET`.

#### Optional (but recommended):
```bash
NEXT_PUBLIC_APP_NAME=PSW Voice Documentation
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
```

**⚠️ Important:** For `NEXTAUTH_URL`, use your Vercel domain. You'll get this after first deploy, then update it.

### D. Deploy!

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://psw-voice-documentation-xyz.vercel.app`

### E. Update NEXTAUTH_URL

1. Copy your Vercel URL
2. Go to Vercel dashboard → Your project → Settings → Environment Variables
3. Edit `NEXTAUTH_URL` and change to your actual Vercel URL
4. **Redeploy:** Settings → Deployments → Click latest → Redeploy

---

## Step 7: Update Backend CORS (Important!)

Now that you have your Vercel URL, update backend:

Edit `backend/.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://psw-voice-documentation-xyz.vercel.app,https://psw-backend.tailoredcaresolutions.com
```

**Replace with your actual Vercel URL!**

Restart backend:
```bash
cd backend
npm start
```

---

## Step 8: Test Complete Setup

### A. Test Frontend

Open your Vercel URL in browser:
```
https://psw-voice-documentation-xyz.vercel.app
```

Should see the landing page.

### B. Test API Connection

Open browser console (F12) and run:
```javascript
fetch('https://psw-backend.tailoredcaresolutions.com/health')
  .then(r => r.json())
  .then(console.log)
```

Should return health check data.

### C. Test Full Flow

1. Navigate to voice recording page
2. Try recording (should connect to Whisper.cpp on your Mac)
3. Try AI features (should connect to Ollama on your Mac)
4. Check that all data stays on your Mac in Ontario

---

## 🎉 You're Live!

Your hybrid architecture is now fully deployed:

```
Frontend (Vercel USA)
    ↓ HTTPS
Cloudflare Tunnel (psw-backend.tailoredcaresolutions.com)
    ↓ Encrypted
Your Mac (Ontario, Canada)
    ↓
Backend + AI + Database (All PHI here!)
```

**✅ PHIPA Compliant:** All patient data stays in Ontario!

---

## 🔄 Future Updates

### Update Frontend:
```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Vercel auto-deploys (2-3 minutes)
```

### Update Backend:
```bash
# Make changes in backend/
# Restart backend:
cd backend
npm start
```

No redeployment needed - changes are immediate!

---

## 📞 Support

**Cloudflare Tunnel:** https://one.dash.cloudflare.com/
**Vercel Dashboard:** https://vercel.com/dashboard
**PHIPA Compliance:** 1-800-387-0073 (IPC Ontario)

---

## ⚠️ Important Reminders

Before using with real patient data:

- [ ] Read [docs/PHIPA_COMPLIANCE_ONTARIO.md](docs/PHIPA_COMPLIANCE_ONTARIO.md)
- [ ] Consult healthcare privacy lawyer
- [ ] Complete Privacy Impact Assessment (PIA)
- [ ] Implement formal consent processes
- [ ] Train all users on PHIPA requirements
- [ ] Change default admin password
- [ ] Enable MFA for all accounts
- [ ] Create encrypted database backups

---

**Your Tunnel URL:** `https://psw-backend.tailoredcaresolutions.com`
**Keep your Mac running** for the backend to be accessible!

**Good luck! 🚀🇨🇦**
