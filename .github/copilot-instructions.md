# PSW Voice Documentation System - AI Agent Instructions

## Project Overview
Healthcare documentation system for Ontario Personal Support Workers (PSWs). Converts voice/text input into professional reports and structured DAR (Data-Action-Response) JSON following Ontario PSW standards. Built with Next.js 16 + React 19 + TypeScript + OpenAI API.

**Status**: Production-ready (95% complete) | **Grade**: 9.5/10 | **14 pages**: All functional  
**Company**: Tailored Care Solutions (never abbreviate to "TCS")  
**Dev Server**: `http://localhost:3000` | **Local Mode**: Works without OpenAI API (uses mocks)  
**Visual Identity**: Golden orb/sphere with elegant gold (#E3A248, #D4A574) on navy (#0E1535, #1B365D)

## Critical Architecture Patterns

### State Management (WILL CRASH IF WRONG)
The main component `components/PSWVoiceReporter.js` (1,850 lines) uses specific state variable names:
- ✅ **CORRECT**: `const [report, setReport] = useState('')`
- ❌ **WRONG**: `generatedReport` does not exist - using it causes `ReferenceError`

All state variables in PSWVoiceReporter.js:
```javascript
const [isListening, setIsListening] = useState(false);
const [conversation, setConversation] = useState([]);
const [report, setReport] = useState('');  // "report" NOT "generatedReport"
const [showReport, setShowReport] = useState(false);
const [darJson, setDarJson] = useState(null);
const [showDarJson, setShowDarJson] = useState(false);
const [savedSessions, setSavedSessions] = useState([]);
const [currentSessionId, setCurrentSessionId] = useState(null);
```

### Brand Standards (NEVER DEVIATE)
Colors are hardcoded throughout codebase - maintain consistency:
```javascript
// Primary colors (use everywhere)
const brandColors = {
  blue: '#0E1535',     // Navy (backgrounds)
  gold: '#E3A248',     // Gold (accents)
  lightBlue: '#E8EDF8' // Light blue (UI elements)
};
```
Alternative values in use: `#1B365D` (navy), `#D4A574` (gold). Check `app/globals.css` CSS variables (`--tcs-navy`, `--tcs-gold`) and `components/PSWVoiceReporter.js` brandColors object.

### API Architecture
Two main endpoints handle all AI interactions:

**1. `/app/api/process-conversation-ai/route.js`** - Interactive conversation
- Request: `{input, context, shiftData, conversation, language}`
- Response: `{response, emotion, extractedData}`
- Falls back to `lib/mocks/mockAI.js` in local mode (no API key)

**2. `/app/api/generate-ai-report/route.js`** (367 lines) - Final report generation
- Generates both paragraph report AND DAR JSON
- Validates DAR JSON against schema using AJV (`ajv` package)
- Schema defined in route file (lines 8-91)
- Falls back to `mockGenerateReport()` in local mode

### Local Development Mode
System auto-detects missing OpenAI API key and uses mock responses:
```javascript
// lib/mocks/mockAI.js exports:
export const isLocalMode = !process.env.OPENAI_API_KEY;
export function mockProcessConversation(input, context) { /* realistic responses */ }
export function mockGenerateReport(shiftData, conversation) { /* paragraph + DAR */ }
```

## Ontario PSW Compliance (CRITICAL)

PSWs document **observations only** - they cannot perform clinical assessments.

**✅ PSWs CAN document**: Observations (objective), ADLs (bathing, dressing, feeding), vital signs (if observed), medication taken (observed only), client quotes, safety concerns

**❌ PSWs CANNOT document**: Medical diagnoses, clinical assessments, treatment plans, medical advice, predictions about health

**Prohibited terms**: diagnose, diagnosis, assess, assessment, prescribe, treatment plan

**Required pattern**: For concerns, always write: "Notify supervisor/RN"

DAR JSON structure enforces this - see schema in `app/api/generate-ai-report/route.js` lines 8-91.

## Development Workflow

### Running the App
```bash
npm run dev          # Starts on localhost:3000 with Turbopack (Next.js 16)
npm run build        # Production build
npm start            # Production server
```

### Testing Strategy
```bash
npm run test         # Vitest unit tests (tests/unit/**)
npm run test:e2e     # Playwright e2e tests (tests/e2e/**)
npm test:all         # Run both unit + e2e tests

# Comprehensive page audit (custom script)
node comprehensive-audit.js   # Tests all 14 pages, checks branding, CSS, errors
```

The `comprehensive-audit.js` script validates:
- All 14 pages return 200 OK
- Brand colors present (`#1B365D`, `#D4A574`)
- No React errors (ReferenceError, TypeError, digest errors)
- Tailwind CSS loaded and classes present
- "Tailored Care" branding visible

### Auto-Save System (Phase 2 Q2)
Conversation state auto-saves to LocalStorage with 500ms debounce:
```javascript
// components/PSWVoiceReporter.js (lines 25-94)
const STORAGE_KEY = 'psw_saved_sessions';
const SESSION_EXPIRY_DAYS = 30;

// Functions: saveSessionToLocalStorage, loadSessionsFromLocalStorage, 
// deleteSessionFromLocalStorage, saveCurrentSession, loadCurrentSession
```

Sessions expire after 30 days. Resume prompt appears on page load if incomplete session exists.

## Key Directories & Files

```
app/
  ├── page.tsx                          # Main PSW voice interface
  ├── demo-dar/page.tsx                 # Interactive DAR demo (read-only example)
  ├── test-clean/page.tsx               # Cache-proof API test page
  ├── api/
  │   ├── process-conversation-ai/route.js   # Conversation processing
  │   └── generate-ai-report/route.js        # Report + DAR JSON generation
  ├── layout.tsx                        # Root layout (metadata, viewport)
  └── globals.css                       # Global styles + custom animations

components/
  ├── PSWVoiceReporter.js               # ⭐ MAIN COMPONENT (1,850 lines)
  ├── GoldOrb3D.js                      # 3D breathing avatar animation
  └── DARCard.tsx                       # Reusable DAR display component

lib/
  ├── mocks/mockAI.js                   # Local mode responses (no API needed)
  ├── supabase.js                       # Supabase client setup
  └── database/                         # SQLite connection pool + encryption

PROJECT_CONTEXT.md                      # 500+ lines comprehensive documentation
AI_ASSISTANT_GUIDE.md                   # Quick reference for AI agents
START_HERE.md                           # Human-readable quick start
```

## Common Gotchas

1. **Caching Issues**: Pages may show unstyled in browser cache. Test page at `/test-clean` has zero cache issues (inline styles).

2. **State Variable Names**: Always verify variable names before editing `PSWVoiceReporter.js`. Reading lines 1-120 shows all useState declarations.

3. **Brand Colors**: Multiple color schemes exist (original vs updated). Check both `globals.css` and component files for consistency.

4. **DAR JSON Validation**: Changes to DAR structure require updating schema in `generate-ai-report/route.js` AND testing with AJV validator.

5. **API Fallbacks**: OpenAI API calls auto-fallback to mocks. Test both modes: with/without `OPENAI_API_KEY` in `.env.local`.

6. **14 Pages Must Work**: Any changes must preserve all 14 production pages. Run `node comprehensive-audit.js` after edits.

## Next.js 16 Features in Use

- **Turbopack**: Stable in Next.js 16, enabled via `--turbopack` flag in dev script
- **React Compiler**: Automatic memoization enabled (`reactCompiler: true` in `next.config.js`)
- **App Router**: All pages use App Router conventions (`app/` directory)
- **API Routes**: Route handlers in `app/api/*/route.js` format

## Environment Variables

```bash
# .env.local (optional - works without)
OPENAI_API_KEY=sk-...                        # Optional (mocks if missing)
NEXT_PUBLIC_SUPABASE_URL=https://...         # For production database
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...         # For production database
```

System gracefully handles missing variables - logs warnings but continues with local mode.

## Visual Design System

### Golden Orb Animation
The `GoldOrb3D.js` component displays a breathing, glowing golden sphere that represents AI listening/processing:
- **Idle**: Gentle breathe animation (3s cycle)
- **Active**: Pulse-glow effect when user speaks
- **Processing**: Enhanced glow with particle effects

### UI Component Patterns
```javascript
// Button styles (from globals.css)
.btn-primary    // Navy gradient with shadow, scales on hover
.btn-secondary  // Gold gradient, navy text, scales on hover

// Card styles
.card-premium   // White gradient with subtle shadow, lifts on hover

// Animations (all defined in globals.css)
.animate-breathe        // 3s ease-in-out infinite
.animate-pulse-glow     // 2s ease-in-out infinite  
.animate-typing-bounce  // 1.4s for "AI is typing"
.animate-slide-up       // 0.5s entrance
.animate-fade-in        // 0.6s soft entrance
```

### Color System Hierarchy
```javascript
// From app/globals.css CSS variables
--tcs-navy: #030817          // Darkest navy (primary backgrounds)
--tcs-midnight: #070f21       // Mid-dark navy
--tcs-midnight-soft: #0d1830  // Lighter navy
--tcs-gold: #F1A852           // Primary gold
--tcs-light-gold: #FCE3BA     // Light gold accents
--tcs-deep-gold: #C9822D      // Dark gold
--tcs-champagne: #FFF5E6      // Light backgrounds
--tcs-ivory: #FFF9F1          // Lighter backgrounds
--tcs-sand: #F5E3CB           // Sand tones
```

## Development Workflow Deep Dive

### Before Making ANY Changes
```bash
# 1. Read the main component structure first
head -120 components/PSWVoiceReporter.js  # See all state variables

# 2. Check current functionality
npm run dev  # Start dev server
open http://localhost:3000  # Test in browser

# 3. After changes, verify ALL pages work
node comprehensive-audit.js  # Must show 14/14 passing
```

### Testing Strategy by Component

**Unit Tests (Vitest)**:
```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # Coverage report
```
Located in `tests/unit/` - covers utilities, API routes, validation logic.

**E2E Tests (Playwright)**:
```bash
npm run test:e2e          # Headless
npm run test:e2e:ui       # Interactive UI
```
Located in `tests/e2e/` - covers user flows, voice interaction, report generation.

**Comprehensive Audit**:
The `comprehensive-audit.js` script is critical - it validates:
1. HTTP 200 on all 14 pages
2. No React errors (ReferenceError, TypeError, digest errors)
3. CSS loaded and Tailwind classes present
4. Brand colors visible in HTML (`#1B365D`, `#D4A574`)
5. "Tailored Care" branding text present
6. Key features accessible (buttons, forms, etc.)

### Debugging Common Issues

**Problem**: Pages show unstyled (plain text/MS-DOS style)  
**Cause**: Browser cache showing old files  
**Fix**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) or test at `/test-clean`

