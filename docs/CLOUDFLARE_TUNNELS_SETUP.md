# Cloudflare Tunnels Setup - Clare Voice System

## Overview

This document describes the Cloudflare tunnel infrastructure that connects the cloud-deployed frontend with the local backend services.

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Vercel)                          │
│  https://psw-reporting-production.vercel.app│
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS/WSS
                   ▼
┌─────────────────────────────────────────────┐
│  Cloudflare Edge Network                    │
├─────────────────────────────────────────────┤
│  voice.tailoredcaresolutions.com           │
│  ai.tailoredcaresolutions.com              │
└──────────────────┬──────────────────────────┘
                   │
                   │ Cloudflare Tunnels
                   ▼
┌─────────────────────────────────────────────┐
│  Local Machine (Mac)                        │
├─────────────────────────────────────────────┤
│  cloudflared tunnels (2 active)            │
│    ├─ AI-DIRECT (PID 2507)                 │
│    │  └─ localhost:18888 → ai.tailored...  │
│    └─ VOICE-ORCH (PID 2505)                │
│       └─ localhost:8787 → voice.tailored...│
├─────────────────────────────────────────────┤
│  Backend Services                           │
│    ├─ Voice Orchestrator (port 8787)       │
│    │  • WebSocket: /ws/speak                │
│    │  • REST API: /chat, /api/ollama/*     │
│    ├─ AI Gateway (port 18888)              │
│    │  • Ollama Proxy: /api/generate        │
│    └─ Ollama (port 11434)                  │
│       • Local LLM: llama3.3:70b            │
└─────────────────────────────────────────────┘
```

## Tunnel Configuration

### 1. AI-DIRECT Tunnel
**Domain:** `ai.tailoredcaresolutions.com`
**Tunnel ID:** `10a69890-0c1a-41dd-8fd4-00ab77267223`
**Config:** `~/.cloudflared/ai-direct.yml`
**Local Backend:** `localhost:18888`

**Routes:**
- `/api/generate` → AI Gateway for Ollama model requests

### 2. VOICE-ORCH Tunnel
**Domain:** `voice.tailoredcaresolutions.com`
**Tunnel ID:** `f30f872a-1e5e-4e57-8414-d54a09113a08`
**Config:** `~/.cloudflared/voice-orch.yml`
**Local Backend:** `localhost:8787`

**Routes:**
- `/ws/speak` → WebSocket for real-time avatar lip-sync
- `/chat` → REST API for conversation AI

## Environment Variables

### Production URLs (via Cloudflare Tunnels)

```bash
# Voice Orchestrator WebSocket
NEXT_PUBLIC_VOICE_WS_URL=wss://voice.tailoredcaresolutions.com/ws/speak
NEXT_PUBLIC_VOICE_WS_TOKEN=

# AI Gateway
NEXT_PUBLIC_AI_GATEWAY_URL=https://ai.tailoredcaresolutions.com/api/generate

# Orchestrator Chat API
ORCH_PUBLIC_CHAT_URL=https://voice.tailoredcaresolutions.com/chat
```

### Local Development URLs

```bash
# Voice Orchestrator WebSocket (local testing)
NEXT_PUBLIC_VOICE_WS_URL=ws://127.0.0.1:8787/ws/speak

# AI Gateway (local testing)
NEXT_PUBLIC_AI_GATEWAY_URL=http://localhost:18888/api/generate

# Orchestrator Chat API (local testing)
ORCH_PUBLIC_CHAT_URL=http://127.0.0.1:8787/chat
```

## Files Updated

### Environment Configuration
1. `.env.example` - Added Cloudflare tunnel variables with documentation
2. `.env.local` - Added production tunnel URLs
3. `.env.production.local` - Added production tunnel URLs

### Components
1. `components/VisemeAvatarSVG.tsx` - Uses `NEXT_PUBLIC_VOICE_WS_URL` env var
2. `app/avatar-test/page.tsx` - Uses `NEXT_PUBLIC_VOICE_WS_URL` env var
3. `app/api/process-conversation-ai/route.js` - Uses `ORCH_PUBLIC_CHAT_URL` env var (corrected port to 8787)

## Tunnel Status

Check tunnel status:
```bash
cloudflared tunnel list
ps aux | grep cloudflared
```

Current status (as of configuration):
```
✅ AI-DIRECT (PID 2507) - ACTIVE
✅ VOICE-ORCH (PID 2505) - ACTIVE
✅ Orchestrator (PID 33330) - port 8787 - ACTIVE
✅ AI Gateway (PID 55401) - port 18888 - ACTIVE
```

## Testing

### Test WebSocket Connection
```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: $(openssl rand -base64 16)" \
  https://voice.tailoredcaresolutions.com/ws/speak
```

Expected: `HTTP/2 401` (requires authentication - tunnel is working!)

### Test AI Gateway
```bash
curl -s https://ai.tailoredcaresolutions.com/api/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.3:70b","prompt":"hello"}'
```

Expected: JSON response with model validation or generation result

### Test Chat API
```bash
curl -i https://voice.tailoredcaresolutions.com/chat
```

Expected: `HTTP/2 401` (requires authentication - tunnel is working!)

## Starting/Stopping Tunnels

### Start Tunnels
```bash
# Start AI-DIRECT tunnel
cloudflared --config ~/.cloudflared/ai-direct.yml tunnel run AI-DIRECT &

# Start VOICE-ORCH tunnel
cloudflared --config ~/.cloudflared/voice-orch.yml tunnel run voice-orchestrator &
```

### Stop Tunnels
```bash
# Find tunnel processes
ps aux | grep cloudflared

# Kill specific tunnel
kill <PID>

# Or kill all tunnels
pkill cloudflared
```

## Deployment Checklist

### For Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard:**
   - Navigate to: https://vercel.com/tcsolutions/psw-reporting-production/settings/environment-variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_VOICE_WS_URL=wss://voice.tailoredcaresolutions.com/ws/speak
     NEXT_PUBLIC_AI_GATEWAY_URL=https://ai.tailoredcaresolutions.com/api/generate
     ORCH_PUBLIC_CHAT_URL=https://voice.tailoredcaresolutions.com/chat
     ```

2. **Ensure Cloudflare Tunnels are Running:**
   ```bash
   cloudflared tunnel list
   # Both AI-DIRECT and VOICE-ORCH should show "Connected"
   ```

3. **Verify Backend Services:**
   ```bash
   lsof -i :8787  # Voice Orchestrator
   lsof -i :18888 # AI Gateway
   lsof -i :11434 # Ollama
   ```

4. **Deploy Frontend:**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Tunnel Not Connecting

1. Check if cloudflared is running:
   ```bash
   ps aux | grep cloudflared
   ```

2. Check tunnel logs:
   ```bash
   # Find the tunnel PID and check logs
   tail -f /var/log/cloudflared.log
   ```

3. Restart tunnel:
   ```bash
   pkill cloudflared
   cloudflared --config ~/.cloudflared/voice-orch.yml tunnel run voice-orchestrator &
   ```

### Backend Service Not Responding

1. Check if service is running:
   ```bash
   lsof -i :8787
   lsof -i :18888
   ```

2. Check service logs:
   ```bash
   # Navigate to service directory and check logs
   pm2 logs orchestrator  # if using pm2
   ```

3. Restart service:
   ```bash
   # Restart the orchestrator
   pm2 restart orchestrator
   ```

### WebSocket Connection Fails (401)

This is expected! The 401 error means:
- ✅ Tunnel is working correctly
- ✅ Request reached the orchestrator
- ❌ Authentication token is missing or invalid

To fix:
1. Set `NEXT_PUBLIC_VOICE_WS_TOKEN` environment variable
2. Or implement authentication in your frontend component

## Security Notes

1. **Authentication Required:** Both WebSocket and REST endpoints require authentication tokens
2. **HTTPS/WSS Only:** All production traffic uses encrypted connections
3. **Local Processing:** All AI processing happens locally (PHIPA compliant)
4. **Tunnel Security:** Cloudflare tunnels use certificate-based authentication

## Performance

- **WebSocket Latency:** ~50-100ms (depending on location)
- **REST API Latency:** ~100-200ms (depending on location)
- **AI Gateway Latency:** ~100-200ms + model inference time
- **Model Inference:**
  - llama3.3:70b: 2-8 seconds depending on prompt length
  - Streaming reduces perceived latency

## Support

For issues with:
- **Tunnels:** Check cloudflared documentation or Cloudflare dashboard
- **Backend Services:** Check service logs in `/Volumes/AI/orchestrator/logs`
- **Frontend:** Check Vercel deployment logs

## Related Files

- Tunnel configs: `~/.cloudflared/`
- Backend code: `/Volumes/AI/orchestrator/`
- Frontend code: `/Volumes/AI/psw-reporting-production/`
- Environment files: `/Volumes/AI/psw-reporting-production/.env*`
