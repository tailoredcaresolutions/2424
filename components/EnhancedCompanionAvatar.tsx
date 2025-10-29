import { motion, useAnimationControls, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface EnhancedCompanionAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  mood?: "happy" | "calm" | "thinking" | "caring" | "excited" | "sleepy";
  size?: "sm" | "md" | "lg" | "xl";
}

export default function EnhancedCompanionAvatar({
  isListening = false,
  isSpeaking = false,
  mood = "happy",
  size = "lg",
}: EnhancedCompanionAvatarProps) {
  const controls = useAnimationControls();
  const [particles, setParticles] = useState<Array<{id: number; angle: number}>>([]);
  const particleIdRef = useRef(0);

  // Motion values for smooth spring-based animations
  const scale = useMotionValue(1);
  const rotateZ = useMotionValue(0);
  const y = useMotionValue(0);
  const glowOpacity = useMotionValue(0.08); // Reduced from 0.2 to 0.08 (60% less)
  
  // Spring configurations for ultra-smooth natural movement
  const springConfig = {
    stiffness: 80,
    damping: 20,
    mass: 1.2,
  };
  
  const smoothScale = useSpring(scale, springConfig);
  const smoothRotate = useSpring(rotateZ, { stiffness: 60, damping: 25, mass: 1.5 });
  const smoothY = useSpring(y, { stiffness: 70, damping: 22, mass: 1.3 });
  const smoothGlow = useSpring(glowOpacity, { stiffness: 50, damping: 30, mass: 1 });

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };

  // Continuous idle breathing animation - very subtle and natural
  useEffect(() => {
    const breathingAnimation = async () => {
      while (true) {
        // Inhale - slow and gentle
        await controls.start({
          scale: 1.015,
          y: -2,
          transition: {
            duration: 3.5,
            ease: [0.4, 0.0, 0.2, 1.0], // easeOutCubic
          },
        });
        
        // Exhale - even slower and more relaxed
        await controls.start({
          scale: 1.0,
          y: 0,
          transition: {
            duration: 4.0,
            ease: [0.4, 0.0, 0.6, 1.0], // easeOutQuart
          },
        });
      }
    };
    
    breathingAnimation();
  }, [controls]);

  // Subtle natural sway animation
  useEffect(() => {
    const swayAnimation = async () => {
      while (true) {
        await controls.start({
          rotateZ: 0.8,
          transition: {
            duration: 5,
            ease: [0.25, 0.1, 0.25, 1.0], // easeInOutCubic
          },
        });
        await controls.start({
          rotateZ: -0.8,
          transition: {
            duration: 5,
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        });
      }
    };
    
    swayAnimation();
  }, [controls]);

  // Realistic periodic blinking
  useEffect(() => {
    const blink = () => {
      const nextBlink = 3000 + Math.random() * 4000; // Random 3-7 seconds
      setTimeout(() => {
        // Quick blink animation
        controls.start({
          scaleY: 0.95,
          transition: { duration: 0.08, ease: "easeInOut" },
        }).then(() => {
          controls.start({
            scaleY: 1.0,
            transition: { duration: 0.08, ease: "easeInOut" },
          });
        });
        blink(); // Schedule next blink
      }, nextBlink);
    };
    
    blink();
  }, [controls]);

  // Speaking animation - energetic but smooth
  useEffect(() => {
    if (isSpeaking) {
      // Create particles
      const particleInterval = setInterval(() => {
        setParticles(prev => {
          if (prev.length < 8) { // Reduced from 12 to 8
            return [...prev, {
              id: particleIdRef.current++,
              angle: Math.random() * 360,
            }];
          }
          return prev;
        });
      }, 200);

      // Speaking bounce animation
      const speakAnimation = async () => {
        while (isSpeaking) {
          await controls.start({
            scale: 1.08,
            y: -4,
            transition: {
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1], // easeOutBack
            },
          });
          await controls.start({
            scale: 1.02,
            y: -1,
            transition: {
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
            },
          });
        }
      };
      
      speakAnimation();
      glowOpacity.set(0.18); // Reduced from 0.6 to 0.18 (70% less)
      
      return () => {
        clearInterval(particleInterval);
        setParticles([]);
      };
    } else {
      glowOpacity.set(0.08);
    }
  }, [isSpeaking, controls, glowOpacity]);

  // Listening animation - gentle pulse
  useEffect(() => {
    if (isListening) {
      const listenAnimation = async () => {
        while (isListening) {
          await controls.start({
            scale: 1.04,
            transition: {
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1], // easeOutCirc
            },
          });
          await controls.start({
            scale: 1.0,
            transition: {
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            },
          });
        }
      };
      
      listenAnimation();
      glowOpacity.set(0.12); // Reduced from 0.4 to 0.12 (70% less)
    } else {
      glowOpacity.set(0.08);
    }
  }, [isListening, controls, glowOpacity]);

  // Glow color based on state - much more subtle
  const glowColor = isSpeaking 
    ? "rgba(201, 160, 99, 0.15)" // Reduced from 0.5
    : isListening 
    ? "rgba(201, 160, 99, 0.10)" // Reduced from 0.35
    : "rgba(201, 160, 99, 0.06)"; // Reduced from 0.15

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      {/* Subtle ambient glow - much less intense */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: smoothGlow,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.15, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: isSpeaking ? 1.5 : isListening ? 2.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main companion image with Framer Motion */}
      <motion.div
        className="relative z-10"
        animate={controls}
        style={{
          scale: smoothScale,
          rotateZ: smoothRotate,
          y: smoothY,
          willChange: "transform",
        }}
        whileHover={{
          scale: 1.05,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        }}
        whileTap={{
          scale: 0.98,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
          },
        }}
      >
        {/* Subtle inner glow when speaking - much reduced */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 40% 40%, rgba(201, 160, 99, 0.12) 0%, transparent 60%)`,
              filter: "blur(20px)",
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3], // Reduced from [0.6, 0.9, 0.6]
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Companion image */}
        <motion.img
          src="/companion-avatar.png"
          alt="AI Companion"
          className="w-full h-full object-contain relative z-10 rounded-full"
          style={{
            filter: isSpeaking 
              ? "brightness(1.08) contrast(1.03)" // Reduced from 1.15 and 1.08
              : isListening 
              ? "brightness(1.04) contrast(1.02)" // Reduced from 1.08 and 1.04
              : "brightness(1.02) contrast(1.01)", // Reduced from 1.04 and 1.02
          }}
        />

        {/* Subtle shimmer overlay when speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)",
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>

      {/* Voice indicator rings - only when speaking, much more subtle */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            {[
              { scale: 1.35, delay: 0, opacity: 0.15 }, // Reduced from 0.4
              { scale: 1.22, delay: 0.15, opacity: 0.12 }, // Reduced from 0.3
              { scale: 1.12, delay: 0.3, opacity: 0.08 }, // Reduced from 0.2
            ].map((ring, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full border-2"
                style={{
                  width: `${ring.scale * 100}%`,
                  height: `${ring.scale * 100}%`,
                  borderColor: `rgba(201, 160, 99, ${ring.opacity})`,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [ring.opacity * 0.6, ring.opacity, ring.opacity * 0.6],
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: ring.delay,
                  ease: [0.22, 1, 0.36, 1], // easeOutCirc
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Listening indicator - gentle pulsing rings */}
      <AnimatePresence>
        {isListening && !isSpeaking && (
          <>
            {[
              { scale: 1.25, delay: 0, opacity: 0.12 }, // Reduced from 0.3
              { scale: 1.15, delay: 0.3, opacity: 0.08 }, // Reduced from 0.2
            ].map((ring, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full border-2"
                style={{
                  width: `${ring.scale * 100}%`,
                  height: `${ring.scale * 100}%`,
                  borderColor: `rgba(201, 160, 99, ${ring.opacity})`,
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [ring.opacity * 0.7, ring.opacity, ring.opacity * 0.7],
                }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: ring.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Particle system when speaking - reduced and more subtle */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(201, 160, 99, 0.4) 0%, rgba(212, 176, 120, 0.2) 50%, transparent 100%)",
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
              x: Math.cos((particle.angle * Math.PI) / 180) * 120,
              y: Math.sin((particle.angle * Math.PI) / 180) * 120,
              scale: [0, 1, 0.8, 0],
              opacity: [0, 0.5, 0.3, 0], // Reduced from [0, 0.8, 0.5, 0]
            }}
            exit={{
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 2,
              ease: [0.22, 1, 0.36, 1], // easeOutCirc
            }}
            onAnimationComplete={() => {
              setParticles(prev => prev.filter(p => p.id !== particle.id));
            }}
          />
        ))}
      </AnimatePresence>

      {/* Attention sparkles when speaking - very subtle */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(((angle + (Date.now() / 50)) * Math.PI) / 180) * 140,
                  y: Math.sin(((angle + (Date.now() / 50)) * Math.PI) / 180) * 140,
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.2, 0.4, 0.2], // Reduced from [0.4, 0.7, 0.4]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(201, 160, 99, 0.3) 50%, transparent 100%)",
                    boxShadow: "0 0 8px rgba(201, 160, 99, 0.3)", // Reduced from 0.5
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
