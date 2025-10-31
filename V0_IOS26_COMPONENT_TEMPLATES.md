# V0 Component Generation - iOS 26 Liquid Glass Templates

## Usage

```bash
v0 add <component-id> --prompt "<template>"
```

---

## Template Library

### 1. Liquid Glass Card

```prompt
Create a React component with iOS 26 liquid glass effect:

REQUIREMENTS (STRICT):
- backdrop-filter: blur(24px) saturate(180%)
- -webkit-backdrop-filter: blur(24px) saturate(180%)
- background: rgba(27, 54, 93, 0.6)
- border: 1px solid rgba(75, 111, 165, 0.3)
- border-radius: 24px
- box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)

Color Palette (ONLY):
- Blue Primary: #1B365D
- Blue Light: #4A6FA5
- Gold: #D4A574
- Gold Light: #E3B888

Typography:
- Font: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui
- Font smoothing: antialiased

Touch Targets:
- Minimum 44px × 44px
- Spacing: 8px grid system

Component should accept children and optional title prop.
```

### 2. Liquid Glass Button

```prompt
Create a React button component with iOS 26 liquid glass effect:

REQUIREMENTS (STRICT):
- backdrop-filter: blur(20px) saturate(180%)
- -webkit-backdrop-filter: blur(20px) saturate(180%)
- background: rgba(27, 54, 93, 0.6)
- border: 1px solid rgba(75, 111, 165, 0.3)
- border-radius: 20px
- box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)
- min-height: 44px (iOS HIG)
- min-width: 44px (iOS HIG)

Hover State:
- transform: scale(1.02)
- box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.5)

Active State:
- transform: scale(0.98)

Color: #1B365D (blue primary) or #D4A574 (gold accent)
```

### 3. Liquid Glass Modal

```prompt
Create a React modal component with iOS 26 liquid glass effect:

REQUIREMENTS (STRICT):
- Backdrop: rgba(0, 0, 0, 0.5) with backdrop-filter blur
- Modal container:
  - backdrop-filter: blur(32px) saturate(180%)
  - -webkit-backdrop-filter: blur(32px) saturate(180%)
  - background: rgba(27, 54, 93, 0.7)
  - border: 1px solid rgba(75, 111, 165, 0.3)
  - border-radius: 24px
  - box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)

Animation:
- Fade in with scale(0.95) to scale(1)
- Duration: 300ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)

Use Framer Motion for animations.
```

### 4. Liquid Glass Input

```prompt
Create a React input component with iOS 26 liquid glass effect:

REQUIREMENTS (STRICT):
- backdrop-filter: blur(12px) saturate(180%)
- -webkit-backdrop-filter: blur(12px) saturate(180%)
- background: rgba(255, 255, 255, 0.15)
- border: 1px solid rgba(255, 255, 255, 0.2)
- border-radius: 16px
- min-height: 44px (iOS HIG)

Focus State:
- border-color: rgba(212, 165, 116, 0.4) (gold)
- box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.2)

Typography:
- Font: -apple-system, "SF Pro Text", system-ui
- Color: #fdf7ee
- Font size: 16px minimum
```

### 5. Liquid Glass Navigation

```prompt
Create a React navigation component with iOS 26 liquid glass effect:

REQUIREMENTS (STRICT):
- backdrop-filter: blur(20px) saturate(180%)
- -webkit-backdrop-filter: blur(20px) saturate(180%)
- background: rgba(27, 54, 93, 0.6)
- border-bottom: 1px solid rgba(75, 111, 165, 0.3)
- box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4)

Navigation Items:
- Padding: 16px (8px grid)
- Min-height: 44px (iOS HIG)
- Border-radius: 20px on hover

Active State:
- background: rgba(212, 165, 116, 0.2) (gold glass)
- border: 1px solid rgba(212, 165, 116, 0.4)
```

---

## Validation Checklist

After generating, verify:

- [ ] backdrop-filter uses blur(20px) saturate(180%) or approved variant
- [ ] Background opacity is 0.05-0.7
- [ ] Border opacity is 0.2-0.4
- [ ] Border radius is 16px, 20px, or 24px
- [ ] Colors match approved palette (#1B365D, #D4A574, etc.)
- [ ] Touch targets are minimum 44px × 44px
- [ ] Typography uses SF Pro fonts
- [ ] Box-shadow has both outer and inset layers
- [ ] -webkit-backdrop-filter included for Safari compatibility

---

**Ready to generate components!**


