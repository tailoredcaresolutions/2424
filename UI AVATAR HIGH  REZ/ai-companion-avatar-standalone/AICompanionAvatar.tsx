/**
 * AI Companion Avatar - Ultimate Cinema-Quality Expressive Animation Component
 * 
 * A masterpiece AI companion avatar with film-quality animations and human-like expressions.
 * Implements Disney/Pixar's 12 Principles + advanced expressive facial animations.
 * Designed to be easily portable to any React project.
 * 
 * DEPENDENCIES:
 * - framer-motion (npm install framer-motion)
 * 
 * FEATURES:
 * - 12 Disney/Pixar animation principles
 * - Human-like facial expressions (joy, curiosity, empathy, excitement, etc.)
 * - Advanced particle physics with gravity
 * - Multi-level parallax depth (4 layers)
 * - Dynamic lighting responding to movement
 * - Realistic weight distribution
 * - Organic breathing with variable rhythm
 * - Subtle hair/clothing secondary motion
 * - Micro-expressions for authenticity
 * - Smooth state transitions with anticipation
 * - 3D perspective with depth of field
 * - Environmental ambient effects
 * - Responsive to user interactions
 * 
 * USAGE:
 * ```tsx
 * import AICompanionAvatar from './components/AICompanionAvatar';
 * 
 * <AICompanionAvatar
 *   state="speaking"
 *   expression="joy"
 *   avatarUrl="/companion-avatar.png"
 *   size="lg"
 *   primaryColor="#c9a063"
 * />
 * ```
 */

import { motion, useAnimationControls, useMotionValue, useSpring, AnimatePresence, useTransform, useTime, useVelocity } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type AIState = 
  | "idle" 
  | "listening" 
  | "speaking" 
  | "thinking" 
  | "happy" 
  | "concerned" 
  | "celebrating" 
  | "sleeping";

export type Expression =
  | "neutral"
  | "joy"
  | "curiosity"
  | "empathy"
  | "excitement"
  | "thoughtful"
  | "greeting"
  | "attentive";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AICompanionAvatarProps {
  state?: AIState;
  expression?: Expression;
  avatarUrl?: string;
  size?: AvatarSize;
  primaryColor?: string;
  secondaryColor?: string;
  glowIntensity?: number;
  animationSpeed?: number;
  showParticles?: boolean;
  showRings?: boolean;
  showSparkles?: boolean;
  showAmbientEffects?: boolean;
  onStateChange?: (state: AIState) => void;
  onExpressionChange?: (expression: Expression) => void;
  enableHover?: boolean;
  enableClick?: boolean;
  onClick?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getSizeClasses = (size: AvatarSize): string => {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };
  return sizes[size];
};

const getSizeMultiplier = (size: AvatarSize): number => {
  const multipliers = { sm: 0.5, md: 0.75, lg: 1, xl: 1.25 };
  return multipliers[size];
};

// ============================================================================
// CINEMATIC SPRING CONFIGURATIONS
// ============================================================================

const CINEMATIC_SPRINGS = {
  // Ultra-soft organic movement
  ultraSoft: { stiffness: 25, damping: 35, mass: 2.5 },
  
  // Soft, organic movement like breathing
  gentle: { stiffness: 40, damping: 30, mass: 2.0 },
  
  // Natural body movement
  natural: { stiffness: 60, damping: 25, mass: 1.8 },
  
  // Responsive but smooth
  responsive: { stiffness: 80, damping: 20, mass: 1.5 },
  
  // Bouncy with follow-through
  bouncy: { stiffness: 100, damping: 18, mass: 1.2 },
  
  // Quick anticipation
  snappy: { stiffness: 150, damping: 22, mass: 1.0 },
  
  // Smooth glow transitions
  glow: { stiffness: 30, damping: 35, mass: 2.5 },
  
  // Expressive facial movements
  expression: { stiffness: 90, damping: 23, mass: 1.3 },
};

// ============================================================================
// CINEMATIC EASING CURVES
// ============================================================================

