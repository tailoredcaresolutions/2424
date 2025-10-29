# Cloudflare Tunnel Setup - Web UI Guide (No Command Line!)

## Quick Guide: Create Tunnel Using Cloudflare Dashboard

This guide shows you how to create a Cloudflare Tunnel using **only the web interface** - no command line needed!

---

## Step 1: Go to Cloudflare Zero Trust Dashboard

1. Go to: **https://one.dash.cloudflare.com/**
2. Sign in with your Cloudflare account (or create free account)
3. If prompted, create a team name (e.g., "PSW-Ontario")

---

## Step 2: Create a Tunnel

1. In the left sidebar, click **Access** → **Tunnels**
2. Click the blue **Create a tunnel** button
3. Choose tunnel type:
   - Select **"Cloudflared"** (recommended)
   - Click **Next**

4. **Name your tunnel:**
   - Name: `psw-backend`
   - Click **Save tunnel**

5. **Install connector:**

   You'll see installation instructions. Choose your method:

   ### Option A: macOS (Recommended)
   Copy the command shown, it looks like:

   ```bash
   brew install cloudflare/cloudflare/cloudflared
   cloudflared service install [your-token-here]
   ```

   Paste in Terminal and run it. Then click **Next**.

   ### Option B: Docker (Alternative)
   Copy the docker command shown:

   ```bash
   docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token [your-token]
   ```

6. **Configure the tunnel:**

   Fill in the routing:
   - **Public hostname (optional):**
     - Subdomain: `psw` (or leave blank for auto)
     - Domain: Select your domain or use `trycloudflare.com`
     - Path: leave empty

   - **Service:**
     - Type: `HTTP`
     - URL: `localhost:4000`

   Click **Save tunnel**

7. **You're done!** Copy the tunnel URL shown (e.g., `https://psw.trycloudflare.com`)

---

## Step 3: Update Your Configuration

Once you have the tunnel URL (e.g., `https://psw-random.trycloudflare.com`):

### Update Backend

Edit `backend/.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://psw-random.trycloudflare.com
```

### Update Vercel

In Vercel dashboard, add environment variable:
```
NEXT_PUBLIC_BACKEND_URL=https://psw-random.trycloudflare.com
```

---

## Step 4: Test It

```bash
# In Terminal, test the tunnel
curl https://psw-random.trycloudflare.com/health
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

## That's It!

Your tunnel is now running and will automatically start with your Mac!

**Tunnel URL:** https://psw-random.trycloudflare.com (yours will be different)

### To manage your tunnel:
- Go back to: https://one.dash.cloudflare.com/
- Click **Access** → **Tunnels**
- See status, edit, or delete

---

## Simple Prompt for Cloudflare Support

If you want to ask Cloudflare support to help, use this:

> **"Hi! I need help creating a Cloudflare Tunnel to route requests to my local server running on localhost:4000. I want to access it from a Vercel frontend. Can you guide me through the Zero Trust dashboard setup?"**

They'll walk you through the same steps above!

---

**That's all you need!** No command line skills required. 🎉
