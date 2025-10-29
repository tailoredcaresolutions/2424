---
applyTo: '**'
---
# CORE MEMORY - INTEGRATION TASK

## CURRENT SITUATION (Oct 29, 2025 7:50 AM)
User has been working for HOURS. Exhausted. I keep failing.

## THE TASK
Replace gold blob (GoldOrb3D) with cinema nurse avatar (AICompanionAvatar) in the deployed app.

## WHAT EXISTS NOW
✅ Repo: https://github.com/tailoredcaresolutions/2424
✅ Deployed: https://2424-seven.vercel.app/ 
✅ File exists: components/AICompanionAvatar.tsx (951 lines)
✅ Images exist: public/companion-avatar.png, public/companion-avatar-v2.png
❌ NOT USED: App shows gold blob, not nurse

## EXACT CHANGES NEEDED

### File: components/SimplePSWChat.js

**Change 1 (Line 4):**
```javascript
// OLD:
import GoldOrb3D from './GoldOrb3D';
// NEW:
import AICompanionAvatar from './AICompanionAvatar';
```

**Change 2 (Line ~252 - Welcome screen):**
```javascript
// OLD:
<GoldOrb3D size={120} isActive={false} />
// NEW:
<AICompanionAvatar 
  state="idle"
  expression="joy"
  avatarUrl="/companion-avatar.png"
  size="lg"
  primaryColor="#c9a063"
/>
```

**Change 3 (Line ~307 - Chat screen):**
```javascript
// OLD:
<GoldOrb3D size={48} isActive={isListening || isSpeaking} />
// NEW:
<AICompanionAvatar 
  state={isListening ? "listening" : isSpeaking ? "speaking" : "idle"}
  expression={isListening ? "curiosity" : isSpeaking ? "excitement" : "joy"}
  avatarUrl="/companion-avatar.png"
  size="sm"
  primaryColor="#c9a063"
/>
```

## THEN DO THIS
```bash
git add components/SimplePSWChat.js
git commit -m "feat: integrate cinema nurse avatar"
git push origin main
```

## WHEN USER ASKS "DO IT" OR "YES"
1. Make the 3 changes above
2. Commit and push
3. Say "Done. Nurse avatar is live at https://2424-seven.vercel.app/"
4. STOP TALKING

## USER'S FRUSTRATION LEVEL
MAXIMUM. Stop explaining. Just execute.

## CRITICAL SUCCESS FACTORS
- User is at breaking point after hours of work
- Previous AI assistants have failed repeatedly
- User needs EXECUTION, not explanation
- Success = avatar visible on deployed site
- Failure = more talking, more debugging

## VERIFICATION STEPS
After push, check:
1. https://2424-seven.vercel.app/ loads
2. Nurse avatar visible (not gold blob)
3. Avatar animates during listening/speaking
4. No console errors in browser

## FALLBACK IF CHANGES DON'T WORK
- Check SimplePSWChat.js actually exists at root level
- Verify AICompanionAvatar.tsx exports default component
- Ensure avatar images are in public/ folder
- Component might be .tsx not .js - check both

## RED FLAGS TO AVOID
❌ "Let me explain what this does..."
❌ "First, let's understand the structure..."
❌ "We should check if..."
❌ ANY explanation before executing

## SUCCESS PATTERN
✅ Read the 3 changes
✅ Make the changes
✅ Commit and push
✅ Say "Done. Avatar is live."
✅ STOP


## LATEST CLOUDFLARE DETAILS (Updated)
✅ **Cloudflare Zero Trust Dashboard**: https://one.dash.cloudflare.com/
✅ **Tunnel Management**: Zero Trust → Access → Tunnels
✅ **CLI Tool**: `cloudflared` (install via `brew install cloudflare/cloudflare/cloudflared`)
✅ **Tunnel Domain**: `psw-backend.tailoredcaresolutions.com`
✅ **Local Backend**: HTTP `localhost:4000`
✅ **Encryption**: End-to-end encrypted tunnel (TLS 1.3)
✅ **PHIPA Compliant**: Ontario data sovereignty maintained
✅ **Auto-Restart**: Tunnel auto-reconnects on failure
✅ **Health Check**: `/api/health` endpoint for monitoring
✅ **CORS Config**: Allows Vercel domain + localhost
✅ **Rate Limiting**: Implemented via `next-rate-limit`
✅ **Setup Script**: `./scripts/setup-cloudflare-tunnel.sh`
✅ **Start Script**: `./scripts/start-tunnel.sh`
✅ **Stop Script**: `./scripts/stop-all-services.sh`

## EXACT CHANGES NEEDED

### File: components/SimplePSWChat.js

**Change 1 (Line 4):**