# Accessibility Audit Checklist - Phase 1 Q3

**Target:** WCAG 2.1 Level AA (70%+ compliance)
**Date Created:** October 24, 2025
**Production Folder:** `/Volumes/AI/Psw reporting conversational/`

---

## 1. Automated Testing Tools

### 1.1 Axe DevTools Browser Extension

- [ ] Install: [Chrome](https://chrome.google.com/webstore) or [Firefox](https://addons.mozilla.org)
- [ ] Run scan on main page (/)
- [ ] Run scan on voice reporter interface
- [ ] Document critical issues (0 target)
- [ ] Document serious issues (<3 target)
- [ ] Generate PDF report

### 1.2 Lighthouse Accessibility Score

- [ ] Open Chrome DevTools > Lighthouse
- [ ] Select "Accessibility" category
- [ ] Run audit on main page
- [ ] **Target Score: 90+**
- [ ] Document any issues below 90

### 1.3 WAVE (Web Accessibility Evaluation Tool)

- [ ] Install extension or use https://wave.webaim.org
- [ ] Check for errors (0 target)
- [ ] Check for contrast errors (0 target)
- [ ] Check for alerts (review each)

---

## 2. Manual Screen Reader Testing

### 2.1 VoiceOver (macOS)

**Activation:** Cmd + F5

**Test Cases:**

- [ ] **Breathing Avatar**
  - Avatar state announced correctly ("Listening", "Speaking", "Ready")
  - Emoji has appropriate aria-label
  - State changes are announced

- [ ] **Button Labels**
  - [ ] Mic button: "Start voice recording" or "Stop recording"
  - [ ] Toggle button: "Switch to voice input" or "Switch to text input"
  - [ ] Send button: "Send message"
  - [ ] Generate Report: "Generate documentation report"
  - [ ] New Session: "Start new documentation session"

- [ ] **Conversation Flow**
  - [ ] New messages announced as they arrive
  - [ ] role="log" on conversation container working
  - [ ] aria-live="polite" prevents interruption of reading
  - [ ] Typing indicators announced appropriately

- [ ] **Turn-Taking Indicator**
  - [ ] "Your turn" badge announced when appearing
  - [ ] Badge content is readable

### 2.2 NVDA (Windows)

**Activation:** Ctrl + Alt + N (if installed)

Same test cases as VoiceOver above.

---

## 3. Keyboard Navigation Testing

### 3.1 Tab Order

- [ ] Tab through all interactive elements
- [ ] Order is logical (top-to-bottom, left-to-right)
- [ ] Focus visible on ALL elements (2px blue outline + 4px shadow)
- [ ] No focus traps (can tab out of everything)
- [ ] Skip links provided (if applicable)

### 3.2 Keyboard Shortcuts

- [ ] **Space bar**: Starts recording (when not in text input)
- [ ] **Space bar hold**: Keeps recording (push-to-talk)
- [ ] **Space bar release**: Stops recording
- [ ] **Escape**: Cancels operation (listening/report)
- [ ] **Ctrl/Cmd + Enter**: Generates report (when available)
- [ ] No conflicts with browser shortcuts

### 3.3 Focus Indicators

- [ ] All buttons have visible focus (2px solid outline)
- [ ] Focus indicators have proper contrast (3:1 minimum)
- [ ] Gold variant visible on primary buttons
- [ ] Shadow ring (4px) provides additional visibility

---

## 4. Color Contrast Testing

### 4.1 Text Contrast

**Tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- [ ] **Primary Blue (#1B365D) on White**: \_\_:1 (target: ≥4.5:1)
- [ ] **Primary Gold (#D4A574) on White**: \_\_:1 (target: ≥4.5:1)
- [ ] **White text on Primary Blue**: \_\_:1 (target: ≥4.5:1)
- [ ] **White text on Primary Gold**: \_\_:1 (target: ≥4.5:1)
- [ ] **Gray text (timestamps)**: \_\_:1 (target: ≥4.5:1)
- [ ] **Link colors**: \_\_:1 (target: ≥4.5:1)

### 4.2 UI Component Contrast

- [ ] Focus indicators vs. background (3:1 minimum)
- [ ] Button borders vs. background (3:1 minimum)
- [ ] Icon colors (if any) vs. background
- [ ] Disabled state has sufficient opacity difference

---

## 5. Semantic HTML Testing

### 5.1 Heading Structure

- [ ] Page has h1 (only one)
- [ ] Headings in logical order (no skipped levels)
- [ ] Heading hierarchy makes sense

### 5.2 Landmark Regions

- [ ] `<main>` region present
- [ ] `<nav>` for navigation (if applicable)
- [ ] `<header>` and `<footer>` (if applicable)
- [ ] All content contained in landmarks

### 5.3 Lists and Structure

- [ ] Conversation messages in semantic structure
- [ ] role="log" on conversation container ✓ (implemented)
- [ ] Proper use of `<button>` vs `<div>` for interactive elements

---

## 6. ARIA Implementation Review

### 6.1 ARIA Attributes Implemented ✓

- [x] `aria-label` on all buttons (5 buttons)
- [x] `role="log"` on conversation container
- [x] `aria-live="polite"` for message updates
- [x] `aria-atomic="false"` for incremental updates
- [x] `aria-relevant="additions"` for new messages only
- [x] `role="img"` and `aria-label` on emoji avatar

### 6.2 ARIA Best Practices Check

- [ ] No conflicting roles (e.g., role="button" on `<button>`)
- [ ] aria-label not empty strings
- [ ] Dynamic content properly announced
- [ ] No hidden content that should be visible
- [ ] Form inputs have associated labels

---

## 7. Animation & Motion

### 7.1 Reduced Motion Support

**Test:** System Settings > Accessibility > Display > Reduce motion

- [ ] Breathing animation respects `prefers-reduced-motion`
- [ ] Typing indicator respects `prefers-reduced-motion`
- [ ] Transition animations can be disabled
- [ ] No parallax or distracting motion

### 7.2 Animation Performance

- [ ] Breathing animation runs at 60fps
- [ ] Typing indicator runs at 60fps
- [ ] No jank when new messages appear
- [ ] Smooth scrolling in conversation

---

## 8. Mobile Accessibility

### 8.1 Touch Targets

- [ ] All buttons ≥44x44 pixels (iOS) or ≥48x48 (Android)
- [ ] Mic button: 64x64 pixels ✓
- [ ] Adequate spacing between touch targets (≥8px)

### 8.2 Mobile Screen Reader

- [ ] TalkBack (Android) announces elements correctly
- [ ] VoiceOver (iOS) announces elements correctly
- [ ] Swipe gestures navigate properly

---

## 9. Forms and Inputs

### 9.1 Text Input Field

- [ ] Has associated `<label>` or aria-label
- [ ] Placeholder not sole indication of purpose
- [ ] Error messages associated with input (aria-describedby)
- [ ] Required fields indicated (aria-required)

### 9.2 Language Selector

- [ ] Dropdown has accessible name
- [ ] Selected value announced
- [ ] Can be operated with keyboard

---

## 10. Error Handling & Feedback

### 10.1 Error Messages

- [ ] Error messages are descriptive
- [ ] Errors announced to screen readers
- [ ] Errors don't rely solely on color
- [ ] Error recovery guidance provided

### 10.2 Success Feedback

- [ ] Success states announced
- [ ] "Report generated" announced
- [ ] Status messages use aria-live

---

## Scoring Guide

### Critical Issues (0 target)

- Blocks screen reader users
- Keyboard-only users cannot complete task
- Color contrast below 3:1 for large text or 4.5:1 for normal text

### Serious Issues (<3 target)

- Makes task significantly harder
- Inconsistent keyboard navigation
- Missing alt text or labels

### Moderate Issues (<5 target)

- Minor usability impact
- Non-critical missing ARIA
- Slightly low contrast (still above minimums)

---

## Compliance Calculation

**Formula:**
Compliance % = (Total Tests - Failed Tests) / Total Tests × 100

**Target:** ≥70% WCAG 2.1 Level AA compliance

---

## Results Summary

**Audit Date:** ******\_******
**Auditor:** ******\_******
**Tool Used:** ******\_******

| Category            | Pass | Fail | N/A | Score     |
| ------------------- | ---- | ---- | --- | --------- |
| Automated Tools     |      |      |     |           |
| Screen Reader       |      |      |     |           |
| Keyboard Navigation |      |      |     |           |
| Color Contrast      |      |      |     |           |
| Semantic HTML       |      |      |     |           |
| ARIA Implementation |      |      |     |           |
| Animation           |      |      |     |           |
| Mobile              |      |      |     |           |
| Forms               |      |      |     |           |
| Error Handling      |      |      |     |           |
| **TOTAL**           |      |      |     | **\_\_%** |

**Overall Status:** ☐ Pass (≥70%) ☐ Needs Work (<70%)

---

## Issues Found

### Critical

1. ***
2. ***

### Serious

1. ***
2. ***

### Moderate

1. ***
2. ***

---

## Recommendations

1. ***
2. ***
3. ***

---

## Next Steps

- [ ] Fix critical issues immediately
- [ ] Address serious issues in next sprint
- [ ] Document moderate issues for future improvement
- [ ] Re-audit after fixes
- [ ] Update WCAG compliance documentation