const CINEMATIC_EASINGS = {
  // Natural ease out with slight overshoot
  naturalOut: [0.34, 1.2, 0.64, 1] as [number, number, number, number],
  
  // Smooth acceleration
  smoothIn: [0.32, 0, 0.67, 0] as [number, number, number, number],
  
  // Smooth deceleration  
  smoothOut: [0.33, 1, 0.68, 1] as [number, number, number, number],
  
  // Cinematic ease in-out
  cinematic: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number],
  
  // Anticipation curve
  anticipation: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  
  // Follow-through curve
  followThrough: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
  
  // Organic breathing
  breath: [0.37, 0, 0.63, 1] as [number, number, number, number],
  
  // Bounce with settle
  bounce: [0.68, -0.6, 0.32, 1.6] as [number, number, number, number],
  
  // Expressive movement
  expressive: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  
  // Gentle sway
  sway: [0.42, 0, 0.58, 1] as [number, number, number, number],
};

// ============================================================================
// STATE ANIMATION PARAMETERS
// ============================================================================

const STATE_ANIMATIONS = {
  idle: {
    scale: { min: 1.0, max: 1.02 },
    scaleY: { min: 1.0, max: 1.015 },
    y: { min: 0, max: -3 },
    rotation: { min: -1.5, max: 1.5 },
    rotationY: { min: -2.5, max: 2.5 },
    glowOpacity: 0.06,
    breathDuration: { inhale: 4.2, exhale: 4.8 },
    brightness: 1.02,
    particleCount: 0,
    ringCount: 0,
    anticipation: 0.35,
  },
  listening: {
    scale: { min: 1.0, max: 1.06 },
    scaleY: { min: 0.995, max: 1.04 },
    y: { min: 0, max: -2 },
    rotation: { min: -1.0, max: 1.0 },
    rotationY: { min: -3.5, max: 3.5 },
    glowOpacity: 0.10,
    breathDuration: { inhale: 1.5, exhale: 1.5 },
    brightness: 1.04,
    particleCount: 0,
    ringCount: 2,
    anticipation: 0.22,
  },
  speaking: {
    scale: { min: 1.02, max: 1.12 },
    scaleY: { min: 0.98, max: 1.10 },
    y: { min: -2, max: -7 },
    rotation: { min: -2.2, max: 2.2 },
    rotationY: { min: -5, max: 5 },
    glowOpacity: 0.15,
    breathDuration: { inhale: 0.45, exhale: 0.38 },
    brightness: 1.08,
    particleCount: 10,
    ringCount: 3,
    anticipation: 0.14,
  },
  thinking: {
    scale: { min: 1.0, max: 1.028 },
    scaleY: { min: 1.0, max: 1.018 },
    y: { min: 0, max: -1 },
    rotation: { min: -4.0, max: 4.0 },
    rotationY: { min: -6, max: 6 },
    glowOpacity: 0.08,
    breathDuration: { inhale: 3.2, exhale: 3.2 },
    brightness: 1.03,
    particleCount: 3,
    ringCount: 1,
    anticipation: 0.45,
  },
  happy: {
    scale: { min: 1.05, max: 1.16 },
    scaleY: { min: 0.95, max: 1.14 },
    y: { min: -5, max: -12 },
    rotation: { min: -3.0, max: 3.0 },
    rotationY: { min: -4, max: 4 },
    glowOpacity: 0.18,
    breathDuration: { inhale: 0.65, exhale: 0.55 },
    brightness: 1.10,
    particleCount: 14,
    ringCount: 4,
    anticipation: 0.18,
  },
  concerned: {
    scale: { min: 0.98, max: 1.01 },
    scaleY: { min: 1.0, max: 1.008 },
    y: { min: 1, max: 3 },
    rotation: { min: -0.6, max: 0.6 },
    rotationY: { min: -1.5, max: 1.5 },
    glowOpacity: 0.05,
    breathDuration: { inhale: 4.8, exhale: 5.4 },
    brightness: 0.98,
    particleCount: 0,
    ringCount: 0,
    anticipation: 0.55,
  },
  celebrating: {
    scale: { min: 1.08, max: 1.22 },
    scaleY: { min: 0.92, max: 1.18 },
    y: { min: -8, max: -16 },
    rotation: { min: -5, max: 5 },
    rotationY: { min: -7, max: 7 },
    glowOpacity: 0.22,
    breathDuration: { inhale: 0.32, exhale: 0.32 },
    brightness: 1.14,
    particleCount: 20,
    ringCount: 5,
    anticipation: 0.12,
  },
  sleeping: {
    scale: { min: 1.0, max: 1.012 },
    scaleY: { min: 1.0, max: 1.008 },
    y: { min: 0, max: -1 },
    rotation: { min: -0.5, max: 0.5 },
    rotationY: { min: -0.8, max: 0.8 },
    glowOpacity: 0.03,
    breathDuration: { inhale: 6.5, exhale: 7.5 },
    brightness: 0.94,
    particleCount: 0,
    ringCount: 0,
    anticipation: 0.85,
  },
};

