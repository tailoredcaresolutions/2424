# Cross-Browser Testing Guide - Phase 1 Q3

**Date Created:** October 24, 2025
**Production Folder:** `/Volumes/AI/Psw reporting conversational/`
**Target:** 100% feature parity across all browsers

---

## 1. Browser Coverage

### Desktop Browsers
- ✅ **Chrome** (latest) - Primary target
- ✅ **Edge** (latest) - Chromium-based
- ✅ **Firefox** (latest) - Gecko engine
- ✅ **Safari** (macOS) - WebKit engine

### Mobile Browsers
- ✅ **Safari** (iOS 15+) - WebKit
- ✅ **Chrome** (Android 10+) - Chromium

### Browser Market Share (2025)
- Chrome: ~65%
- Safari: ~20%
- Edge: ~10%
- Firefox: ~5%

---

## 2. Pre-Flight Checklist

### Before Testing
- [ ] Latest browser versions installed
- [ ] Clear cache and cookies
- [ ] Disable all browser extensions (test clean)
- [ ] Set system language to English (Canadian)
- [ ] Note browser version numbers
- [ ] Prepare test account/data

### Test Environment Setup
```bash
# Start development server
cd "/Volumes/AI/Psw reporting conversational"
npm run dev

# Navigate to:
http://localhost:3000
```

### Screen Sizes to Test
- [ ] Desktop: 1920x1080 (Full HD)
- [ ] Laptop: 1366x768 (Common laptop)
- [ ] Tablet: 768x1024 (iPad)
- [ ] Mobile: 375x667 (iPhone SE)
- [ ] Mobile Large: 414x896 (iPhone 11)

---

## 3. Feature Test Matrix

## 3.1 Breathing Avatar Animation

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| Avatar renders | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Idle state (😊) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Gray background |
| Listening state (🎤) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Blue background |
| Speaking state (💬) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Gold background |
| Breathing animation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Smooth scale |
| Pulse-glow animation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | During activity |
| Audio level scaling | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Dynamic size |
| **60fps performance** | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Use DevTools |

**Performance Test:**
```javascript
// Open DevTools > Performance
// Record while avatar is animating
// Check: FPS should be ≥60
```

## 3.2 Typing Indicators

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| Three dots render | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Bounce animation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Staggered |
| Blue dots (AI) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | #1B365D |
| Gold dots (report) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | #D4A574 |
| Smooth animation | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | No jank |

## 3.3 Voice Recording

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| Mic button visible | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Mic permission prompt | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | On first click |
| Recording starts | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Button red |
| Transcript appears | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Live update |
| Recording stops | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Button blue |
| iOS Safari workaround | N/A | N/A | N/A | N/A | ☐ | N/A | Text input |

**Known Issue:** iOS Safari has limited Web Speech API support. App should default to text input.

## 3.4 Keyboard Shortcuts

| Shortcut | Chrome | Firefox | Safari | Edge | Notes |
|----------|--------|---------|--------|------|-------|
| Space: Start recording | ☐ | ☐ | ☐ | ☐ | Hold to record |
| Space: Stop recording | ☐ | ☐ | ☐ | ☐ | Release |
| Escape: Cancel | ☐ | ☐ | ☐ | ☐ | Stops listening |
| Ctrl+Enter: Generate | ☐ | ☐ | ☐ | ☐ | Windows |
| Cmd+Enter: Generate | N/A | N/A | ☐ | N/A | macOS |
| Tab navigation | ☐ | ☐ | ☐ | ☐ | Logical order |
| Focus indicators | ☐ | ☐ | ☐ | ☐ | 2px blue outline |

## 3.5 Turn-Taking Enforcement

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| Counter increments | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | After AI msg |
| Counter resets | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | After user msg |
| "Please respond" (2) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Gold badge |
| "Your turn" (3+) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Gold badge |
| Badge animates | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Pulse effect |

