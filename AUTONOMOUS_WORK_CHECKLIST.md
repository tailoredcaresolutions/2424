# 🛡️ AUTONOMOUS WORK GUARDRAILS CHECKLIST

**Purpose**: Reference this BEFORE every major code change or file creation  
**Last Updated**: October 25, 2025  
**Status**: ACTIVE - Check before EVERY action

---

## ✅ PRE-ACTION CHECKLIST (Use Before Every Edit)

### 1. **Company Name Standard** ✓
- [ ] Using "Tailored Care Solutions" (NEVER "TCS" or "Tailored Care")
- [ ] Check comments, logs, UI text for correct company name

### 2. **Brand Colors** ✓
- [ ] Navy: `#0E1535`, `#1B365D` (backgrounds, text)
- [ ] Gold: `#E3A248`, `#D4A574` (accents)
- [ ] Light Blue: `#E8EDF8` (UI elements)
- [ ] Using CSS variables from `app/globals.css`

### 3. **State Variable Names** ✓
- [ ] In PSWVoiceReporter.js: `report` (NOT `generatedReport`)
- [ ] All useState variables match original: `isListening`, `conversation`, `report`, `showReport`, `darJson`, `showDarJson`, `savedSessions`, `currentSessionId`

### 4. **No Temporary Files** ✓
- [ ] NOT creating `.backup`, `.tmp`, `.old`, `.bak` files
- [ ] Using system temp directories (`/tmp`) if needed
- [ ] Will delete temp files immediately after use

### 5. **PSW Scope Compliance** ✓
- [ ] Documentation is observations only (NOT diagnoses)
- [ ] Using proper PSW language (NOT clinical assessments)
- [ ] Always "Notify supervisor/RN" for concerns
- [ ] No prohibited terms: diagnose, assess, prescribe, treatment plan

### 6. **14 Production Pages Preserved** ✓
- [ ] Not breaking existing pages
- [ ] Changes are additive, not destructive
- [ ] Will run `comprehensive-audit.js` after changes

### 7. **React 19 + Next.js 16 Compatibility** ✓
- [ ] Using correct import syntax
- [ ] Server components marked properly
- [ ] Client components have "use client" directive
- [ ] API routes in correct format

### 8. **Code Quality** ✓
- [ ] Following existing code style
- [ ] Proper error handling with try/catch
- [ ] Logging errors appropriately
- [ ] Adding comments for complex logic

---

## 🎯 CURRENT WORK SESSION

**Session Start**: October 25, 2025  
**Duration**: 4 hours autonomous work  
**Goal**: Complete Phase 1 Week 1-3 implementation  
**User Approval**: FULL AUTONOMOUS ACCESS GRANTED

### Models to Install (No Size Limits):
- ✅ Whisper Small (461MB) - Primary
- ✅ Whisper Medium (1.5GB) - Optional quality
- ✅ Whisper Large-v3 (2.9GB) - Maximum quality
- ✅ Qwen3 14B (8.5GB) - Primary conversational
- ✅ Qwen3 30B (18GB) - Quality tier
- ✅ Qwen3 72B (43GB) - Maximum quality (optional)
- ✅ Coqui XTTS v2 (1.8GB) - Primary TTS
- ✅ bge-m3 (2.2GB) - Embeddings
- ✅ Ollama (required system)

**Total**: ~80GB with all quality tiers (400GB available, 8GB/s internet)

---

## 📝 ACTION LOG (Update After Each Major Task)

### Hour 1: Setup & Core Clients
- [ ] Created AUTONOMOUS_WORK_CHECKLIST.md ✓
- [ ] Created /Volumes/AI/install-all-ai-models.sh
- [ ] Created lib/audio/whisperClient.js
- [ ] Created lib/audio/xttsClient.js
- [ ] Updated lib/ai/ollamaClient.js

### Hour 2: API Routes & Integration
- [ ] Created app/api/transcribe-whisper/route.js
- [ ] Created app/api/synthesize-xtts/route.js
- [ ] Updated components/PSWVoiceReporter.js
- [ ] Created .env.local.example

### Hour 3: Testing & Benchmarking
- [ ] Created tests/unit/whisperClient.test.js
- [ ] Created tests/unit/xttsClient.test.js
- [ ] Created tests/e2e/voice-workflow.spec.ts
- [ ] Created scripts/benchmark-models.js
- [ ] Ran all tests

### Hour 4: Documentation & Validation
- [ ] Created WEEK1_IMPLEMENTATION_SUMMARY.md
- [ ] Created POST_MEETING_INSTRUCTIONS.md
- [ ] Ran comprehensive-audit.js (14/14 check)
- [ ] ESLint validation passed
- [ ] Final guardrails check

---

## 🚨 CRITICAL REMINDERS

1. **Before editing PSWVoiceReporter.js**:
   - Read lines 1-120 to see all state variables
   - Use exact variable names (especially `report`)
   - Preserve existing functionality

2. **Before creating API routes**:
   - Use Next.js 16 App Router conventions
   - Export async POST/GET functions
   - Proper error handling with NextResponse

3. **Before running installation script**:
   - Verify Ollama not already installed
   - Check /Volumes/AI/ directory exists
   - Ensure proper permissions

4. **Before final delivery**:
   - No temp files remaining
   - All imports working
   - ESLint passing
   - 14/14 pages functional

---

## ✅ QUICK VERIFICATION COMMANDS

```bash
# Check for temp files
find . -name "*.backup" -o -name "*.tmp" -o -name "*.old" -o -name "*.bak"

# Validate all pages work
node comprehensive-audit.js

# Check ESLint
npm run lint

# Run tests
npm run test
npm run test:e2e

# Check state variables in PSWVoiceReporter
grep "useState" components/PSWVoiceReporter.js | head -20
```

---

**STATUS**: ✅ CHECKLIST ACTIVE - Reference before every major action
