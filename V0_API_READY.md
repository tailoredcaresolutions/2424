# V0 API - Ready for AI Assistant Use! 🤖✨

**Date**: October 25, 2025  
**Status**: ✅ Configured for Programmatic Access  
**SDK**: v0-sdk installed  
**Script**: `scripts/generate-v0-component.js`

---

## ✅ Setup Complete

### What's Installed
1. ✅ **v0-sdk** package (56 packages)
2. ✅ **V0_API_KEY** configured in `.env.local`
3. ✅ **Helper script** created: `scripts/generate-v0-component.js`

### What You Need to Do
**📝 IMPORTANT: Add your V0 API key!**

Open `.env.local` and replace:
```bash
V0_API_KEY=your_v0_api_key_here
```

With your actual key:
```bash
V0_API_KEY=v0_sk_abc123xyz...
```

---

## How to Add Your API Key

### Step 1: Get Your Key
1. Visit: https://v0.dev/chat/settings/keys
2. Click "Create New API Key"
3. Copy the key (shown only once!)

### Step 2: Add to .env.local
```bash
# Open the file
nano /Volumes/AI/psw-reporting-production/.env.local

# Find this line (near the top):
V0_API_KEY=your_v0_api_key_here

# Replace with your actual key:
V0_API_KEY=v0_sk_abc123xyz_your_actual_key_here

# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 3: Test It!
```bash
node scripts/generate-v0-component.js "Create a button with loading state"
```

---

## How AI Assistant Will Use It

Once you add your API key, I can generate components programmatically:

### Example 1: Quality Toggle
```bash
node scripts/generate-v0-component.js "Create a radio group with three options: Fast (14B), Balanced (30B), Maximum (72B). Use navy and gold colors."
```

### Example 2: Voice Profile Selector
```bash
node scripts/generate-v0-component.js "Create a dropdown with voice profiles: Professional Female, Calm Male, Warm Female. Navy background, gold accents."
```

### Example 3: Status Badge
```bash
node scripts/generate-v0-component.js "Create a status badge component with three states: processing (gold), success (green), error (red)"
```

### What Happens:
1. 🎨 I call the V0 API with your prompt
2. 🤖 V0 generates the React component
3. 📦 Script shows the component ID
4. ✅ You run: `v0 add <component-id>` to install it
5. 🎉 Component appears in `components/ui/`

---

## Script Output Example

```
🎨 Generating component with V0 API...
📝 Prompt: "Create a button with loading state"

✅ Component generated successfully!

📊 Details:
   Chat ID: abc123xyz
   Web URL: https://v0.dev/chat/abc123xyz
   Version ID: v1
   Preview URL: https://v0.dev/chat/abc123xyz/demo
   Component ID: abc123xyz

📦 To add this component to your project:
   v0 add abc123xyz

🌐 Open in browser to view and customize:
   https://v0.dev/chat/abc123xyz
```

---

## Phase 2 Component Generation Plan

Once your API key is added, I can help generate:

### Week 1-2: Core UI Components
- Quality toggle (14B/30B/72B selector)
- Voice profile dropdown
- Status indicators
- Loading states

### Week 3: PWA Offline UI
- Offline mode banner
- Sync status indicator
- Queue status display

### Week 4: Multi-Language UI
- Language selector with flags
- Translation indicator
- Language-specific formatting

### Week 8: Analytics Dashboard
- Metrics cards with icons
- Chart components (line, bar, pie)
- Trend indicators
- Date range pickers

---

## Error Messages

### If API key is missing:
```
❌ ERROR: V0_API_KEY not configured!

To use V0 API programmatically:
1. Get your API key from: https://v0.dev/chat/settings/keys
2. Edit .env.local and replace V0_API_KEY value
3. Run this script again
```

**Solution**: Add your API key to `.env.local`

### If API key is invalid:
```
❌ ERROR generating component:
   Authentication error - Invalid API key
   Get a new key from: https://v0.dev/chat/settings/keys
```

**Solution**: Generate a new key and update `.env.local`

### If rate limit exceeded:
```
❌ ERROR generating component:
   Rate limit exceeded - Please wait and try again
```

**Solution**: Wait a few minutes and retry

---

## API Key Security

### ✅ DO:
- Store in `.env.local` (already gitignored)
- Keep it private
- Regenerate if compromised

### ❌ DON'T:
- Commit to version control
- Share publicly
- Hardcode in source files

---

## How It Works

### The Script (`scripts/generate-v0-component.js`):

1. **Loads Environment**: Reads `V0_API_KEY` from `.env.local`
2. **Validates Key**: Checks if key is configured
3. **Calls V0 API**: Uses v0-sdk to create a chat with your prompt
4. **Returns Results**: Shows component ID, URLs, and next steps
5. **Branded**: Automatically applies navy/gold color scheme

### The SDK:

```typescript
import { v0 } from 'v0-sdk'

// Automatically uses V0_API_KEY from environment
const chat = await v0.chats.create({
  message: 'Create a button with loading state',
  system: 'You are an expert React developer. Use navy and gold colors.',
  chatPrivacy: 'private',
  modelConfiguration: {
    modelId: 'v0-1.5-md',
    imageGenerations: true,
  }
})

// Returns chat ID, preview URL, etc.
```

---

## Testing the Setup

### Quick Test (After Adding Key):

```bash
# Test script with simple component
node scripts/generate-v0-component.js "Create a simple button"

# If successful, you'll see:
# ✅ Component generated successfully!
# 📦 To add this component to your project: v0 add abc123xyz

# Then install it:
v0 add abc123xyz
```

### Full Test (Phase 2 Component):

```bash
# Generate quality toggle
node scripts/generate-v0-component.js "Create a radio group with three options: Fast (14B), Balanced (30B), Maximum (72B). Use navy (#1B365D) and gold (#E3A248) colors. Add icons for each option."

# Get component ID from output
# Add to project:
v0 add <component-id>

# Component appears in components/ui/
# Import and use in PSWVoiceReporter.js!
```

---

## Next Steps

### Immediate:
1. ⏳ Add your V0 API key to `.env.local`
2. ⏳ Test: `node scripts/generate-v0-component.js "Create a button"`
3. ⏳ Verify component generation works

### Phase 2 Development:
1. ⏳ Generate UI components as needed
2. ⏳ Customize in v0.dev browser interface
3. ⏳ Add to project with `v0 add <id>`
4. ⏳ Integrate into PSWVoiceReporter.js

---

## Resources

### Files:
- **Script**: `scripts/generate-v0-component.js`
- **Config**: `.env.local` (add your key here!)
- **Example**: `.env.local.example` (template)
- **Docs**: `V0_COMPLETE_SETUP_GUIDE.md`

### Links:
- **Get API Key**: https://v0.dev/chat/settings/keys
- **V0 Website**: https://v0.dev
- **API Docs**: https://v0.app/docs/api
- **Pricing**: https://v0.dev/pricing

---

## Summary

✅ **SDK Installed**: v0-sdk ready to use  
✅ **Script Created**: `scripts/generate-v0-component.js`  
✅ **Environment Ready**: `.env.local` has V0_API_KEY placeholder  
⏳ **Your Turn**: Add your API key to `.env.local`  
⏳ **Test**: Run script to generate first component  
🚀 **Ready**: AI assistant can now generate components programmatically!

---

## AI Assistant Usage

Once your key is added, I can:
1. 🎨 Generate components on demand
2. 📦 Provide component IDs for installation
3. 🔗 Share preview URLs for review
4. ✨ Customize prompts for brand consistency
5. 🚀 Accelerate Phase 2 UI development

**Just add your V0 API key and we're ready to go!** 🎉
