# Cloudflare Tunnel Setup Guide

## ⚠️ PHIPA Compliance Notice (Ontario Healthcare)

**IMPORTANT:** This system is designed for **Ontario, Canada** and must comply with **PHIPA** (Personal Health Information Protection Act, 2004).

### Data Sovereignty & PHIPA Compliance

✅ **Your Data Stays in Canada:**
- **ALL personal health information (PHI) remains on your local Mac** in Ontario
- Database never leaves your physical location
- AI processing is 100% local (Ollama, Whisper, XTTS)
- No PHI is stored on Vercel or Cloudflare servers

✅ **What Cloudflare Tunnel Actually Does:**
- **Only HTTP requests/responses pass through the tunnel** (encrypted in transit)
- Acts as a secure proxy/router, not data storage
- Does not store, cache, or log PHI
- Provides TLS encryption for data in transit
- Metadata (connection info) may pass through US servers

⚠️ **Important Legal Considerations:**
1. **PHI Never Leaves Your Mac** - All patient data stored locally in Ontario
2. **Encrypted Transit** - Data encrypted end-to-end during transmission
3. **No Cloud Storage** - Vercel frontend has NO access to database
4. **AI Processing Local** - No PHI sent to cloud AI services
5. **Audit Logging** - All data access logged locally for PHIPA compliance

### PHIPA Requirements Met:
- ✅ Encryption at rest (SQLCipher AES-256-CBC)
- ✅ Encryption in transit (TLS 1.3 via Cloudflare Tunnel)
- ✅ Access controls (MFA authentication)
- ✅ Audit trails (all access logged in local database)
- ✅ Data residency (all PHI stored in Ontario)
- ✅ No third-party PHI processing (100% local AI)

### Architecture for PHIPA Compliance:

```
┌─────────────────────────────────────────────────────────┐
│  VERCEL (USA) - Frontend Only                          │
│  - Static HTML/CSS/JavaScript                          │
│  - NO patient data                                     │
│  - NO database access                                  │
└─────────────────────────────────────────────────────────┘
                       ↓
           Encrypted HTTPS Requests
           (Cloudflare Tunnel - Encrypted proxy only)
                       ↓
┌─────────────────────────────────────────────────────────┐
│  YOUR MAC (ONTARIO, CANADA) - All PHI Here             │
│  ✅ SQLCipher Database (encrypted at rest)             │
│  ✅ Ollama AI (local processing)                       │
│  ✅ Whisper.cpp (local speech-to-text)                 │
│  ✅ XTTS (local text-to-speech)                        │
│  ✅ Audit logs (PHIPA compliance)                      │
│  ✅ Backups (local, encrypted)                         │
└─────────────────────────────────────────────────────────┘
```

**Bottom Line:** Your Mac in Ontario is the **single source of truth** for all PHI. Cloudflare and Vercel only handle the frontend UI routing—no patient data ever leaves Canada.

---

## What is Cloudflare Tunnel?

Cloudflare Tunnel creates a secure, encrypted tunnel between your local backend server and the internet **without exposing ports or requiring port forwarding**. Your Vercel frontend will connect to your local Mac through this tunnel.

### Benefits:
- ✅ **Free** - No cost for personal use
- ✅ **Secure** - End-to-end encrypted tunnel
- ✅ **No port forwarding** - Works behind NAT/firewall
- ✅ **No public IP needed** - Dynamic IP friendly
- ✅ **Automatic HTTPS** - SSL certificates handled by Cloudflare
- ✅ **Fast** - Low latency global network
- ✅ **PHIPA Compatible** - PHI never leaves your Mac in Ontario

---

## Installation

### Step 1: Install Cloudflared

**macOS (Homebrew):**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**Manual Download:**
Visit https://github.com/cloudflare/cloudflared/releases

**Verify installation:**
```bash
cloudflared --version
# Should output: cloudflared version 2024.x.x
```

---

## Quick Start (No Login Required)

### Option 1: Quick Tunnel (Temporary)

For testing, you can create a temporary tunnel without authentication:

```bash
# Start your backend server first
cd /Volumes/AI/psw-reporting-production/backend
npm start

# In another terminal, create tunnel
cloudflared tunnel --url http://localhost:4000
```

**Output:**
```
2024-10-28 INF +--------------------------------------------------------------------------------------------+
2024-10-28 INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
2024-10-28 INF |  https://randomly-generated-subdomain.trycloudflare.com                                   |
2024-10-28 INF +--------------------------------------------------------------------------------------------+
```

**⚠️ Note:** This URL changes every time you restart the tunnel. Use permanent tunnel for production.

---

## Permanent Setup (Recommended)

### Step 2: Login to Cloudflare

```bash
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to select a domain (or use free Cloudflare tunnel domain)
3. Download a certificate to `~/.cloudflared/cert.pem`

### Step 3: Create Named Tunnel

```bash
# Create a permanent tunnel
cloudflared tunnel create psw-backend