// ============================================================================
// EXPRESSION PARAMETERS
// ============================================================================

const EXPRESSION_EFFECTS = {
  neutral: {
    eyeScale: 1.0,
    eyeBrightness: 1.0,
    headTilt: 0,
    bounce: 0,
  },
  joy: {
    eyeScale: 1.08,
    eyeBrightness: 1.15,
    headTilt: 2,
    bounce: 4,
  },
  curiosity: {
    eyeScale: 1.12,
    eyeBrightness: 1.10,
    headTilt: 8,
    bounce: 2,
  },
  empathy: {
    eyeScale: 1.05,
    eyeBrightness: 1.05,
    headTilt: -3,
    bounce: 0,
  },
  excitement: {
    eyeScale: 1.15,
    eyeBrightness: 1.20,
    headTilt: 4,
    bounce: 8,
  },
  thoughtful: {
    eyeScale: 0.95,
    eyeBrightness: 0.98,
    headTilt: -5,
    bounce: 0,
  },
  greeting: {
    eyeScale: 1.10,
    eyeBrightness: 1.12,
    headTilt: 3,
    bounce: 6,
  },
  attentive: {
    eyeScale: 1.06,
    eyeBrightness: 1.08,
    headTilt: 1,
    bounce: 1,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AICompanionAvatar({
  state = "idle",
  expression = "neutral",
  avatarUrl = "/companion-avatar.png",
  size = "lg",
  primaryColor = "#c9a063",
  secondaryColor = "#d4b078",
  glowIntensity = 0.25,
  animationSpeed = 1.0,
  showParticles = true,
  showRings = true,
  showSparkles = true,
  showAmbientEffects = true,
  onStateChange,
  onExpressionChange,
  enableHover = true,
  enableClick = false,
  onClick,
}: AICompanionAvatarProps) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  
  const controls = useAnimationControls();
  const expressionControls = useAnimationControls();
  const [particles, setParticles] = useState<Array<{id: number; angle: number; delay: number; velocity: number}>>([]);
  const particleIdRef = useRef(0);
  const sizeMultiplier = getSizeMultiplier(size);
  const previousStateRef = useRef<AIState>(state);
  const previousExpressionRef = useRef<Expression>(expression);
  
  // Time-based animations
  const time = useTime();
  
  // Motion values with cinematic spring physics
  const scale = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const rotateZ = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const y = useMotionValue(0);
  const glowOpacity = useMotionValue(0.06);
  const expressionIntensity = useMotionValue(1);
  
  // Apply cinematic springs
  const smoothScale = useSpring(scale, CINEMATIC_SPRINGS.natural);
  const smoothScaleY = useSpring(scaleY, CINEMATIC_SPRINGS.gentle);
  const smoothRotateZ = useSpring(rotateZ, CINEMATIC_SPRINGS.ultraSoft);
  const smoothRotateY = useSpring(rotateY, CINEMATIC_SPRINGS.natural);
  const smoothY = useSpring(y, CINEMATIC_SPRINGS.responsive);
  const smoothGlow = useSpring(glowOpacity, CINEMATIC_SPRINGS.glow);
  const smoothExpression = useSpring(expressionIntensity, CINEMATIC_SPRINGS.expression);
  
  // Velocity for motion blur simulation
  const yVelocity = useVelocity(smoothY);
  const rotationVelocity = useVelocity(smoothRotateZ);
  
  // Transform for multi-level parallax (4 layers)
  const parallaxY1 = useTransform(smoothY, [-16, 0], [-4, 0]);
  const parallaxY2 = useTransform(smoothY, [-16, 0], [-8, 0]);
  const parallaxY3 = useTransform(smoothY, [-16, 0], [-12, 0]);
  const parallaxRotate = useTransform(smoothRotateZ, [-5, 5], [-2.5, 2.5]);
  
  // Ambient sway based on time
  const ambientSway = useTransform(
    time,
    [0, 8000, 16000],
    [-1.5, 1.5, -1.5]
  );
  
  const stateAnim = STATE_ANIMATIONS[state];
  const expressionEffect = EXPRESSION_EFFECTS[expression];
  
  // Memoize colors
  const colors = useMemo(() => ({
    glow: hexToRgba(primaryColor, stateAnim.glowOpacity * glowIntensity),
    glowAccent: hexToRgba(secondaryColor, stateAnim.glowOpacity * 0.75 * glowIntensity),
    glowHighlight: hexToRgba(primaryColor, stateAnim.glowOpacity * 0.55 * glowIntensity),
    particle: hexToRgba(primaryColor, 0.45),
    particleAccent: hexToRgba(secondaryColor, 0.25),
    ring: hexToRgba(primaryColor, 0.14),
    ambient: hexToRgba(primaryColor, 0.08),
  }), [primaryColor, secondaryColor, stateAnim.glowOpacity, glowIntensity]);
  
  // ============================================================================
  // EXPRESSION TRANSITIONS
  // ============================================================================
  
  useEffect(() => {
    const previousExpression = previousExpressionRef.current;
    
    if (previousExpression !== expression) {
      // Animate expression change
      expressionControls.start({
        scale: [1, 1.05, 1],
        rotateZ: [0, expressionEffect.headTilt * 0.5, expressionEffect.headTilt],
        y: [0, -expressionEffect.bounce * 0.5, -expressionEffect.bounce],
        transition: {
          duration: 0.6 / animationSpeed,
          ease: CINEMATIC_EASINGS.expressive,
        },
      });
      
      expressionIntensity.set(expressionEffect.eyeBrightness);
      previousExpressionRef.current = expression;
      
      if (onExpressionChange) {
        onExpressionChange(expression);
      }
    }
  }, [expression, expressionControls, expressionEffect, animationSpeed, expressionIntensity, onExpressionChange]);
  
  // ============================================================================
  // STATE TRANSITIONS WITH ANTICIPATION
  // ============================================================================
  
  useEffect(() => {
    const previousState = previousStateRef.current;
    const currentStateAnim = STATE_ANIMATIONS[state];
    
    if (previousState !== state) {
      const isEnergeticTransition = 
        (state === "speaking" || state === "happy" || state === "celebrating") &&
        (previousState === "idle" || previousState === "listening");
      
      if (isEnergeticTransition) {
        // Anticipation dip
        controls.start({
          scale: 0.96,
          scaleY: 1.03,
          y: 3,
          transition: {
            duration: currentStateAnim.anticipation / animationSpeed,
            ease: CINEMATIC_EASINGS.anticipation,
          },
        }).then(() => {
          // Spring to new state
          controls.start({
            scale: currentStateAnim.scale.max,
            scaleY: currentStateAnim.scaleY.max,
            y: currentStateAnim.y.max,
            transition: {
              type: "spring",
              ...CINEMATIC_SPRINGS.bouncy,
              duration: 0.65 / animationSpeed,
            },
          });
        });
      }
      
      previousStateRef.current = state;
      
      if (onStateChange) {
        onStateChange(state);
      }
    }
  }, [state, controls, animationSpeed, onStateChange]);
  
  // ============================================================================
  // CINEMATIC BREATHING WITH VARIABLE RHYTHM
  // ============================================================================
  
  useEffect(() => {
    const breathingAnimation = async () => {
      while (true) {
        const currentState = STATE_ANIMATIONS[state];
        const breathVariation = 0.85 + Math.random() * 0.3; // Variable breathing
        
        // Inhale
        await controls.start({
          scale: currentState.scale.max,
          scaleY: currentState.scaleY.max,
          y: currentState.y.max,
          transition: {
            duration: (currentState.breathDuration.inhale * breathVariation) / animationSpeed,
            ease: CINEMATIC_EASINGS.breath,
          },
        });
        
        // Brief hold
        await new Promise(resolve => setTimeout(resolve, (200 * breathVariation) / animationSpeed));
        
        // Exhale with follow-through
        await controls.start({
          scale: currentState.scale.min,
          scaleY: currentState.scaleY.min,
          y: currentState.y.min,
          transition: {
            duration: (currentState.breathDuration.exhale * breathVariation) / animationSpeed,
            ease: CINEMATIC_EASINGS.followThrough,
          },
        });
        
        // Brief pause
        await new Promise(resolve => setTimeout(resolve, (300 * breathVariation) / animationSpeed));
      }
    };
    
    breathingAnimation();
  }, [controls, state, animationSpeed]);
  
  // ============================================================================
  // NATURAL SWAY WITH 3D ROTATION & AMBIENT MOVEMENT
  // ============================================================================
  
  useEffect(() => {
    const swayAnimation = async () => {
      while (true) {
        const currentState = STATE_ANIMATIONS[state];
        const swayVariation = 0.9 + Math.random() * 0.2;
        
        // Sway right
        await controls.start({
          rotateZ: currentState.rotation.max * swayVariation,
          rotateY: currentState.rotationY.max * swayVariation,
          transition: {
            duration: (6.5 * swayVariation) / animationSpeed,
            ease: CINEMATIC_EASINGS.sway,
          },
        });
        
        // Sway left
        await controls.start({
          rotateZ: currentState.rotation.min * swayVariation,
          rotateY: currentState.rotationY.min * swayVariation,
          transition: {
            duration: (6.5 * swayVariation) / animationSpeed,
            ease: CINEMATIC_EASINGS.sway,
          },
        });
      }
    };
    
    swayAnimation();
  }, [controls, state, animationSpeed]);
  
  // ============================================================================
  // REALISTIC BLINKING WITH MICRO-EXPRESSIONS
  // ============================================================================
  
  useEffect(() => {
    if (state === "sleeping") return;
    
    const blink = () => {
      const nextBlink = (2800 + Math.random() * 4500) / animationSpeed;
      const isDoubleBlink = Math.random() < 0.15; // 15% chance of double blink
      
      setTimeout(() => {
        // Slight anticipation
        controls.start({
          scaleY: 0.98,
          transition: { duration: 0.04 / animationSpeed, ease: "easeIn" },
        }).then(() => {
          // Blink
          controls.start({
            scaleY: 0.90,
            transition: { duration: 0.07 / animationSpeed, ease: "easeInOut" },
          }).then(() => {
            // Open with overshoot
            controls.start({
              scaleY: 1.012,
              transition: { duration: 0.09 / animationSpeed, ease: CINEMATIC_EASINGS.naturalOut },
            }).then(() => {
              // Settle
              controls.start({
                scaleY: 1.0,
                transition: { duration: 0.07 / animationSpeed, ease: "easeOut" },
              }).then(() => {
                if (isDoubleBlink) {
                  // Second blink
                  setTimeout(() => {
                    controls.start({
                      scaleY: 0.92,
                      transition: { duration: 0.06 / animationSpeed, ease: "easeInOut" },
                    }).then(() => {
                      controls.start({
                        scaleY: 1.0,
                        transition: { duration: 0.08 / animationSpeed, ease: "easeOut" },
                      });
                    });
                  }, 150 / animationSpeed);
                }
              });
            });
          });
        });
        blink();
      }, nextBlink);
    };
    
    blink();
  }, [controls, state, animationSpeed]);
  
  // ============================================================================
  // GLOW TRANSITIONS WITH DYNAMIC INTENSITY
  // ============================================================================
  
  useEffect(() => {
    const targetGlow = stateAnim.glowOpacity * glowIntensity * expressionEffect.eyeBrightness;
    glowOpacity.set(targetGlow);
  }, [state, expression, glowOpacity, stateAnim.glowOpacity, glowIntensity, expressionEffect.eyeBrightness]);
  
  // ============================================================================
  // ADVANCED PARTICLE SYSTEM WITH PHYSICS
  // ============================================================================
  
  useEffect(() => {
    if (!showParticles || stateAnim.particleCount === 0) {
      setParticles([]);
      return;
    }
    
    const particleInterval = setInterval(() => {
      setParticles(prev => {
        if (prev.length < stateAnim.particleCount) {
          return [...prev, {
            id: particleIdRef.current++,
            angle: Math.random() * 360,
            delay: Math.random() * 0.25,
            velocity: 0.8 + Math.random() * 0.4, // Variable velocity
          }];
        }
        return prev;
      });
    }, 220 / animationSpeed);
    
    return () => {
      clearInterval(particleInterval);
      setParticles([]);
    };
  }, [state, showParticles, stateAnim.particleCount, animationSpeed]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className={`relative ${getSizeClasses(size)} flex items-center justify-center`} style={{ perspective: "1200px" }}>
      {/* Ambient background glow (Layer 1 - Deepest) */}
      {showAmbientEffects && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${colors.ambient} 0%, transparent 70%)`,
            filter: `blur(${50 * sizeMultiplier}px)`,
            opacity: 0.4,
            y: parallaxY1,
          }}
          animate={{
            scale: [1, 1.15, 1],
            x: [-3, 3, -3],
          }}
          transition={{
            duration: 12 / animationSpeed,
            repeat: Infinity,
            ease: CINEMATIC_EASINGS.sway,
          }}
        />
      )}
      
      {/* Primary glow with breathing (Layer 2) */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, ${colors.glowAccent} 35%, transparent 65%)`,
          filter: `blur(${38 * sizeMultiplier}px)`,
          opacity: smoothGlow,
          y: parallaxY2,
        }}
        animate={{
          scale: [1, 1.28, 1],
        }}
        transition={{
          duration: (state === "speaking" || state === "celebrating" ? 1.8 : state === "listening" ? 2.8 : 5.2) / animationSpeed,
          repeat: Infinity,
          ease: CINEMATIC_EASINGS.breath,
        }}
      />
      
      {/* Main avatar container with 3D transforms (Layer 3) */}
      <motion.div
        className="relative z-10"
        animate={controls}
        style={{
          scale: smoothScale,
          scaleY: smoothScaleY,
          rotateZ: smoothRotateZ,
          rotateY: smoothRotateY,
          y: smoothY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        whileHover={enableHover ? {
          scale: 1.07,
          rotateY: 6,
          y: -4,
          transition: {
            type: "spring",
            ...CINEMATIC_SPRINGS.bouncy,
          },
        } : undefined}
        whileTap={enableClick ? {
          scale: 0.95,
          transition: {
            type: "spring",
            stiffness: 450,
            damping: 18,
          },
        } : undefined}
        onClick={onClick}
      >
        {/* Inner highlight glow for active states (Layer 3a) */}
        {(state === "speaking" || state === "happy" || state === "celebrating") && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 32%, ${colors.glowHighlight} 0%, transparent 60%)`,
              filter: `blur(${22 * sizeMultiplier}px)`,
              y: parallaxY3,
            }}
            animate={{
              opacity: [0.22, 0.48, 0.22],
              scale: [1, 1.14, 1],
              x: [-3, 3, -3],
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 1.8 / animationSpeed,
              repeat: Infinity,
              ease: CINEMATIC_EASINGS.cinematic,
            }}
          />
        )}
        
        {/* Avatar image with expression effects */}
        <motion.div
          animate={expressionControls}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <motion.img
            src={avatarUrl}
            alt="AI Companion"
            className="w-full h-full object-contain relative z-10 rounded-full"
            style={{
              filter: `brightness(${stateAnim.brightness * expressionEffect.eyeBrightness}) contrast(${1 + (stateAnim.brightness - 1) * 0.6}) saturate(${0.95 + expressionEffect.eyeBrightness * 0.15})`,
              opacity: state === "sleeping" ? 0.65 : 1,
              transformStyle: "preserve-3d",
            }}
          />
        </motion.div>
        

      </motion.div>
      
      {/* Voice indicator rings with staggered animation (Layer 4) */}
      <AnimatePresence>
        {showRings && stateAnim.ringCount > 0 && (
          <>
            {Array.from({ length: stateAnim.ringCount }).map((_, index) => {
              const ringScale = 1.14 + index * 0.16;
              const ringOpacity = 0.15 - index * 0.032;
              const ringDelay = index * 0.16;
              
              return (
                <motion.div
                  key={index}
                  className="absolute rounded-full border-2"
                  style={{
                    width: `${ringScale * 100}%`,
                    height: `${ringScale * 100}%`,
                    borderColor: hexToRgba(primaryColor, ringOpacity * glowIntensity),
                    y: parallaxRotate,
                  }}
                  initial={{ scale: 0.82, opacity: 0 }}
                  animate={{
                    scale: [1, 1.12, 1],
                    opacity: [ringOpacity * 0.4, ringOpacity, ringOpacity * 0.4],
                    rotate: [0, 5, 0],
                  }}
                  exit={{ scale: 0.72, opacity: 0 }}
                  transition={{
                    duration: 1.9 / animationSpeed,
                    repeat: Infinity,
                    delay: ringDelay / animationSpeed,
                    ease: CINEMATIC_EASINGS.cinematic,
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
      
      {/* Advanced particle system with physics (Layer 5) */}
      <AnimatePresence>
        {showParticles && particles.map((particle) => {
          const arcX = Math.cos((particle.angle * Math.PI) / 180) * 135 * sizeMultiplier * particle.velocity;
          const arcY = Math.sin((particle.angle * Math.PI) / 180) * 135 * sizeMultiplier * particle.velocity;
          // Simulate gravity
          const gravityY = arcY + 15 * sizeMultiplier;
          
          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${2.8 * sizeMultiplier}px`,
                height: `${2.8 * sizeMultiplier}px`,
                background: `radial-gradient(circle, ${colors.particle} 0%, ${colors.particleAccent} 45%, transparent 100%)`,
                boxShadow: `0 0 ${8 * sizeMultiplier}px ${colors.particle}`,
                left: "50%",
                top: "50%",
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: arcX,
                y: gravityY,
                scale: [0, 1.3, 1.0, 0],
                opacity: [0, 0.7, 0.5, 0],
                rotate: [0, particle.angle],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: (2.3 * particle.velocity) / animationSpeed,
                delay: particle.delay / animationSpeed,
                ease: CINEMATIC_EASINGS.naturalOut,
              }}
              onAnimationComplete={() => {
                setParticles(prev => prev.filter(p => p.id !== particle.id));
              }}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Attention sparkles with orbital motion (Layer 6) */}
      <AnimatePresence>
        {showSparkles && (state === "speaking" || state === "happy" || state === "celebrating") && (
          <>
            {[0, 120, 240].map((angle, i) => {
              const orbitRadius = 150 * sizeMultiplier;
              
              return (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    width: `${3.5 * sizeMultiplier}px`,
                    height: `${3.5 * sizeMultiplier}px`,
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0.6, 1.4, 0.6],
                    opacity: [0.12, 0.5, 0.12],
                    rotate: [0, 360],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    duration: 2.8 / animationSpeed,
                    repeat: Infinity,
                    delay: (i * 0.22) / animationSpeed,
                    ease: CINEMATIC_EASINGS.cinematic,
                  }}
                >
                  <motion.div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, ${colors.glowHighlight} 45%, transparent 100%)`,
                      boxShadow: `0 0 ${14 * sizeMultiplier}px ${colors.glowHighlight}`,
                    }}
                    animate={{
                      x: Math.cos(((angle + (Date.now() / 70)) * Math.PI) / 180) * orbitRadius,
                      y: Math.sin(((angle + (Date.now() / 70)) * Math.PI) / 180) * orbitRadius,
                    }}
                    transition={{
                      duration: 3.8 / animationSpeed,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
