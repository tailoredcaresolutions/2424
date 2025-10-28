# 🎨 VISUAL DESIGN SPECIFICATION - CHATGPT-INSPIRED CONVERSATIONAL UI

**Project:** PSW Voice Documentation System - Tailored Care Solutions  
**Reference:** ChatGPT conversational mode (October 2025)  
**Created:** October 25, 2025  
**Based on:** Attached mockup images showing golden orb animation

---

## 📸 REFERENCE IMAGES ANALYSIS

### Image 1: Mobile Splash Screen
**Observed Elements:**
- Large golden orb (3D rendered, photorealistic)
- Warm golden glow/aura (radial gradient)
- Soft shadow beneath orb
- "Tailored Care Solutions" text (gold, 3D effect)
- Plant/leaf logo icon (gold, enclosed in rounded square)
- Beige/champagne background (#FFF5E6)
- Clean, minimalist layout

### Image 2: Brand Logo Mockup
**Observed Elements:**
- Circular badge with house + caregiver icon
- Gold metallic effect (3D embossed)
- White/cream background
- "Tailored Care Solutions" text (serif font, gold)
- Professional healthcare aesthetic

### Key Visual Characteristics to Replicate:
1. **Golden Liquid Glass Effect** - Photorealistic, fluid, breathing
2. **Radial Glow** - Soft, warm, multi-layer depth
3. **3D Depth** - Shadows, highlights, concentric layers
4. **Smooth Animation** - Organic motion, gentle pulsing
5. **Champagne/Gold Palette** - Warm, inviting, professional

---

## 🎯 IMPLEMENTATION SPECIFICATION

### Golden Orb - Photorealistic 3D Effect

#### Visual Layers (Front to Back)
```
Layer 7: Highlight sheen (top-left, white, 10% opacity)
Layer 6: Main golden sphere (gradient gold)
Layer 5: Internal glow (bright gold, 40% opacity)
Layer 4: Ambient rim light (orange-gold, 30% opacity)
Layer 3: Soft halo (radial blur 120px, 70% opacity)
Layer 2: Outer glow (radial blur 200px, 50% opacity)
Layer 1: Drop shadow (dark, 20% opacity, 40px offset)
```

#### CSS Implementation
```css
/* Golden Orb Container */
.golden-orb-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Layer 2: Outer Glow (largest) */
.orb-outer-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(
    circle at center,
    rgba(255, 214, 153, 0.55) 0%,
    rgba(255, 214, 153, 0.3) 40%,
    rgba(255, 214, 153, 0) 70%
  );
  filter: blur(200px);
  opacity: 0.5;
  animation: pulse-outer 4s ease-in-out infinite;
}

/* Layer 3: Soft Halo */
.orb-halo {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 214, 153, 0.7) 0%,
    rgba(255, 198, 110, 0.4) 30%,
    rgba(255, 159, 64, 0.05) 60%,
    transparent 100%
  );
  filter: blur(120px);
  opacity: 0.7;
  animation: breathe 3s ease-in-out infinite;
}

/* Layer 4: Ambient Rim Light */
.orb-rim-light {
  position: absolute;
  inset: 8%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 198, 110, 0.6) 0%,
    rgba(255, 159, 64, 0.3) 40%,
    rgba(255, 159, 64, 0.05) 70%,
    transparent 100%
  );
  filter: blur(80px);
  opacity: 0.7;
  border-radius: 50%;
}

/* Layer 6: Main Golden Sphere */
.orb-sphere {
  position: absolute;
  inset: 15%;
  background: linear-gradient(
    135deg,
    #F1A852 0%,    /* Light gold (top-left) */
    #E3A248 25%,   /* Primary gold */
    #D4A574 50%,   /* Mid gold */
    #C9822D 75%,   /* Deep gold */
    #B87A2A 100%   /* Darkest gold (bottom-right) */
  );
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  box-shadow:
    inset 20px 20px 60px rgba(255, 255, 255, 0.3),  /* Top-left highlight */
    inset -20px -20px 60px rgba(0, 0, 0, 0.2),      /* Bottom-right shadow */
    0 40px 80px rgba(201, 130, 45, 0.4);             /* Drop shadow */
  animation: liquid-morph 8s ease-in-out infinite;
}

/* Layer 7: Highlight Sheen */
.orb-sheen {
  position: absolute;
  inset: 20%;
  background: radial-gradient(
    ellipse at 30% 30%,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 30%,
    transparent 60%
  );
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.8;
  animation: sheen-shimmer 5s ease-in-out infinite;
}

/* Layer 5: Internal Glow */
.orb-internal-glow {
  position: absolute;
  inset: 25%;
  background: radial-gradient(
    circle at center,
    rgba(255, 235, 180, 0.8) 0%,
    rgba(255, 214, 153, 0.4) 50%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: glow-pulse 3s ease-in-out infinite;
}

/* Animations */
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes pulse-outer {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

@keyframes liquid-morph {
  0%, 100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: rotate(0deg);
  }
  25% {
    border-radius: 40% 60% 50% 50% / 60% 50% 50% 40%;
    transform: rotate(90deg);
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: rotate(180deg);
  }
  75% {
    border-radius: 50% 40% 60% 50% / 40% 60% 50% 50%;
    transform: rotate(270deg);
  }
}

@keyframes sheen-shimmer {
  0%, 100% {
    opacity: 0.6;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.9;
    transform: translate(-5px, -5px);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
```

#### React Component (Complete Implementation)
```typescript
// components/PhotorealisticGoldenOrb.tsx
'use client';
import { useEffect, useRef } from 'react';
import { useAudioLevel } from '@/hooks/useAudioLevel';

interface PhotorealisticGoldenOrbProps {
  isListening: boolean;
  isProcessing: boolean;
  size?: number;
  className?: string;
}

export default function PhotorealisticGoldenOrb({
  isListening,
  isProcessing,
  size = 400,
  className = ''
}: PhotorealisticGoldenOrbProps) {
  const { audioLevel, frequencyData } = useAudioLevel(isListening);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Audio-reactive scaling
  const scale = 1.0 + (audioLevel * 0.15);
  const glowIntensity = 0.5 + (audioLevel * 0.5);
  
  // Update sphere morph based on frequency data
  useEffect(() => {
    if (!containerRef.current || !isListening) return;
    
    const sphere = containerRef.current.querySelector('.orb-sphere') as HTMLElement;
    if (!sphere) return;
    
    const updateMorph = () => {
      // Use frequency data to influence border-radius
      const lowFreq = frequencyData.slice(0, 4).reduce((a, b) => a + b, 0) / 4 || 0.5;
      const midFreq = frequencyData.slice(4, 8).reduce((a, b) => a + b, 0) / 4 || 0.5;
      const highFreq = frequencyData.slice(8, 12).reduce((a, b) => a + b, 0) / 4 || 0.5;
      
      // Generate dynamic border-radius (subtle, organic)
      const r1 = 50 + lowFreq * 20;
      const r2 = 50 + midFreq * 20;
      const r3 = 50 + highFreq * 20;
      const r4 = 50 + (lowFreq + midFreq) * 10;
      
      sphere.style.borderRadius = `${r1}% ${r2}% ${r3}% ${r4}% / ${r2}% ${r4}% ${r1}% ${r3}%`;
      
      requestAnimationFrame(updateMorph);
    };
    
    updateMorph();
  }, [isListening, frequencyData]);
  
  return (
    <div
      ref={containerRef}
      className={`golden-orb-container ${className}`}
      style={{
        width: size,
        height: size,
        transform: `scale(${scale})`,
        transition: 'transform 0.15s ease-out'
      }}
    >
      {/* Layer 2: Outer Glow */}
      <div
        className="orb-outer-glow"
        style={{ opacity: glowIntensity }}
      />
      
      {/* Layer 3: Soft Halo */}
      <div
        className="orb-halo"
        style={{ opacity: 0.7 + (audioLevel * 0.2) }}
      />
      
      {/* Layer 4: Ambient Rim Light */}
      <div className="orb-rim-light" />
      
      {/* Layer 6: Main Sphere */}
      <div className="orb-sphere" />
      
      {/* Layer 5: Internal Glow */}
      <div
        className="orb-internal-glow"
        style={{ opacity: 0.6 + (audioLevel * 0.3) }}
      />
      
      {/* Layer 7: Highlight Sheen */}
      <div className="orb-sheen" />
      
      {/* Floating Sparkles (audio-reactive) */}
      {isListening && (
        <SparkleParticles
          count={50}
          audioLevel={audioLevel}
          frequencyData={frequencyData}
          size={size}
        />
      )}
    </div>
  );
}

// Sparkle Particles Component
function SparkleParticles({
  count,
  audioLevel,
  frequencyData,
  size
}: {
  count: number;
  audioLevel: number;
  frequencyData: number[];
  size: number;
}) {
  const sparkles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * size * 0.7,
      y: (Math.random() - 0.5) * size * 0.7,
      size: 1 + Math.random() * 4,
      baseOpacity: 0.3 + Math.random() * 0.4,
      freqIndex: i % frequencyData.length
    }));
  }, [count, size, frequencyData.length]);
  
  return (
    <>
      {sparkles.map(sparkle => {
        const frequency = frequencyData[sparkle.freqIndex] || 0;
        const opacity = sparkle.baseOpacity * (0.5 + frequency * 1.5) * audioLevel;
        
        return (
          <div
            key={sparkle.id}
            className="absolute w-1 h-1 bg-gold rounded-full pointer-events-none transition-opacity duration-75"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${sparkle.x}px, ${sparkle.y}px)`,
              opacity,
              boxShadow: `0 0 ${sparkle.size * 6}px rgba(241, 168, 82, ${opacity})`
            }}
          />
        );
      })}
    </>
  );
}
```

---

## 🎬 CONVERSATIONAL STATES

### State 1: Idle (Ready for Input)
**Visual:**
- Golden orb gently breathing (3s cycle)
- Soft glow (50% intensity)
- No sparkles
- Border-radius morphing slowly

**Animations:**
```css
.orb-idle {
  animation: breathe 3s ease-in-out infinite;
}
```

### State 2: Listening (User Speaking)
**Visual:**
- Audio-reactive scaling (1.0-1.15)
- Glow intensity linked to audio level (50-100%)
- 50 sparkles appearing/disappearing based on frequency
- Rapid border-radius morphing (frequency-based)
- Outer glow pulsing in sync with voice

**Behavior:**
```typescript
// Real-time audio feedback
const scale = 1.0 + (audioLevel * 0.15);
const glowOpacity = 0.5 + (audioLevel * 0.5);
const sparkleCount = Math.floor(audioLevel * 50);
```

### State 3: Processing (AI Thinking)
**Visual:**
- Slower pulsing (2s cycle)
- Rotating shimmer effect
- Internal glow increases
- Typing indicator below orb

**Animations:**
```css
.orb-processing {
  animation: 
    breathe 2s ease-in-out infinite,
    rotate-shimmer 5s linear infinite;
}

