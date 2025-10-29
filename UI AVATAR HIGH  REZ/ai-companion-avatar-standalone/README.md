# AI Companion Avatar - Standalone Animation Package

A cinema-quality animated AI companion avatar with Disney/Pixar animation principles, designed for dementia care applications.

## Features

- **8 AI-Reactive States**: idle, listening, speaking, thinking, happy, concerned, celebrating, sleeping
- **Cinema-Quality Animations**: Breathing, swaying, eye blinking, head tilts
- **Advanced Effects**: Particle systems, multi-layer glows, rotating sparkles, 3D depth
- **Spring Physics**: Smooth, natural movements using Framer Motion
- **Customizable**: Colors, size, animation intensity all configurable
- **Portable**: Easy to integrate into any React project

## Installation

1. Install Framer Motion:
```bash
npm install framer-motion
```

2. Copy `AICompanionAvatar.tsx` to your components folder

3. Copy `companion-avatar.png` to your public assets folder

## Usage

```tsx
import AICompanionAvatar from './components/AICompanionAvatar';

function MyApp() {
  return (
    <AICompanionAvatar
      state="speaking"
      expression="joy"
      avatarUrl="/companion-avatar.png"
      size="lg"
      primaryColor="#c9a063"
      secondaryColor="#d4b078"
      glowIntensity={0.3}
      animationSpeed={1.0}
      enableHover={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `'idle' \| 'listening' \| 'speaking' \| 'thinking' \| 'happy' \| 'concerned' \| 'celebrating' \| 'sleeping'` | `'idle'` | Current AI state |
| `expression` | `'neutral' \| 'joy' \| 'curiosity' \| 'empathy' \| 'excitement' \| 'thoughtful' \| 'greeting' \| 'attentive'` | `'neutral'` | Facial expression |
| `avatarUrl` | `string` | - | Path to avatar image |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| `primaryColor` | `string` | `'#c9a063'` | Primary glow color |
| `secondaryColor` | `string` | `'#d4b078'` | Secondary glow color |
| `glowIntensity` | `number` | `0.3` | Glow effect intensity (0-1) |
| `animationSpeed` | `number` | `1.0` | Animation speed multiplier |
| `enableHover` | `boolean` | `true` | Enable hover interactions |

## Animation States

- **idle**: Gentle breathing and swaying
- **listening**: Attentive with pulsing rings
- **speaking**: Animated with particles and sparkles
- **thinking**: Thoughtful head tilt
- **happy**: Joyful bounce with bright eyes
- **concerned**: Empathetic expression
- **celebrating**: Excited with enhanced effects
- **sleeping**: Calm, minimal movement

## Technical Details

- Built with React 19 and Framer Motion
- Uses spring physics for natural movement
- 10+ custom easing functions
- 4-layer parallax depth system
- Particle physics with gravity
- 60fps+ performance optimized
- TypeScript support included

## Brand Colors (Tailored Care Solutions)

- Primary: `#c9a063` (Warm gold)
- Secondary: `#d4b078` (Light gold)
- Background: `#1a2332` (Dark navy)

## License

Created for Tailored Care Solutions
© 2025 All rights reserved

## Support

For questions or customization, contact: support@tailoredcaresolutions.com