**Problem**: `ReferenceError: generatedReport is not defined`  
**Cause**: Using wrong state variable name  
**Fix**: Always use `report`, never `generatedReport`. Check lines 1-120 of PSWVoiceReporter.js

**Problem**: API returns errors in local mode  
**Cause**: Missing OPENAI_API_KEY  
**Fix**: This is expected! System auto-falls back to `lib/mocks/mockAI.js` - verify `isLocalMode` is true

**Problem**: DAR JSON validation fails  
**Cause**: Schema mismatch in response  
**Fix**: Check schema in `app/api/generate-ai-report/route.js` lines 8-91, test with AJV

## Architecture Deep Dive

### Data Flow: Voice Input → Report Generation

1. **User Input** → `PSWVoiceReporter.js` captures voice/text
2. **Process Message** → Calls `/api/process-conversation-ai`
   - Sends: `{input, context, shiftData, conversation, language}`
   - Receives: `{response, emotion, extractedData}`
   - Falls back to `mockProcessConversation()` if no API key
3. **Extract Data** → AI extracts structured info from conversation:
   ```javascript
   extractedData: {
     client_name: "Margaret Smith",
     observations: ["Alert", "Dry skin on legs"],
     care_activities: ["Assisted with shower"],
     client_responses: ["Thanked PSW"]
   }
   ```
