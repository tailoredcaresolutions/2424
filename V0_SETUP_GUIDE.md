# V0 Setup Guide - Complete Reference

**Date**: October 25, 2025  
**Status**: ✅ V0 CLI Installed  
**Version**: 2.2.5  
**Project**: PSW Voice Reporting System  
**Context7 Validated**: Using `/vercel/v0-sdk` documentation

---

## Important: Two Separate V0 Tools

### 1. V0 CLI (Free - Installed ✅)
- **Purpose**: Add pre-built components from v0.dev
- **Auth**: None needed
- **Cost**: Free

### 2. V0 API/SDK (Paid - Optional)
- **Purpose**: Programmatic platform access
- **Auth**: API key required
- **Cost**: $20+/month

**This guide covers both.**

---

## ✅ Installation Complete

The V0 CLI has been successfully installed globally on your system:
```bash
npm install -g v0  # Already done ✓
```

The project has been initialized with V0:
```bash
v0 init  # Already done ✓
```

**File Created**: `components.json` (V0 configuration)

---

## 🔑 Authentication: CLI vs API

### V0 CLI (What You Installed) - FREE ✅

**No authentication needed!** Public components work immediately:

```bash
# Generate component on v0.dev
# Copy the component ID from URL
# Add to your project:
v0 add <component-id>
```

That's it! No API key, no token, no sign-in required.

### V0 API/SDK (Optional Premium Feature) - PAID 💰

For programmatic access (automation, dev tools), you need:

1. **Premium/Team Plan**: https://v0.dev/pricing ($20+/month)
2. **API Key**: Get from https://v0.dev/chat/settings/keys
3. **Add to .env.local**:
   ```bash
   V0_API_KEY=your_api_key_here
   ```
4. **Install SDK**:
   ```bash
   npm install v0-sdk
   ```

---

## 🔑 V0 API Key Configuration (For SDK Only)

**Only needed if using V0 API/SDK for programmatic access.**

### Step 1: Sign Up for Premium
Visit https://v0.dev/pricing and choose:
- **Premium**: $20/month (individual)
- **Team**: Custom pricing (multiple users)

### Step 2: Generate API Key
1. Go to https://v0.dev/chat/settings/keys
2. Click "Create New API Key"
3. Copy the key (shown only once!)
4. Store it securely

### Step 3: Add to Environment

Create or edit `.env.local`:
```bash
# V0 API Configuration (Only for V0 SDK)
# Get from: https://v0.dev/chat/settings/keys
V0_API_KEY=your_api_key_here
```

### Step 4: Install SDK

```bash
# For basic SDK
npm install v0-sdk

# For AI tools integration
npm install @v0-sdk/ai-tools ai zod
```

### Step 5: Use in Code

```typescript
import { v0 } from 'v0-sdk'

// Automatically uses V0_API_KEY from environment
const chat = await v0.chats.create({
  message: 'Create a responsive navbar',
})

console.log(`Preview: ${chat.latestVersion?.demoUrl}`)
```

---

## 📁 Where to Put API Keys

### Your `.env.local` File Structure

```bash
# ============================================
# PSW Voice Reporting System - Environment Configuration
# ============================================

# ----------------------------------------
# V0 CLI (AI Component Generation)
# ----------------------------------------
# Only needed for private components (V0 Pro feature)
# Public components work without any token!
# V0_TOKEN=your_v0_token_here                           # Optional: For private V0 Pro components

# ----------------------------------------
# LOCAL AI SERVER (Mac Studio M3 Ultra)
# ----------------------------------------
OLLAMA_HOST=http://localhost:11434                     # Ollama API endpoint
WHISPER_MODEL=small                                    # small | medium | large-v3
WHISPER_DEVICE=mps                                     # mps = Metal (GPU) acceleration
XTTS_MODEL=xtts_v2                                     # Text-to-speech model
XTTS_DEVICE=mps                                        # Metal acceleration

# ----------------------------------------
# CLOUD SERVICES
# ----------------------------------------
# Supabase Database (Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# NextAuth (Authentication)
NEXTAUTH_SECRET=your_secret_here                       # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ----------------------------------------
# OPTIONAL FALLBACKS (Emergency Only)
# ----------------------------------------
OPENAI_API_KEY=sk-...                                  # Only if local AI unavailable

# ----------------------------------------
# TAILSCALE VPN (Future - Phase 2)
# ----------------------------------------
LOCAL_AI_SERVER_URL=http://100.x.x.x:3001             # Tailscale IP (when deployed)
LOCAL_AI_SERVER_TOKEN=your-secure-token-here           # Server-to-server auth

# ----------------------------------------
# ANALYTICS & MONITORING (Phase 2)
# ----------------------------------------
ENABLE_ANALYTICS=true
ANALYTICS_ENDPOINT=https://analytics.tailoredcare.solutions
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...
ALERT_EMAIL=admin@tailoredcare.solutions

# ----------------------------------------
# PWA CONFIGURATION (Phase 2)
# ----------------------------------------
PWA_ENABLED=true
CACHE_STRATEGY=NetworkFirst
OFFLINE_FALLBACK_URL=/offline

# ----------------------------------------
# MULTI-LANGUAGE (Phase 2)
# ----------------------------------------
DEFAULT_LANGUAGE=en-CA
SUPPORTED_LANGUAGES=en,fil,es,pt,hi,bo
AUTO_DETECT_LANGUAGE=true
```