@keyframes rotate-shimmer {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(15deg); }
}
```

### State 4: Speaking (AI Responding)
**Visual:**
- Moderate pulsing (1.5s cycle)
- Waveform visualization below orb
- Sparkles sync with TTS audio output
- Smooth transitions between words

**Integration:**
```typescript
// Sync with text-to-speech
<AudioWaveform
  isActive={isAISpeaking}
  barCount={64}
  height={80}
  className="mt-8"
/>
```

---

## 📱 MOBILE SPLASH SCREEN (REFERENCE IMAGE 1)

### Layout Specification
```typescript
// app/splash/page.tsx
export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-champagne flex flex-col items-center justify-center p-8">
      {/* Top spacing */}
      <div className="flex-1" />
      
      {/* Main golden orb (large) */}
      <div className="relative">
        <PhotorealisticGoldenOrb
          isListening={false}
          isProcessing={false}
          size={500}
        />
      </div>
      
      {/* Branding */}
      <div className="flex-1 flex flex-col items-center justify-end pb-20">
        {/* Logo icon */}
        <div className="mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-deep-gold shadow-2xl flex items-center justify-center">
          <PlantIcon className="w-12 h-12 text-champagne" />
        </div>
        
        {/* Company name */}
        <h1 className="text-4xl font-serif text-gold text-center">
          <span className="block" style={{
            textShadow: '2px 2px 4px rgba(201, 130, 45, 0.3)'
          }}>
            Tailored Care
          </span>
          <span className="block">
            Solutions
          </span>
        </h1>
      </div>
    </div>
  );
}
```

### Typography (Matching Reference)
```css
/* Serif font for branding (similar to reference) */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

