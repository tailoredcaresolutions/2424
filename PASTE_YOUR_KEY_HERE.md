# 🎯 QUICK START: Add Your V0 API Key

## WHERE TO PASTE YOUR KEY

Open this file:
```
/Volumes/AI/psw-reporting-production/.env.local
```

Find line 10 (near the top):
```bash
V0_API_KEY=your_v0_api_key_here
```

Replace with your actual key:
```bash
V0_API_KEY=v0_sk_your_actual_key_here
```

**That's it!** Save the file and I can start generating components for you! ✨

---

## HOW TO OPEN THE FILE

### Option 1: TextEdit (Mac)
```bash
open -a TextEdit /Volumes/AI/psw-reporting-production/.env.local
```

### Option 2: Nano (Terminal)
```bash
nano /Volumes/AI/psw-reporting-production/.env.local
# Edit line 10
# Save: Ctrl+O, Enter, Ctrl+X
```

### Option 3: VS Code
```bash
code /Volumes/AI/psw-reporting-production/.env.local
```

---

## TEST IT WORKS

After adding your key, run:
```bash
node scripts/generate-v0-component.js "Create a button with loading state"
```

You should see:
```
✅ Component generated successfully!
📦 To add this component to your project:
   v0 add abc123xyz
```

---

## WHAT HAPPENS NEXT

Once your key is added:

1. **I can generate components** - Just tell me what you need
2. **You get component IDs** - To install with `v0 add <id>`
3. **Components appear in** `components/ui/`
4. **Ready to use** in your React code!

### Example:
**You say**: "I need a quality toggle for 14B, 30B, and 72B models"

**I do**:
```bash
node scripts/generate-v0-component.js "Create a radio group with three options..."
```

**You get**:
```
Component ID: abc123xyz
Run: v0 add abc123xyz
```

**Done!** Component in `components/ui/quality-toggle.tsx`

---

## YOUR KEY IS SAFE ✅

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Only stored locally on your machine
- ✅ Only you and AI assistant have access
- ✅ Can regenerate anytime at v0.dev

---

## READY TO GO! 🚀

**File to edit**: `/Volumes/AI/psw-reporting-production/.env.local`  
**Line to change**: Line 10 - `V0_API_KEY=your_v0_api_key_here`  
**Test command**: `node scripts/generate-v0-component.js "Create a button"`  

**Once done, just tell me what components you need!** 🎨