---

## 🚀 Using V0 CLI

### Basic Commands

**1. Add a V0 Component to Your Project**
```bash
v0 add <component-id>

# Example: If you generate a component on v0.dev, copy the ID from URL
# URL: https://v0.dev/chat/abc123xyz
# Command: v0 add abc123xyz
```

**2. Create a New Component**
```bash
v0 create <component-id>

# This is experimental - creates a new Next.js project with the component
```

**3. Interactive Mode**
```bash
v0  # Run without arguments for interactive prompts
```

---

## 🎨 V0 + PSW Voice Reporting System

### How to Use V0 for This Project

**Scenario 1: Generate a New UI Component**
1. Go to https://v0.dev
2. Describe the component you want (e.g., "A voice recording button with waveform visualization")
3. V0 generates React/Next.js code
4. Copy the component ID from the URL
5. Run: `v0 add <component-id>`
6. Component is added to `components/ui/` directory

**Scenario 2: Enhance Existing Components**
You can use V0 to generate variations of:
- **Golden Orb Animation** (components/GoldOrb3D.js)
- **Voice Activity Visualizer** (for Phase 2)
- **Mobile Navigation** (for Phase 2)
- **Analytics Dashboard** (for Phase 2)
- **Language Selector UI** (for Phase 2)

**Scenario 3: Generate Complete Pages**
Ask V0 to generate:
- "A settings page with tabs for profile, notifications, and security"
- "A dashboard with metrics cards and charts"
- "A mobile-optimized voice recording interface"

---

## 📋 V0 Configuration

### Current Setup (`components.json`)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "gray",
    "cssVariables": true
  },
  "aliases": {
    "utils": "@/lib/utils",
    "components": "@/components"
  }
}
```

**What This Means**:
- **style**: "default" - Uses default shadcn/ui styling
- **rsc**: true - React Server Components enabled (Next.js 16)
- **tsx**: true - TypeScript with JSX
- **tailwind**: Configured for your project (tailwind.config.ts + app/globals.css)
- **baseColor**: "gray" - Can change to match your brand (navy/gold)
- **cssVariables**: true - Uses CSS custom properties (compatible with your existing setup)

### Customizing for Tailored Care Solutions Brand

You can update `components.json` to match your brand colors:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",  // Changed from gray to slate (closer to navy)
    "cssVariables": true
  },
  "aliases": {
    "utils": "@/lib/utils",
    "components": "@/components"
  }
}
```

---

## 🛠️ Integration with Existing Project

### V0 Components + Tailored Care Solutions Design System

**Your Brand Colors**:
- Navy: `#0E1535`, `#1B365D`
- Gold: `#E3A248`, `#D4A574`

**V0 Components Will Use**:
- Your existing Tailwind config (tailwind.config.ts)
- Your global styles (app/globals.css)
- Your CSS variables (--tcs-navy, --tcs-gold, etc.)

**Best Practice**:
After adding a V0 component, update its colors to match:

```tsx
// V0 generates this:
<Button className="bg-gray-900 text-white">Click Me</Button>

// You update to your brand:
<Button className="bg-[#1B365D] text-white hover:bg-[#E3A248]">Click Me</Button>
```

---

## 📦 Dependencies

V0 CLI automatically installs required dependencies when you add components. Common packages:

```json
{
  "dependencies": {
    "@radix-ui/react-*": "^1.0.0",  // UI primitives (dialogs, dropdowns, etc.)
    "class-variance-authority": "^0.7.0",  // Styling variants
    "clsx": "^2.0.0",  // Conditional classNames
    "tailwind-merge": "^2.0.0"  // Merge Tailwind classes
  }
}
```

These are compatible with your existing Next.js 16 + React 19 setup.

---

## 🎯 Recommended V0 Use Cases for Phase 2

### Week 1-2: PSWVoiceReporter UI Enhancements
Use V0 to generate:
- **Quality Toggle Component**: Radio group with 14B/30B/72B options
- **Voice Profile Selector**: Dropdown with supportive/encouraging/clarifying
- **Model Status Indicators**: Badge components showing Whisper/Ollama/XTTS status

### Week 3: Offline Mode UI
Use V0 to generate:
- **Offline Indicator Badge**: Pill component showing "Offline Mode"
- **Sync Progress Bar**: Progress component for queue syncing
- **Queue Status Card**: Card showing pending/synced items

### Week 4: Multi-Language UI
Use V0 to generate:
- **Language Selector**: Dropdown with flag icons
- **Language Detection Badge**: Shows detected language with confidence
- **Translation Status**: Indicator for supported/unsupported languages

### Week 7: Mobile Navigation
Use V0 to generate:
- **Bottom Tab Bar**: Mobile navigation with icons
- **Hamburger Menu**: Slide-out drawer for mobile
- **Touch-Optimized Buttons**: Large tap targets (44x44px minimum)

### Week 8: Analytics Dashboard
Use V0 to generate:
- **Metric Cards**: KPI cards with trends
- **Chart Components**: Line/bar/pie charts for usage data
- **Data Tables**: Sortable/filterable tables for logs

---

## 🔐 Security Best Practices

### Protecting Your API Keys

**1. Never Commit API Keys**
Your `.gitignore` should already include:
```
.env.local
.env*.local
```

**2. Use Environment Variables**
All keys in `.env.local` (never hardcode in code)

**3. Rotate Keys Regularly**
- Vercel tokens: Rotate every 90 days
- Supabase keys: Use row-level security (RLS)
- NextAuth secret: Keep secure, never share

**4. Team Access**
- Each team member should authenticate with their own Vercel account
- Don't share `VERCEL_TOKEN` between team members

---

## ✅ Setup Checklist

- [x] V0 CLI installed (`npm install -g v0`)
- [x] Project initialized (`v0 init`)
- [x] `components.json` created
- [ ] **Ready to use!** (No authentication needed for public components)
- [ ] (Optional) V0 Pro account if using private components
- [ ] (Optional) Added `V0_TOKEN` to `.env.local` (only for private components)
- [ ] Tested V0 CLI (`v0 --help`)

---

## 📚 Resources

- **V0.dev**: https://v0.dev
- **V0 Documentation**: https://v0.dev/docs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Tokens**: https://vercel.com/account/tokens
- **shadcn/ui (V0's foundation)**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com

---

## 🆘 Troubleshooting

### Issue: "Failed to fetch base color from registry"
**Status**: This happened during `v0 init` but is non-critical
**Solution**: The `components.json` was still created successfully. You can manually update the `baseColor` if needed.

### Issue: "Authentication required"
**Solution**: This only happens for private components. Either:
- Use public components (no auth needed)
- Get V0 Pro and use `--token` flag
- Add `V0_TOKEN` to `.env.local`

### Issue: "Component not found"
**Solution**: Make sure you're copying the correct component ID from the V0.dev URL

### Issue: "Dependency conflicts"
**Solution**: V0 components use React 18+ and Next.js 13+, which your project already has (React 19, Next.js 16) ✅

---

## 📞 Support

- **V0 Issues**: https://github.com/vercel/v0/issues
- **Vercel Support**: https://vercel.com/support
- **Project Issues**: Check `PROJECT_CONTEXT.md` and `AI_ASSISTANT_GUIDE.md`

---

**Setup Complete!** You can now use V0 to generate React components for your PSW Voice Reporting System. 🎉

**Next Steps**:
1. Authenticate with Vercel: `vercel login`
2. Visit https://v0.dev and generate a component
3. Add it to your project: `v0 add <component-id>`
4. Customize colors to match Tailored Care Solutions brand