.brand-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 2.5rem;
  line-height: 1.2;
  color: #E3A248;
  text-align: center;
  text-shadow: 
    2px 2px 4px rgba(201, 130, 45, 0.3),
    0 0 20px rgba(241, 168, 82, 0.2);
}
```

---

## 🌊 LIQUID GLASS BACKGROUND

### Champagne/Gold Gradient Background
```css
/* Background matching reference image */
.champagne-background {
  background: linear-gradient(
    180deg,
    #FFF9F1 0%,    /* Ivory (top) */
    #FFF5E6 25%,   /* Champagne */
    #F5E3CB 50%,   /* Sand */
    #FFF5E6 75%,   /* Champagne */
    #FFF9F1 100%   /* Ivory (bottom) */
  );
  
  /* Subtle texture overlay */
  position: relative;
}

.champagne-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(241, 168, 82, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(212, 165, 116, 0.05) 0%, transparent 50%);
  pointer-events: none;
}
```

---

## 🎨 COLOR PALETTE (EXACT MATCH)

### Primary Colors (From Reference Images)
```css
:root {
  /* Gold spectrum (matching mockup) */
  --gold-lightest: #FFF5E6;   /* Background champagne */
  --gold-lighter: #FFE3BA;    /* Light gold */
  --gold-light: #F1A852;      /* Primary light gold */
  --gold: #E3A248;            /* Primary gold (brand) */
  --gold-mid: #D4A574;        /* Mid gold */
  --gold-deep: #C9822D;       /* Deep gold */
  --gold-dark: #B87A2A;       /* Darkest gold */
  
  /* Neutral backgrounds */
  --champagne: #FFF5E6;       /* Main background */
  --ivory: #FFF9F1;           /* Alternate background */
  --sand: #F5E3CB;            /* Accent background */
  
  /* Navy (contrast for text) */
  --navy: #0E1535;            /* Primary text */
  --navy-soft: #1B365D;       /* Secondary text */
}
```

### Usage Guidelines
```css
/* Backgrounds */
body {
  background: var(--champagne);
  color: var(--navy);
}