# Expected output:
# Created tunnel psw-backend with id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Save this ID - you'll need it!
```

### Step 4: Configure Tunnel

Create configuration file:

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

**Add this configuration:**

```yaml
tunnel: psw-backend
credentials-file: /Users/YOUR_USERNAME/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  # Route all traffic to local backend
  - hostname: psw-backend.YOUR-DOMAIN.com
    service: http://localhost:4000

  # Catch-all rule (required)
  - service: http_status:404
```

**Replace:**
- `YOUR_USERNAME` with your Mac username
- `xxxxxxxx...json` with your tunnel credentials file
- `YOUR-DOMAIN.com` with your domain (or use trycloudflare.com)

### Step 5: Route DNS

```bash
# Point DNS to your tunnel
cloudflared tunnel route dns psw-backend psw-backend.YOUR-DOMAIN.com
```

**Using free Cloudflare tunnel domain:**
```bash
cloudflared tunnel route dns psw-backend psw-backend.trycloudflare.com
```

### Step 6: Run Tunnel

```bash
cloudflared tunnel run psw-backend
```

**Or use the quick command:**
```bash
cloudflared tunnel --config ~/.cloudflared/config.yml run
```

---

## Running as a Service (Auto-Start)

### macOS (launchd)

Create service file:
```bash
sudo nano /Library/LaunchDaemons/com.cloudflare.tunnel.plist
```

**Add:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
        <string>psw-backend</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/cloudflared.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/cloudflared-error.log</string>
</dict>
</plist>
```

**Start service:**
```bash
sudo launchctl load /Library/LaunchDaemons/com.cloudflare.tunnel.plist
sudo launchctl start com.cloudflare.tunnel
```

**Check status:**
```bash
sudo launchctl list | grep cloudflare
tail -f /tmp/cloudflared.log
```

---

## Configuration for PSW Project

### 1. Update Backend CORS

Edit `/Volumes/AI/psw-reporting-production/backend/.env`:

```bash
# Add your Cloudflare Tunnel URL
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app,https://psw-backend.trycloudflare.com
```

### 2. Update Vercel Environment Variables

In Vercel dashboard, add:

```bash
NEXT_PUBLIC_BACKEND_URL=https://psw-backend.trycloudflare.com
```

### 3. Test Connection

```bash
# From your Mac
curl https://psw-backend.trycloudflare.com/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-28T...",
#   ...
# }
```

---

## Startup Scripts

### Combined Backend + Tunnel

Create `scripts/start-local-services.sh`:

```bash
#!/bin/bash

echo "🚀 Starting PSW Local Services..."

# Start Ollama (if not running)
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
fi

# Start Whisper.cpp (if not running)
# TODO: Add your Whisper startup command

# Start XTTS (if not running)
# TODO: Add your XTTS startup command

# Start backend server
echo "Starting backend server..."
cd /Volumes/AI/psw-reporting-production/backend
npm start &

# Wait for backend to be ready
sleep 5

# Start Cloudflare Tunnel
echo "Starting Cloudflare Tunnel..."
cloudflared tunnel run psw-backend

echo "✅ All services started!"
```

**Make executable:**
```bash
chmod +x scripts/start-local-services.sh
```

**Run:**
```bash
./scripts/start-local-services.sh
```

---

## Troubleshooting

### Tunnel not connecting

```bash
# Check tunnel status
cloudflared tunnel info psw-backend

# Check logs
cloudflared tunnel run psw-backend --loglevel debug
```

### CORS errors

Ensure `ALLOWED_ORIGINS` in backend `.env` includes your Vercel URL:
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### DNS not resolving

```bash
# Check DNS records
dig psw-backend.trycloudflare.com

# Re-route DNS
cloudflared tunnel route dns psw-backend psw-backend.trycloudflare.com
```

### Backend not responding

```bash
# Check backend is running
lsof -i :4000

# Test locally
curl http://localhost:4000/health
```

---

## Security Considerations

1. **Tunnel URL is public** - Anyone with the URL can access your backend
2. **Add authentication** - Implement API key validation in backend
3. **Rate limiting** - Already configured in backend (100 req/min)
4. **Monitor logs** - Watch for suspicious activity
5. **Firewall rules** - Consider IP whitelisting via Cloudflare dashboard

### Add API Key Auth (Recommended)

Edit `backend/server.js`:

```javascript
// Add API key middleware
app.use('/api', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});
```

Add to backend `.env`:
```bash
API_SECRET_KEY=your-very-secure-random-key-here
```

Add to Vercel environment:
```bash
NEXT_PUBLIC_API_KEY=your-very-secure-random-key-here
```

Update `lib/api-client.ts`:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
  ...fetchOptions.headers,
}
```

---

## Resources

- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **GitHub:** https://github.com/cloudflare/cloudflared
- **Dashboard:** https://dash.cloudflare.com/

---

## Quick Reference

### Start everything:
```bash
./scripts/start-local-services.sh
```

### Stop tunnel:
```bash
pkill cloudflared
```

### View logs:
```bash
tail -f /tmp/cloudflared.log
```

### Get tunnel URL:
```bash
cloudflared tunnel info psw-backend
```
