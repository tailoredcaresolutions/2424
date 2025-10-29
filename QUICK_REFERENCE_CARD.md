# 🎯 QUICK REFERENCE CARD - AI DEVELOPMENT STANDARDS

**For:** PSW Voice Documentation System - Tailored Care Solutions  
**Date:** October 25, 2025  
**Print this:** Keep visible during all development sessions

---

## 🚨 BEFORE ANY CODE CHANGES - CHECK THIS FIRST!

### 1. Read the Guardrails
```bash
# Open this file FIRST every time
open GUARDRAILS.md
```

### 2. State Variable Names (WILL CRASH IF WRONG!)
```javascript
// ✅ CORRECT (components/PSWVoiceReporter.js lines 1-120)
const [report, setReport] = useState('');
const [darJson, setDarJson] = useState(null);
const [conversation, setConversation] = useState([]);

// ❌ WRONG - DOES NOT EXIST
generatedReport  // ❌ ReferenceError!
reportText       // ❌ ReferenceError!
```

### 3. Company Name
```
✅ CORRECT: "Tailored Care Solutions"
❌ WRONG: "TCS" or "Tailored Care"
```

### 4. Brand Colors
```css
--tcs-navy: #0E1535, #1B365D      /* backgrounds */
--tcs-gold: #E3A248, #D4A574      /* accents */
--tcs-champagne: #FFF5E6          /* light backgrounds */
```

---

## 🤖 AI MODELS (PRIMARY TO FALLBACK)

```javascript
// 1. Primary: Ollama (LOCAL, FREE, PRIVATE)
model: 'llama3.3:70b'
url: 'http://localhost:11434'

// 2. Backup: OpenAI (EXTERNAL, PAID)
model: 'gpt-4-turbo-preview'
requires: OPENAI_API_KEY

// 3. Fallback: Mock (DEVELOPMENT)
file: 'lib/mocks/mockAI.js'
triggers: No API key set
```

---

## 🇨🇦 ONTARIO PSW COMPLIANCE (CRITICAL!)

### ✅ PSWs CAN Document:
- Observations (objective only)
- ADLs (bathing, dressing, feeding)
- Vital signs (if measured)
- Client quotes
- Safety concerns

### ❌ PSWs CANNOT Document:
- Diagnoses
- Clinical assessments
- Treatment plans
- Medical advice
- Health predictions

### 🚫 PROHIBITED WORDS:
```
diagnose, diagnosis, assess, assessment, 
prescribe, treatment plan, prognosis
```

### ✅ REQUIRED PATTERN:
```
"Blood pressure measured at 160/95 mmHg. Notify supervisor/RN."
                    ↑                              ↑
              Observation                    Escalation
```

---

## 🗂️ CRITICAL FILES (NEVER BREAK!)

```
1. components/PSWVoiceReporter.js (1,850 lines) - Main component
2. app/api/generate-ai-report/route.js (367 lines) - Report generation
3. app/api/process-conversation-ai/route.js (397 lines) - Conversation
4. lib/mocks/mockAI.js (282 lines) - Development fallback
5. app/globals.css (500+ lines) - All brand colors & animations
6. comprehensive-audit.js (200+ lines) - Page validation
```

---

## ✅ TESTING COMMANDS (RUN AFTER CHANGES!)

```bash
# 1. Comprehensive audit (MUST PASS 14/14)
node comprehensive-audit.js

# 2. Unit tests
npm run test

# 3. E2E tests
npm run test:e2e

# 4. All tests
npm run test:all

# 5. Lint
npm run lint
```

---

## 🎨 VISUAL DESIGN STANDARDS

### Golden Orb States:
```
Idle:       Breathe 3s, opacity 0.8, no sparkles
Listening:  Scale 1.0-1.15, audio-reactive, 50 sparkles
Processing: Pulse 2s, rotating shimmer
Speaking:   Waveform sync, TTS audio-reactive
```

### Animation Targets:
```
FPS:                60fps (stable)
Audio Latency:      <16ms per frame
State Transition:   300ms
Audio Response:     50ms
```

### Color Gradients:
```css
Gold Orb: #F1A852 → #E3A248 → #D4A574 → #C9822D
Background: #FFF5E6 (champagne) → #FFF9F1 (ivory)
```

---

## 🔐 SECURITY (3 CRITICAL FIXES NEEDED!)

### 1. Change Default Keys (2 hours)
```bash
# Generate
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.production
DATABASE_ENCRYPTION_KEY=<64_char_key>
SESSION_SECRET=<64_char_key>
JWT_SECRET=<64_char_key>
```

### 2. Replace console.log (4 hours)
```bash
# Find all instances (50+ files)
grep -r "console\.(log|error|warn)" app/ components/ lib/

# Replace with logger
import { logger } from '@/lib/logging/logger';
logger.info('message', { data });
```

### 3. Enable Security Headers (2 hours)
```javascript
// next.config.js
headers: [
  { key: 'Content-Security-Policy', value: strictCSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' }
]
```