/* Golden orb gradient */
.orb-gradient {
  background: linear-gradient(
    135deg,
    var(--gold-light) 0%,
    var(--gold) 25%,
    var(--gold-mid) 50%,
    var(--gold-deep) 75%,
    var(--gold-dark) 100%
  );
}

/* Text shadows for depth */
.gold-text-3d {
  color: var(--gold);
  text-shadow:
    2px 2px 4px rgba(201, 130, 45, 0.3),
    0 0 20px rgba(241, 168, 82, 0.2);
}
```

---

## 📐 DIMENSIONS & SPACING

### Golden Ratio (φ = 1.618)
```typescript
// Use golden ratio for harmonious proportions
const GOLDEN_RATIO = 1.618;

// Orb sizes (following golden ratio)
const orbSizes = {
  mobile: 300,                    // Small screens
  tablet: 300 * GOLDEN_RATIO,     // 485px
  desktop: 400,                   // Large screens
  splash: 400 * GOLDEN_RATIO      // 647px (splash screen)
};

// Spacing system (based on golden ratio)
const spacing = {
  xs: 4,                          // 4px
  sm: 8,                          // 8px
  md: 12,                         // 12px
  lg: 20,                         // 20px (8 * 2.5)
  xl: 32,                         // 32px (20 * 1.6)
  xxl: 52,                        // 52px (32 * 1.625)
  xxxl: 84                        // 84px (52 * 1.615)
};
```

---

## 🎭 ANIMATION TIMING

### Easing Functions (iOS-Inspired)
```css
/* Custom easing curves */
:root {
  --ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);      /* Material Design */
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);         /* Sharp exit */
  --ease-in-out-back: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Bounce */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);  /* Spring effect */
}

/* State transitions */
.orb-transition {
  transition:
    transform 300ms var(--ease-in-out-smooth),
    opacity 200ms var(--ease-in-out-smooth),
    filter 400ms var(--ease-out-expo);
}

/* Audio-reactive (fast response) */
.orb-audio-reactive {
  transition:
    transform 50ms linear,
    opacity 75ms linear;
}
```

### Animation Durations
```typescript
const animationDurations = {
  // Core animations
  breathe: 3000,        // 3s - gentle breathing
  pulse: 2000,          // 2s - processing pulse
  morph: 8000,          // 8s - liquid morphing
  shimmer: 5000,        // 5s - highlight shimmer
  
  // Transitions
  stateChange: 300,     // 300ms - switching states
  audioReactive: 50,    // 50ms - real-time audio response
  sparkleLife: 2000,    // 2s - sparkle appear/fade
  
  // UI interactions
  buttonHover: 200,     // 200ms - button hover
  pageTransition: 400   // 400ms - page navigation
};
```

---

## 🔊 AUDIO-REACTIVE BEHAVIOR

### Voice Activity Detection (VAD) Thresholds
```typescript
const VAD_THRESHOLDS = {
  silence: 0.05,        // Below this = silence
  whisper: 0.15,        // Quiet speech
  normal: 0.35,         // Normal conversation
  loud: 0.65,           // Loud speech
  shout: 0.85           // Very loud
};

