# 🔑 Add Your API Keys Here

**File**: `.env.local` (in project root)

## How to Add Your Keys

1. **Open the file**:
   ```bash
   cd /Volumes/AI/psw-reporting-production
   nano .env.local
   # OR open in your editor:
   code .env.local
   ```

2. **Add these sections** (if not already present):

---

## 🎨 FIGMA API (REST API - OAuth2)

```bash
# ============================================
# FIGMA REST API - OAuth2 Authentication
# ============================================
# Registered for REST API with client ID/secret
# Get from: https://www.figma.com/developers/apps (your app settings)

# OAuth2 Credentials (Primary - REST API)
FIGMA_CLIENT_ID=your_client_id_here
FIGMA_CLIENT_SECRET=your_client_secret_here

# Fallback: Personal Access Token (if OAuth2 not available)
FIGMA_API_TOKEN=your_figma_personal_access_token_here

# Project/File Configuration
FIGMA_FILE_KEY=your_file_key_here  # Get from Figma file URL: https://www.figma.com/file/FILE_KEY/...

# Optional: Specific node IDs to watch for changes
FIGMA_COMPONENT_IDS=123456:789,987654:321  # Separate multiple IDs with commas
```

**How to get Figma API token**:
1. Go to https://www.figma.com/developers/api#access-tokens
2. Sign in to Figma
3. Click "Create new personal access token"
4. Copy the token (starts with `figd_`)
5. Paste it above

**How to get Figma File Key**:
1. Open your design file in Figma
2. Look at the URL: `https://www.figma.com/file/FILE_KEY/File-Name`
3. Copy the `FILE_KEY` (the long string after `/file/`)
4. Paste it above

---

## 🎨 V0 API (Optional - $20/month Premium)

```bash
# ============================================
# V0 API - Component Generation
# ============================================
# Get key from: https://v0.dev/chat/settings/keys
# Requires V0 Premium subscription ($20/month)

V0_API_KEY=your_v0_api_key_here

# Optional: V0 Token (for private components - V0 Pro only)
V0_TOKEN=your_v0_token_here  # Optional, only for private components
```

**How to get V0 API key**:
1. Go to https://v0.dev/pricing
2. Subscribe to V0 Premium ($20/month)
3. Go to https://v0.dev/chat/settings/keys
4. Copy your API key (starts with `v0_sk_`)
5. Paste it above

**Note**: V0 CLI is already working (free). API key is only needed for programmatic access.

---

## 🏗️ BUILDER.IO API (Optional - $19+/month)

```bash
# ============================================
# BUILDER.IO - Visual Page Builder
# ============================================
# Get keys from: https://builder.io/account/space
# Requires Builder.io account (Free tier available, paid for API)

BUILDER_API_KEY=your_builder_api_key_here
BUILDER_SPACE_ID=your_builder_space_id_here

# Optional: Private API key (for server-side rendering)
BUILDER_PRIVATE_API_KEY=your_builder_private_api_key_here
```

**How to get Builder.io keys**:
1. Sign up at https://builder.io
2. Go to https://builder.io/account/space
3. Find your Space ID
4. Copy your Public API Key
5. (Optional) Copy your Private API Key for server-side rendering
6. Paste them above

---

## 🤝 How They Work Together

### **Design Workflow: Figma → Code**

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Figma   │─────▶│   API    │─────▶│   Code   │
│ Designs  │      │   Sync   │      │  (Next.js)│
└──────────┘      └──────────┘      └──────────┘
```

**How it works**:
1. **You design** in Figma (colors, spacing, components)
2. **Figma API** syncs design tokens → Tailwind config automatically
3. **I implement** your designs with exact specs from Figma
4. **Result**: Pixel-perfect implementation!

**Example**:
- You change a color in Figma
- Figma API detects the change
- Tailwind config updates automatically
- Code reflects the new color
- **Zero manual work!**

---

### **Component Workflow: V0 → Builder.io → Deployment**

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│   V0     │─────▶│ Builder  │─────▶│  Vercel   │
│ Generate │      │  Edit    │      │  Deploy   │
└──────────┘      └──────────┘      └──────────┘
```

**How it works**:
1. **Generate** component with V0 CLI (`v0 add <id>`)
2. **Enhance** in Builder.io for non-technical editing
3. **Deploy** to Vercel automatically
4. **Result**: Visual editing + auto-deployment!

**Best Use Case**:
- V0 generates base component code
- Builder.io allows content editing (text, images, layouts)
- Non-technical team members can edit content
- Technical team maintains the code

---

### **Full Integration Workflow**

```
┌──────────┐
│  Figma   │  ← Design system (colors, typography, spacing)
│  Design  │
└────┬─────┘
     │
     ▼
┌──────────┐
│  V0.dev  │  ← Generate components matching design system
│  Generate│
└────┬─────┘
     │
     ▼
┌──────────┐
│ Builder  │  ← Allow non-technical editing (optional)
│   Edit   │
└────┬─────┘
     │
     ▼
┌──────────┐
│  Vercel  │  ← Auto-deploy
│  Deploy  │
└──────────┘
```

**When to use each**:
- **Figma**: Always use - Single source of truth for design
- **V0**: Use when generating new components quickly
- **Builder.io**: Use only if non-technical team needs to edit content

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore` ✅
2. **Keep tokens secret** - Don't share them publicly
3. **Rotate tokens** - If exposed, create new ones
4. **Use different tokens** - For development vs production

---

## ✅ Quick Setup Checklist

- [ ] Get Figma API token (FREE)
- [ ] Get Figma file key (from your design file URL)
- [ ] (Optional) Get V0 API key if you have Premium ($20/mo)
- [ ] (Optional) Get Builder.io keys if you need visual editing ($19+/mo)
- [ ] Add all keys to `.env.local`
- [ ] Restart dev server: `npm run dev`

---

## 📞 Need Help?

**Figma API**: https://www.figma.com/developers/api  
**V0 API**: https://v0.dev/chat/settings/keys  
**Builder.io**: https://builder.io/account/space

---

**Once you add your keys, I can help you set up the integrations!** 🚀

FIGMA_CLIENT_ID=your_client_id_here
FIGMA_CLIENT_SECRET=your_client_secret_here
