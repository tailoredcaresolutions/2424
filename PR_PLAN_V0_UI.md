# PR Plan: Phase 1A v0 UI Generation

**Date**: October 27, 2025  
**Status**: ✅ Generated — Awaiting APPLY CHANGES  
**Model**: v0-1.5-md (OpenAI-compatible)

## Generated Files (5)

| File | Lines | Features |
|------|-------|----------|
| app/splash/page.tsx | 93 | Gold orb, auto-navigate, reduced-motion |
| app/auth/page.tsx | 195 | Glassmorphism, ARIA labels, focus mgmt |
| app/session/page.tsx | 250 | Voice orb, live transcript, quick actions |
| app/review/page.tsx | 202 | ARIA tabs, copy buttons, keyboard shortcuts |
| app/settings/page.tsx | 210 | 6 languages, privacy toggles, a11y controls |

## Quality Metrics

- ✅ Brand colors: 19 references (#1B365D, #D4A574)
- ✅ ARIA attributes: 30 found
- ✅ Keyboard shortcuts: 4 implemented
- ⚠️ ESLint: 8 errors (fixable in 15-20 min)
- ⚠️ A11y toggles need global state wiring (30-45 min)

## Action Required

1. Fix ESLint errors (inline components)
2. Wire up global preferences state
3. Connect auth/API integrations
4. Manual QA + screen reader testing

**Estimated integration time**: 2.5-3.5 hours

## Next Step

Reply **"APPLY CHANGES"** to move files to production paths.

---

## 2025-02-XX Phase 1 Local Audit (Codex)

**Scope**: Validate high-priority routes, note brand/a11y gaps, confirm env hardening + TDZ risks.

### UI Screen Findings

| Page | Brand & Golden Orb | Accessibility | Notes |
|------|--------------------|---------------|-------|
| `app/splash/page.tsx` | ✅ Navy/Gold palette, but animation implemented via custom CSS (no Framer Motion/glassmorphism as spec’d) | ✅ Reduced-motion fallback | Need Framer Motion-powered golden orb + subtle glass layer. |
| `app/auth/page.tsx` | ✅ Gradient Navy/Gold card matches brand | ✅ Semantic labels + alert role | Confirm upstream admin-only routing (route currently public). |
| `app/session/page.tsx` | ✅ Mic orb + Navy/Gold quick actions | ⚠️ Focus management (record button) + aria-live present but no programmatic focus reset | Add managed focus when recording toggles; ensure keyboard shortcut helper stays accessible. |
| `app/review/page.tsx` | ⚠️ Uses slate/neutral palette (off-brand); no orb | ⚠️ Missing Ctrl+E / Ctrl+S shortcuts; copy buttons OK | Re-theme to Navy/Gold glass look; add keyboard handlers + status messaging. |
| `app/settings/page.tsx` | ✅ Brand + required locales & toggles | ⚠️ Toggles only update local state | Wire toggles to persisted/global prefs once store is ready. |

### Environment & Guardrails

- `.env.production.local` already includes all required local-only keys (AUTH_SECRET length 64, Ollama/Whisper paths, `IS_LOCAL_RUNTIME`). **Status: PASS**
- Need follow-up scan to ensure no `NEXT_PUBLIC_*` secrets ship with production values.

### TDZ / Closure Risks (`components/PSWVoiceReporter.js`)

- `useEffect` blocks depend on callbacks (`toggleListening`, `generateReport`, `startConversation`, `handleSpeechInput`) declared later; these must be hoisted + wrapped in `useCallback` with precise dependency arrays to avoid TDZ/stale closures.
- Several effects include callbacks they don’t invoke (e.g., scroll effect listing `handleSpeechInput`), inflating dependency noise; plan to tighten dependencies during Phase 2.

### Next Actions

1. Phase 2 – Refactor `PSWVoiceReporter` callbacks (hoist/memoize) and implement dynamic route/client wrapper/config updates.
2. Prepare v0 prompts for Splash + Review screens once brand/a11y deltas are addressed manually or via DEV-ASSIST.
3. Re-run lint / a11y tooling post-updates to confirm clean slate before build.

---

## 2025-02-XX Phase 3 UI Remediation (Codex)

**Scope**: Apply on-brand Navy/Gold treatments, reinstate golden orb hero, and wire keyboard/a11y interactions for review workflows.

### Implemented

- `app/splash/page.tsx` now renders a Framer Motion powered GOLDEN ORB with glassmorphism shell, honors `prefers-reduced-motion`, and maintains timed redirect to `/auth`.
- `app/review/page.tsx` re-themed to Navy/Gold glass UI with orbit accent, adds inline shortcut legend, and implements keyboard handlers for `Ctrl+E`, `Ctrl+S`, and `Ctrl+Shift+C` alongside aria-live status updates.

### Outstanding / Follow-up

- Run lint/a11y tooling in Phase 4 to confirm no regressions.
- Review page still uses static sample data; wire to generated content when backend ready.
