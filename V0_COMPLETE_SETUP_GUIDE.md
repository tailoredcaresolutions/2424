# V0 Complete Setup Guide 🎯

**Last Updated**: October 25, 2025  
**Status**: Fully Documented with Context7 Validation ✅

---

## Understanding V0: Two Different Tools

V0 provides **two separate tools** for different use cases:

### 1. V0 CLI (Free - Already Installed ✅)

**What it does**: Downloads pre-built components from v0.dev  
**Use case**: Add existing components to your project  
**Authentication**: None required!  
**Cost**: **Free** for all public components  
**Installation**: ✅ Already done (`v0@2.2.5`)

**Usage Example**:
```bash
# 1. Visit https://v0.dev
# 2. Generate a component ("Create a button with loading state")
# 3. Copy component ID from URL (e.g., "xyz123")
# 4. Add to project:
v0 add xyz123

# Component appears in components/ui/
```

### 2. V0 API/SDK (Paid - Optional)

**What it does**: Programmatic access to V0's AI capabilities  
**Use case**: Build applications that create/manage chats, generate components, deploy  
**Authentication**: API key required  
**Cost**: **Premium ($20/month)** or Team plan  
**Installation**: `npm install v0-sdk` (when needed)

**Usage Example**:
```typescript
import { v0 } from 'v0-sdk'

// Create a chat and generate component
const chat = await v0.chats.create({
  message: 'Create a responsive navbar with Tailwind CSS',
})

console.log(`Preview: ${chat.latestVersion?.demoUrl}`)
```

---

## Quick Start: Using V0 CLI (Recommended)

### Step 1: Visit V0 Website
Open https://v0.dev in your browser

### Step 2: Generate Component
- Enter prompt: "Create a button with loading state and navy/gold colors"
- Click "Generate"
- Wait for V0 to create the component
- Preview the result

### Step 3: Copy Component ID
From the URL: `https://v0.dev/chat/abc123xyz`  
Copy the ID: `abc123xyz`

### Step 4: Add to Project
```bash
cd /Volumes/AI/psw-reporting-production
v0 add abc123xyz
```

### Step 5: Use the Component
```typescript
// Component appears in components/ui/
import { Button } from '@/components/ui/button'

export default function Page() {
  return <Button>Click me</Button>
}
```

---

## Advanced: Using V0 API/SDK (Optional)

### When You Need This
- Building dev tools that generate components
- Automating component creation
- Managing multiple projects/chats programmatically
- Creating custom AI-powered workflows

### Setup Process

#### 1. Sign Up for Premium Plan
Visit: https://v0.dev/pricing  
Choose: Premium ($20/month) or Team plan

#### 2. Get API Key
1. Go to https://v0.dev/chat/settings/keys
2. Click "Create New API Key"
3. Copy key (shown only once!)
4. Store securely

#### 3. Add to Environment
Create/edit `.env.local`:
```bash
# V0 API CONFIGURATION (Optional - Only for V0 SDK)
V0_API_KEY=your_api_key_here
```

#### 4. Install SDK
```bash
# For basic SDK
npm install v0-sdk

# For AI tools integration (Vercel AI SDK)
npm install @v0-sdk/ai-tools ai zod
```

#### 5. Use in Code

**Basic Usage**:
```typescript
import { v0 } from 'v0-sdk'

// Automatically uses V0_API_KEY from environment
const chat = await v0.chats.create({
  message: 'Create a login form with validation',
  system: 'You are an expert in React and form validation',
})

console.log(`Chat URL: ${chat.webUrl}`)
console.log(`Preview: ${chat.latestVersion?.demoUrl}`)
```

**With AI Tools** (Vercel AI SDK):
```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { v0Tools } from '@v0-sdk/ai-tools'

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Create a new React component for a todo list',
  tools: v0Tools({
    apiKey: process.env.V0_API_KEY,
  }),
})
```

**Custom Client** (for multiple organizations):
```typescript
import { createClient } from 'v0-sdk'

const v0 = createClient({
  apiKey: process.env.V0_API_KEY_FOR_MY_ORG,
})

const chat = await v0.chats.create({
  message: 'Create a component',
})
```

---

## V0 CLI vs V0 API/SDK Comparison

| Feature | V0 CLI | V0 API/SDK |
|---------|--------|------------|
| **Cost** | Free | $20+/month |
| **Use Case** | Add components manually | Automate/programmatic |
| **Authentication** | None | API key required |
| **Installation** | `npm install -g v0` | `npm install v0-sdk` |
| **Access** | Public components only | Full platform access |
| **Workflow** | Manual (visit site → add) | Code-based |
| **Best For** | Individual developers | Dev tools, automation |

---