4. **Generate Report** → User clicks "Generate Report"
   - Calls `/api/generate-ai-report` with full conversation history
   - Returns BOTH paragraph report AND DAR JSON
   - Validates DAR against schema with AJV
5. **Display** → Shows report with progressive disclosure (collapsible sections)
   - Auto-save to LocalStorage every 500ms (debounced)
   - Sessions expire after 30 days

### LocalStorage Auto-Save Architecture

```javascript
// Triggered on every state change (500ms debounced)
const saveCurrentSession = (conversation, report, reportSections) => {
  localStorage.setItem('psw_current_session', JSON.stringify({
    conversation,
    report, 
    reportSections,
    savedAt: new Date().toISOString()
  }));
};

// On page load, check for incomplete session
useEffect(() => {
  const session = loadCurrentSession();
  if (session && session.conversation.length > 0) {
    setShowResumePrompt(true);  // Ask user to resume
  }
}, []);
```

Sessions are separate from saved sessions - current session is temporary working state, saved sessions are user-initiated bookmarks.

### Ontario PSW Scope Implementation

The system enforces PSW scope at multiple levels:

1. **AI Prompts**: System prompts explicitly instruct to avoid clinical language
2. **DAR Schema**: JSON schema requires observation-only language
3. **Validation**: AJV validator rejects non-compliant responses
4. **Fallback**: If AI returns diagnosis/assessment, system reformats to observations

Example transformation:
```javascript
// ❌ WRONG (clinical assessment)
"Client appears to have hypertension"

// ✅ CORRECT (observation + escalation)
"Blood pressure measured at 160/95 mmHg. Notify supervisor/RN."
```

## API Endpoints Reference

### `/api/process-conversation-ai/route.js`
**Purpose**: Interactive AI conversation during documentation