---

## 📊 SUCCESS METRICS (10/10 TARGET)

```
Current Grade:         9.5/10
Target Grade:          10/10

Performance:
  Lighthouse:          >95
  LCP:                 <2.5s
  FID:                 <100ms
  CLS:                 <0.1
  INP:                 <200ms
  FPS:                 60fps stable
  Bundle Size:         <200KB gzipped

Compliance:
  PHIPA:               ✅ Ready (pending key change)
  Audit Logs:          7-year retention
  Encryption:          AES-256-GCM
  TLS:                 1.3 minimum

Testing:
  E2E Coverage:        >90%
  Unit Coverage:       >80%
  Load Test:           500 concurrent users
  Error Rate:          <0.1%

User Experience:
  WCAG:                2.2 AAA
  Satisfaction:        >85%
  Task Completion:     >90%
```

---

## 🚀 QUICK START WORKFLOW

### Every Development Session:
```bash
# 1. READ GUARDRAILS
open GUARDRAILS.md

# 2. CHECK CURRENT STATE
npm run dev
open http://localhost:3000

# 3. MAKE CHANGES
# (refer to GUARDRAILS.md for standards)

# 4. VERIFY ALL PAGES WORK
node comprehensive-audit.js

# 5. RUN TESTS
npm run test:all

# 6. CHECK ERRORS
npm run lint
```

---

## 📚 DOCUMENT HIERARCHY

```
1. GUARDRAILS.md (READ FIRST - ALWAYS!)
   └─ Rules of engagement, standards, compliance

2. LATEST_BEST_PRACTICES_OCT_2025.md
   └─ Technical standards, iOS 18+, React 19, Next.js 16

3. PHASED_IMPLEMENTATION_PLAN.md
   └─ 4-phase roadmap (8-12 weeks)

4. VISUAL_DESIGN_SPECIFICATION.md
   └─ Golden orb specs, ChatGPT-inspired UI

5. PROJECT_CONTEXT.md (497 lines)
   └─ Complete technical documentation

6. START_HERE.md (247 lines)
   └─ Human quick start guide
```

---

## ❓ DECISION TREE

```
Question about state variables?
  → Check lines 1-120 of PSWVoiceReporter.js

Question about brand colors?
  → Check app/globals.css CSS variables

Question about Ontario PSW scope?
  → Observation → "Notify supervisor/RN"

Question about AI models?
  → Primary: Ollama llama3.3:70b (local)
  → Backup: OpenAI GPT-4 Turbo
  → Fallback: Mock AI

Still unsure?
  → ❌ DO NOT INVENT OR ASSUME
  → ✅ ASK THE USER FOR CLARIFICATION
```

---

## 🎯 IMMEDIATE NEXT STEPS

### Phase 1: Security (DO FIRST!)
1. Change encryption keys (2h)
2. Replace console.log (4h)
3. Enable security headers (2h)

### Phase 2: Audio Visuals (Week 3-5)
1. Web Audio API integration
2. Audio-reactive orb (60fps)
3. Waveform visualization

### Phase 3: Conversational UI (Week 6-8)
1. Message streaming (SSE)
2. Typing indicators
3. Accessibility

### Phase 4: Production Launch (Week 9-12)
1. Performance optimization
2. Comprehensive testing
3. Staged rollout

---

## ⚠️ WHEN IN DOUBT

```
1. Read GUARDRAILS.md first
2. Check PROJECT_CONTEXT.md for details
3. Search codebase with grep
4. Run comprehensive-audit.js
5. If still unsure → ASK USER (never invent!)
```

---

## 📞 EMERGENCY CONTACTS

```
Technical Issues:       Check PROJECT_CONTEXT.md
Compliance Questions:   Check GUARDRAILS.md (PHIPA section)
Design Questions:       Check VISUAL_DESIGN_SPECIFICATION.md
Implementation Steps:   Check PHASED_IMPLEMENTATION_PLAN.md
```

---

## ✅ PRE-PRODUCTION CHECKLIST

```
Security:
  [ ] Encryption keys changed
  [ ] console.log replaced with logger
  [ ] Security headers enabled
  [ ] All 14 pages pass audit

Performance:
  [ ] Lighthouse >95
  [ ] Bundle <200KB
  [ ] 60fps animations
  [ ] Redis caching operational

Compliance:
  [ ] PHIPA verified
  [ ] Audit logs working
  [ ] Encryption tested
  [ ] Privacy policy published

Testing:
  [ ] E2E coverage >90%
  [ ] Load test passed (500 users)
  [ ] All tests passing
  [ ] Error rate <0.1%
```

---

**REMEMBER:** This project is 9.5/10 complete. We're aiming for 10/10 production-ready with flawless ChatGPT-inspired conversational UI.

**Current Status:** Ready for Phase 1 security hardening  
**Next Action:** Change default encryption keys

**Mantra:** Check GUARDRAILS.md first. Never invent. Always verify. Ask user if unsure.

---

**Print this card and keep it visible during development! 📌**