## Environment Variables Summary

### For V0 CLI (Most Users)
**No environment variables needed!** Just use `v0 add <id>`.

### For V0 API/SDK (Advanced Users)
Add to `.env.local`:
```bash
# V0 API CONFIGURATION
# Get key from: https://v0.dev/chat/settings/keys
# Requires: Premium ($20/month) or Team plan
V0_API_KEY=your_v0_api_key_here
```

---

## Troubleshooting

### V0 CLI Issues

**Problem**: "Command not found: v0"  
**Solution**: 
```bash
npm install -g v0
```

**Problem**: "Component not found"  
**Solution**: Verify component ID from v0.dev URL

**Problem**: "Failed to fetch from registry"  
**Solution**: Check internet connection, try again (registry issues are temporary)

### V0 API/SDK Issues

**Problem**: "Authentication error (403)"  
**Solution**: 
- Verify API key in `.env.local`
- Check key at https://v0.dev/chat/settings/keys
- Ensure Premium/Team plan is active

**Problem**: "Rate limit exceeded (429)"  
**Solution**: 
```typescript
// Check rate limits
const rateLimits = await v0.rateLimits.find()
console.log(rateLimits)
```

**Problem**: "Invalid API key"  
**Solution**: 
- Regenerate key at https://v0.dev/chat/settings/keys
- Update `.env.local`
- Restart dev server

---

## Use Cases for PSW Reporting Project

### Phase 2 - Week 1-2: Component Generation

Use **V0 CLI** to generate UI components:

```bash
# Quality toggle (14B/30B/72B model selector)
# Prompt: "Create a radio group with three options: Fast (14B), Balanced (30B), Maximum (72B)"
v0 add <component-id>

# Voice profile selector
# Prompt: "Create a dropdown with voice profiles: Professional Female, Calm Male, Warm Female"
v0 add <component-id>

# Status indicator
# Prompt: "Create a status badge with colors: processing (gold), success (green), error (red)"
v0 add <component-id>
```

### Phase 2 - Week 3: PWA Offline UI

```bash
# Offline indicator
# Prompt: "Create a banner showing 'Working offline' with navy background and gold text"
v0 add <component-id>

# Sync status
# Prompt: "Create a sync progress indicator with circular progress and navy/gold theme"
v0 add <component-id>
```

### Phase 2 - Week 4: Multi-Language UI

```bash
# Language selector
# Prompt: "Create a language dropdown with flags: English, Filipino, Spanish, Portuguese, Hindi, Tibetan"
v0 add <component-id>
```

### Phase 2 - Week 8: Analytics Dashboard

```bash
# Metrics cards
# Prompt: "Create a stats card with icon, title, value, and trend indicator in navy/gold"
v0 add <component-id>

# Chart components
# Prompt: "Create a line chart component with navy lines and gold highlights"
v0 add <component-id>
```

---

## Advanced: V0 API Full Workflow

For building dev tools:

```typescript
import { v0 } from 'v0-sdk'

// 1. Create project
const project = await v0.projects.create({
  name: 'PSW Components Library',
})

// 2. Create chat in project
const chat = await v0.chats.create({
  projectId: project.id,
  message: 'Create a quality toggle component',
})

// 3. Send follow-up message
const updated = await v0.chats.sendMessage({
  chatId: chat.id,
  message: 'Add navy and gold colors',
})

// 4. Deploy
const deployment = await v0.chats.deploy({
  chatId: chat.id,
  versionId: chat.latestVersion.id,
})

// 5. Check deployment logs
const logs = await v0.deployments.findLogs({
  deploymentId: deployment.id,
})
```

---

## Resources

### Official Documentation
- V0 Website: https://v0.dev
- V0 API Docs: https://v0.app/docs/api
- V0 SDK GitHub: https://github.com/vercel/v0-sdk
- Pricing: https://v0.dev/pricing
- API Keys: https://v0.dev/chat/settings/keys

### Context7 Validated Libraries
- `/vercel/v0-sdk` - 89 code snippets, Trust Score: 10
- `/websites/v0_app` - 317 code snippets, Trust Score: 7.5

### Related Tools
- Vercel AI SDK: https://sdk.vercel.ai
- shadcn/ui: https://ui.shadcn.com (component system V0 uses)

---

## Summary

✅ **For most users**: Use V0 CLI (free, no auth)  
✅ **For automation**: Use V0 API/SDK (paid, $20+/month)  
✅ **Current status**: V0 CLI installed and ready  
✅ **Next step**: Generate components at v0.dev and add with `v0 add <id>`

**Recommendation**: Start with V0 CLI for Phase 2 component generation. Only upgrade to V0 API/SDK if you need programmatic control or are building dev tools.