**Request Schema**:
```typescript
{
  input: string;           // User's message
  context: string;         // "conversation" | "clarification"
  shiftData: {            // Current extracted data
    client_name?: string;
    psw_name?: string;
    observations?: string[];
    care_activities?: string[];
    client_responses?: string[];
    languages_used?: string[];
  };
  conversation: Array<{   // Full conversation history
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  language: string;       // "en-CA" | "es" | "fil" | "pt" | "hi" | "bo"
}
```

**Response Schema**:
```typescript
{
  response: string;       // AI's reply to user
  emotion: "supportive" | "clarifying" | "encouraging";
  extractedData: {        // Structured data pulled from conversation
    client_name?: string;
    observations?: string[];
    care_activities?: string[];
    // ... etc
  };
  language: string;       // Detected language
  confidence: number;     // 0-1 confidence score
}
```

### `/api/generate-ai-report/route.js`
**Purpose**: Generate final paragraph report + DAR JSON

**Request Schema**:
```typescript
{
  shiftData: {
    client_name: string;
    psw_name?: string;
    shift_date?: string;
    shift_time?: string;
    observations?: string[];
    care_activities?: string[];
    client_responses?: string[];
    communications?: string[];
    languages_used?: string[];
  };
  conversation: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}
```

**Response Schema**:
```typescript
{
  report: string;         // Professional paragraph report
  darJson: {             // Structured DAR JSON (see schema lines 8-91)
    client_name: string;
    date_time: string;   // ISO 8601
    language: string;
    DAR: {
      Data: string;      // Observations
      Action: string;    // Care provided  
      Response: string;  // Client response
    };
    adls: { /* ... */ };
    observations: { /* ... */ };
    follow_up: {
      notify_supervisor_RN: boolean;
      reason?: string;
    };
    // ... full schema in route file
  };
  validation: {
    isValid: boolean;
    errors?: string[];   // AJV validation errors if any
  };
}
```

## Multi-Language Support

System supports 6 languages with automatic detection:
- **English (Canadian)**: `en-CA` (default)
- **Filipino (Tagalog)**: `fil`
- **Spanish**: `es`
- **Portuguese**: `pt`
- **Hindi**: `hi`
- **Tibetan**: `bo`

Language detection happens in `process-conversation-ai` route via input analysis. AI responds in detected language. Reports default to English but include language metadata.

## Mobile & Responsive Considerations

- **Voice Input**: Uses Web Speech API (Chrome/Safari support)
- **Touch Targets**: All buttons minimum 44x44px for accessibility
- **Responsive Breakpoints**: Tailwind default (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Mobile Navigation**: Hamburger menu pattern (check `components/Navigation.tsx`)

## Security & Compliance Notes

- **HIPAA 2025**: Client names and health data handled with care
- **Encryption**: SQLite database uses `better-sqlite3-multiple-ciphers` with argon2
- **Rate Limiting**: `next-rate-limit` on API routes
- **Audit Logs**: Admin can view all actions (`/admin/audit-logs`)
- **MFA Support**: Two-factor authentication available (`/settings/mfa`)

## Performance Optimizations

- **React Compiler**: Enabled (`reactCompiler: true` in next.config.js) - automatic memoization
- **Turbopack**: Stable in Next.js 16, used in dev mode
- **Code Splitting**: Next.js automatic per-route
- **Monitoring**: Performance metrics tracked (`/admin/monitoring`)

## Reference Documentation

Read these files for complete context:
- **PROJECT_CONTEXT.md** - Full technical documentation (497 lines)
- **AI_ASSISTANT_GUIDE.md** - Quick reference for AI tools (256 lines)
- **START_HERE.md** - Human quick start guide (247 lines)

These files are authoritative and regularly updated. When in doubt, read PROJECT_CONTEXT.md first.

## Quick Command Reference

```bash
# Development
npm run dev              # Start with Turbopack on :3000
npm run build            # Production build
npm start                # Production server

# Testing
npm test                 # Vitest unit tests (watch)
npm run test:run         # Vitest single run
npm run test:e2e         # Playwright e2e tests
npm run test:all         # All tests (unit + e2e)
node comprehensive-audit.js  # Validate all 14 pages

# Debugging
npm run lint             # ESLint check
npm run test:coverage    # Coverage report
npm run test:e2e:ui      # Playwright interactive mode
```

## Critical Files to Never Break

These files are interconnected - changes ripple:
1. `components/PSWVoiceReporter.js` (1,850 lines) - main component, all state
2. `app/api/generate-ai-report/route.js` (367 lines) - report generation + DAR schema
3. `app/api/process-conversation-ai/route.js` - conversation processing
4. `lib/mocks/mockAI.js` - local mode fallbacks
5. `app/globals.css` - all animations and brand colors
6. `comprehensive-audit.js` - validation script

Always test with `node comprehensive-audit.js` after editing any of these.