// Map audio level to visual intensity
function audioToVisualIntensity(audioLevel: number): number {
  if (audioLevel < VAD_THRESHOLDS.silence) return 0;
  if (audioLevel < VAD_THRESHOLDS.whisper) return 0.2;
  if (audioLevel < VAD_THRESHOLDS.normal) return 0.5;
  if (audioLevel < VAD_THRESHOLDS.loud) return 0.8;
  return 1.0;
}
```

### Frequency Band Mapping
```typescript
// Map frequency bands to visual elements
const FREQUENCY_BANDS = {
  bass: { start: 0, end: 4, affects: 'scale' },          // 20-250Hz
  midBass: { start: 4, end: 8, affects: 'glow' },        // 250-500Hz
  midrange: { start: 8, end: 16, affects: 'morph' },     // 500-2kHz
  highMid: { start: 16, end: 24, affects: 'sparkles' },  // 2-4kHz
  treble: { start: 24, end: 32, affects: 'sheen' }       // 4-8kHz
};

// Apply frequency data to visual properties
function applyFrequencyToVisual(frequencyData: number[]) {
  const bass = average(frequencyData.slice(0, 4));
  const midBass = average(frequencyData.slice(4, 8));
  const midrange = average(frequencyData.slice(8, 16));
  const highMid = average(frequencyData.slice(16, 24));
  const treble = average(frequencyData.slice(24, 32));
  
  return {
    scale: 1.0 + (bass * 0.15),           // Bass affects size
    glowIntensity: 0.5 + (midBass * 0.5), // Mid-bass affects glow
    morphSpeed: 1.0 + (midrange * 2.0),   // Midrange affects morph rate
    sparkleCount: Math.floor(highMid * 50), // High-mid affects sparkles
    sheenOpacity: 0.6 + (treble * 0.3)    // Treble affects sheen
  };
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Visual (Week 1-2)
- [ ] Implement 7-layer golden orb structure
- [ ] Add radial gradients (outer glow, halo, rim)
- [ ] Create main sphere with 3D gradient
- [ ] Add highlight sheen and internal glow
- [ ] Implement drop shadow
- [ ] Test in Chrome, Safari, Firefox

### Phase 2: Animations (Week 3)
- [ ] Breathe animation (3s cycle)
- [ ] Pulse animation (2s cycle)
- [ ] Liquid morph (8s cycle)
- [ ] Shimmer effect (5s cycle)
- [ ] Verify 60fps on all animations
- [ ] Add reduced motion support

### Phase 3: Audio Reactivity (Week 4-5)
- [ ] Integrate Web Audio API
- [ ] Implement real-time audio level detection
- [ ] Map audio to scale (1.0-1.15)
- [ ] Map audio to glow intensity (0.5-1.0)
- [ ] Implement frequency-based morphing
- [ ] Add sparkle particles (50 count)
- [ ] Test latency (<16ms)

### Phase 4: State Management (Week 6)
- [ ] Implement idle state
- [ ] Implement listening state (audio-reactive)
- [ ] Implement processing state
- [ ] Implement speaking state (with waveform)
- [ ] Add smooth transitions (300ms)
- [ ] Test state switching

### Phase 5: Mobile Optimization (Week 7)
- [ ] Create splash screen layout
- [ ] Optimize for mobile performance
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Reduce sparkle count on low-end devices
- [ ] Add loading states

### Phase 6: Polish (Week 8)
- [ ] Fine-tune colors to match mockup exactly
- [ ] Adjust animation timings for smoothness
- [ ] Test on various screen sizes
- [ ] Optimize bundle size
- [ ] Add documentation
- [ ] Record demo videos

---

## 🎯 SUCCESS CRITERIA

**Visual Quality:**
- [ ] Photorealistic golden orb matches mockup
- [ ] Smooth 60fps animations
- [ ] Audio-reactive in real-time (<16ms latency)
- [ ] Sparkles sync with voice input
- [ ] Glows and shadows create depth

**Technical Performance:**
- [ ] <100ms state transition time
- [ ] <50ms audio-reactive response
- [ ] <30% CPU usage during animation
- [ ] <100MB memory increase
- [ ] 60fps maintained during voice input

**User Experience:**
- [ ] Visually stunning (10/10 aesthetic)
- [ ] Smooth, fluid interactions
- [ ] Clear state feedback (idle/listening/processing)
- [ ] Accessible (screen reader support)
- [ ] Reduced motion support

---

## 📚 RESOURCES

### Design References
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Liquid Glass: https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- ChatGPT UI: https://chat.openai.com (conversational mode)

### Technical References
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- CSS Gradients: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient
- React Animation: https://www.framer.com/motion/

---

**Created:** October 25, 2025  
**Based on:** Attached mockup images (golden orb + logo)  
**Status:** Ready for implementation  
**Next Step:** Begin Phase 1 - Core Visual implementation