## 3.6 Message Length Limits

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| Messages < 60 words | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Display fully |
| Messages > 60 words | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Truncated |
| "Read more" button | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Appears |
| Expand message | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Full text |
| "Show less" button | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Collapses |
| Smooth transition | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | No jank |

## 3.7 Message Padding & Layout

| Feature | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome | Notes |
|---------|--------|---------|--------|------|---------------|---------------|-------|
| User messages (gold) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Right-aligned |
| AI messages (gray) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Left-aligned |
| Padding: 12px sides | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Correct |
| Padding: 20px top | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Correct |
| Padding: 16px bottom | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | Correct |
| Rounded corners | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | 8px radius |
| Timestamps visible | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | 70% opacity |

---

## 4. CSS Animation Testing

### 4.1 Animation Performance

**Tool:** Browser DevTools > Performance

```javascript
// Test 1: Breathing Animation FPS
1. Click mic button (avatar should pulse)
2. Open DevTools > Performance
3. Click Record
4. Let avatar animate for 5 seconds
5. Stop recording
6. Check FPS graph: Should be ≥60fps

// Test 2: Typing Indicator FPS
1. Send a message
2. While "typing..." appears, open Performance
3. Record for 5 seconds
4. Check FPS graph: Should be ≥60fps
```

### 4.2 Animation Smoothness (Visual)

| Animation | Chrome | Firefox | Safari | Edge | Notes |
|-----------|--------|---------|--------|------|-------|
| Breathing (3s loop) | ☐ | ☐ | ☐ | ☐ | Smooth scale |
| Pulse-glow (1.5s) | ☐ | ☐ | ☐ | ☐ | No stutter |
| Typing bounce (1.4s) | ☐ | ☐ | ☐ | ☐ | Staggered |
| Message expansion | ☐ | ☐ | ☐ | ☐ | Smooth height |
| Scroll behavior | ☐ | ☐ | ☐ | ☐ | Auto-scroll |

---

## 5. Focus & Accessibility Testing

### 5.1 Focus Indicators

| Element | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| Mic button focus | ☐ | ☐ | ☐ | ☐ | 2px blue + shadow |
| Toggle button focus | ☐ | ☐ | ☐ | ☐ | 2px blue + shadow |
| Send button focus | ☐ | ☐ | ☐ | ☐ | 2px blue + shadow |
| Generate button focus | ☐ | ☐ | ☐ | ☐ | 2px gold + shadow |
| New Session focus | ☐ | ☐ | ☐ | ☐ | 2px blue + shadow |
| Read more focus | ☐ | ☐ | ☐ | ☐ | Underline removal |

---

## 6. Responsive Design Testing

### 6.1 Breakpoints

| Screen Size | Layout | Avatar | Messages | Controls | Notes |
|-------------|--------|--------|----------|----------|-------|
| Desktop (1920px) | ☐ | ☐ | ☐ | ☐ | Max width |
| Laptop (1366px) | ☐ | ☐ | ☐ | ☐ | Centered |
| Tablet (768px) | ☐ | ☐ | ☐ | ☐ | Stacked |
| Mobile (375px) | ☐ | ☐ | ☐ | ☐ | Single col |

### 6.2 Mobile-Specific Tests

**Safari iOS:**
- [ ] Touch targets ≥44x44 pixels
- [ ] Mic button: 64x64 pixels ✓
- [ ] No horizontal scroll
- [ ] Pinch-to-zoom works
- [ ] Text input shows iOS keyboard
- [ ] No layout shift on keyboard open

**Chrome Android:**
- [ ] Touch targets ≥48x48 pixels
- [ ] Material Design compliance
- [ ] Back button works
- [ ] No address bar overlap

---

## 7. Error Handling

### 7.1 Network Errors

| Scenario | Chrome | Firefox | Safari | Edge | Expected Behavior |
|----------|--------|---------|--------|------|-------------------|
| Offline mode | ☐ | ☐ | ☐ | ☐ | Error message shown |
| API timeout | ☐ | ☐ | ☐ | ☐ | "Try again" shown |
| 500 error | ☐ | ☐ | ☐ | ☐ | Graceful fallback |

