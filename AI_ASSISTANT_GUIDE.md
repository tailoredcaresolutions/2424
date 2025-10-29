# 🤖 AI Assistant Quick Reference

## For Blackbox AI, Cursor, GitHub Copilot, or Any AI Tool

### 📖 Read These Files First

1. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** ← **START HERE**
   - Complete project documentation
   - All technical details
   - Code patterns and standards
   - 500+ lines of context

2. **[.blackboxrules](.blackboxrules)** ← For Blackbox AI specifically
   - Condensed version of PROJECT_CONTEXT.md
   - Critical rules and warnings
   - Autonomy guidelines

3. **[START_HERE.md](START_HERE.md)** ← For humans
   - Quick start guide
   - All 14 pages list
   - Troubleshooting tips

---

## ⚡ Quick Copy-Paste Prompts

### For Starting Work
```
I'm working on the PSW Voice Documentation System.
Please read PROJECT_CONTEXT.md in the project root to understand
the architecture, standards, and critical rules. Key points:

1. Brand colors: Navy #1B365D + Gold #D4A574 (ALWAYS use these)
2. State variable is "report" NOT "generatedReport" (will crash if wrong)
3. Ontario PSW scope: NO clinical diagnoses, only observations
4. All 14 pages must continue working (100% uptime)
5. DAR JSON must follow schema and validate with AJV

Current status: 9.5/10 grade, 95% complete, production-ready
```

### For Bug Fixes
```
There's an issue with [DESCRIBE PROBLEM].

Before fixing:
1. Check PROJECT_CONTEXT.md for correct patterns
2. Verify state variable names (report NOT generatedReport)
3. Ensure brand colors maintained (#1B365D navy, #D4A574 gold)
4. Test with: node comprehensive-audit.js

The main component is components/PSWVoiceReporter.js (1,850 lines).
All 14 pages must continue working after the fix.
```

### For New Features
```
I need to add [NEW FEATURE].

Requirements:
1. Use brand colors: #1B365D (navy), #D4A574 (gold)
2. Follow patterns in PROJECT_CONTEXT.md
3. Maintain Ontario PSW compliance (no clinical content)
4. Test all 14 pages after: node comprehensive-audit.js
5. Preserve existing functionality

Please suggest an implementation plan first.
```

---

## 🚨 CRITICAL WARNINGS

### Will Crash If You:
- ❌ Use `generatedReport` instead of `report`
- ❌ Modify state variables without reading file first
- ❌ Break the 14 working pages
- ❌ Use colors other than #1B365D or #D4A574

### Will Violate Standards If You:
- ❌ Add clinical diagnoses to PSW notes
- ❌ Use terms: diagnose, assess, prescribe, treatment
- ❌ Remove "Notify supervisor/RN" patterns
- ❌ Change DAR JSON schema without validation

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Grade** | 9.5/10 (Excellent) |
| **Completion** | 95% (pending DB + prod API) |
| **Pages** | 14/14 working (100%) |
| **Tests** | All passing ✅ |
| **Main Component** | 1,850 lines |
| **API Route** | 367 lines |
| **Total Features** | 7 major phases |

---

## 🎯 Common Tasks with Examples

### Add a Button
```javascript
<button
  onClick={handleAction}
  className="px-4 py-2 rounded-lg"
  style={{ backgroundColor: '#1B365D', color: 'white' }}
>
  Button Text
</button>
```

### Add State
```javascript
const [myState, setMyState] = useState(init);

// In saveSession:
myState,  // add to session object

// In loadSession:
setMyState(session.myState);
```

### Test Your Changes
```bash
node comprehensive-audit.js    # All 14 pages
node test-dar-json.js          # DAR JSON (5 scenarios)
npm run dev                    # Start server
```

---

## 📁 Key Files You'll Edit

| File | Purpose | Lines |
|------|---------|-------|
| `components/PSWVoiceReporter.js` | Main UI component | 1,850+ |
| `app/api/generate-ai-report/route.js` | DAR JSON API | 367 |
| `app/globals.css` | Styles + animations | 200+ |
| `app/page.tsx` | Main page wrapper | 6 |
| `tailwind.config.ts` | Tailwind config | 20 |

---

## 🧪 Testing Commands

```bash
# Quick test
curl http://localhost:3000/test-clean

# Full audit (14 pages)
node comprehensive-audit.js

# DAR JSON test (5 scenarios)
node test-dar-json.js

# Simple API test
node test-api-simple.js

# Start fresh server
rm -rf .next && npm run dev
```

---

## 🎨 Style Guide

### Tailwind Classes
```javascript
// Button primary
"px-4 py-2 rounded-lg bg-blue-600 text-white"

// Card
"bg-white rounded-lg shadow-lg p-6"

// Heading
"text-2xl font-semibold text-gray-900"
```

### Brand Colors
```javascript
style={{ backgroundColor: '#1B365D' }}  // Navy
style={{ color: '#D4A574' }}            // Gold
style={{ backgroundColor: '#E8F0F5' }}  // Light BG
```

---

## 🔗 URLs to Test

| Page | URL |
|------|-----|
| Main | http://localhost:3000/ |
| Demo DAR | http://localhost:3000/demo-dar |
| **Test Clean** | http://localhost:3000/test-clean |
| Admin | http://localhost:3000/admin |
| Profile | http://localhost:3000/profile |
| Settings | http://localhost:3000/settings |

**(Test Clean = guaranteed no cache issues)**

---

## 📞 When Things Break

### Console Error: "ReferenceError: generatedReport"
→ Change to `report` everywhere

### Page looks plain (no colors)
→ Hard refresh: Cmd+Shift+R or Ctrl+Shift+R

### API timeout
→ Check `.env.local` has `NEXT_PUBLIC_USE_MOCK_DATA=true`

### JSON validation fails
→ Check `darSchema` in `generate-ai-report/route.js`

### All pages broken
→ Run `rm -rf .next && npm run dev`

---

## ✅ Success Checklist

Before committing changes, verify:
- [ ] All 14 pages load (run `comprehensive-audit.js`)
- [ ] Navy #1B365D and gold #D4A574 colors present
- [ ] No JavaScript errors in console (F12)
- [ ] DAR JSON validates (run `test-dar-json.js`)
- [ ] Ontario PSW scope maintained (no diagnoses)
- [ ] State variables correct (`report` not `generatedReport`)
- [ ] "Tailored Care Solutions" branding intact

---

## 📚 Documentation Files

1. **PROJECT_CONTEXT.md** - Full project documentation (500+ lines)
2. **.blackboxrules** - Blackbox AI specific rules
3. **START_HERE.md** - Human quick start guide
4. **AI_ASSISTANT_GUIDE.md** - This file (quick reference)
5. **DAR_JSON_IMPLEMENTATION_COMPLETE.md** - DAR implementation details
6. **DAR_JSON_TEST_RESULTS.md** - Test results and validation
7. **QUICK_START_DAR.md** - DAR JSON quick reference

---

**Remember**: Always read PROJECT_CONTEXT.md first!
It contains everything you need to work autonomously and correctly.

**Last Updated**: October 24, 2025
**Project Status**: Production-Ready (95% complete)
**Grade**: 9.5/10 (Excellent)