### 7.2 Permission Errors

| Scenario | Chrome | Firefox | Safari | Edge | Expected Behavior |
|----------|--------|---------|--------|------|-------------------|
| Mic denied | ☐ | ☐ | ☐ | ☐ | Show text input |
| Mic unavailable | ☐ | ☐ | ☐ | ☐ | Show text input |

---

## 8. Performance Metrics

### 8.1 Load Time (DevTools > Network)

| Metric | Chrome | Firefox | Safari | Edge | Target |
|--------|--------|---------|--------|------|--------|
| First Contentful Paint | ___ ms | ___ ms | ___ ms | ___ ms | <1500ms |
| Time to Interactive | ___ ms | ___ ms | ___ ms | ___ ms | <3000ms |
| Largest Contentful Paint | ___ ms | ___ ms | ___ ms | ___ ms | <2500ms |

### 8.2 Runtime Performance

| Metric | Chrome | Firefox | Safari | Edge | Target |
|--------|--------|---------|--------|------|--------|
| Animation FPS | ___ fps | ___ fps | ___ fps | ___ fps | ≥60fps |
| Scroll FPS | ___ fps | ___ fps | ___ fps | ___ fps | ≥60fps |
| Memory usage | ___ MB | ___ MB | ___ MB | ___ MB | <100MB |
| CPU usage (idle) | ___ % | ___ % | ___ % | ___ % | <5% |

---

## 9. Known Browser Differences

### Safari (WebKit)
- **Web Speech API:** Limited support on iOS - app defaults to text input ✓
- **Audio autoplay:** May require user interaction first ✓
- **CSS animations:** May need `-webkit-` prefixes (check)

### Firefox (Gecko)
- **Flexbox:** Slightly different behavior - test message alignment
- **Focus outline:** May render differently - verify 2px visible

### Edge (Chromium)
- **Speech Recognition:** Check permissions UI differs from Chrome
- **Smooth scrolling:** May behave differently - test conversation scroll

---

## 10. Bug Tracking Template

**Bug ID:** ___
**Browser:** ___
**Version:** ___
**OS:** ___
**Screen Size:** ___

**Steps to Reproduce:**
1. ___
2. ___
3. ___

**Expected Behavior:** ___
**Actual Behavior:** ___

**Screenshots:** [Attach]

**Severity:** ☐ Critical ☐ High ☐ Medium ☐ Low

**Workaround:** ___

---

## 11. Test Results Summary

**Test Date:** _______________
**Tester:** _______________

| Browser | Version | OS | Pass | Fail | Skip | Score |
|---------|---------|--------|------|------|------|-------|
| Chrome | | | | | | % |
| Firefox | | | | | | % |
| Safari | | | | | | % |
| Edge | | | | | | % |
| Safari iOS | | | | | | % |
| Chrome Android | | | | | | % |

**Overall Status:** ☐ Pass (≥95%) ☐ Needs Work (<95%)

---

## 12. Sign-Off

**Desktop Testing Complete:** ☐ Yes ☐ No
**Mobile Testing Complete:** ☐ Yes ☐ No
**Performance Validated:** ☐ Yes ☐ No
**Accessibility Checked:** ☐ Yes ☐ No

**Approved by:** _______________
**Date:** _______________

---

## Appendix: Browser DevTools Commands

### Chrome DevTools
- **Open:** F12 or Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows)
- **Performance:** DevTools > Performance tab
- **Network:** DevTools > Network tab
- **Accessibility:** DevTools > Lighthouse > Accessibility

### Firefox DevTools
- **Open:** F12 or Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows)
- **Performance:** DevTools > Performance tab
- **Accessibility:** DevTools > Accessibility Inspector

### Safari DevTools
- **Enable:** Safari > Preferences > Advanced > Show Develop menu
- **Open:** Cmd+Option+I
- **Performance:** Develop > Show Web Inspector > Timelines
