// Liquid gold visualization with responsive blob variants

'use client';
import { useMemo, useId } from 'react';

const pseudoRandom = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const fraction = x - Math.floor(x);
  return fraction < 0 ? fraction + 1 : fraction;
};

const blobPaths = {
  amoeba:
    'M204 26C256 24 319 54 345 108C372 161 365 234 328 284C292 336 226 372 169 360C113 349 77 292 72 232C67 171 92 109 140 70C164 50 191 27 204 26Z',
  cloud:
    'M126 152C137 109 186 82 231 96C263 57 330 64 356 111C402 119 424 169 400 212C433 253 412 314 360 325C332 374 254 374 212 344C154 383 90 353 82 298C42 264 52 204 96 185C84 161 96 147 126 152Z',
  sphere:
    'M200 40C285 40 360 115 360 200C360 285 285 360 200 360C115 360 40 285 40 200C40 115 115 40 200 40Z'
};

export default function GoldOrb3D({
  isListening,
  isProcessing,
  audioLevel = 0,
  size = 600,
  showStatusLabel = true,
  variant = 'amoeba'
}) {
  const state = isListening ? 'listening' : isProcessing ? 'speaking' : 'idle';
  const numericSize = typeof size === 'number' ? size : 360;
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;
  const paths = blobPaths[variant] || blobPaths.amoeba;

  const uniqueId = useId().replace(/:/g, '');
  const ids = useMemo(() => ({
    gradient: `blob-gradient-${uniqueId}`,
    glow: `blob-glow-${uniqueId}`,
    sheen: `blob-sheen-${uniqueId}`,
    shadow: `blob-shadow-${uniqueId}`
  }), [uniqueId]);

  const sparkles = useMemo(() => {
    const total = 26;
    return Array.from({ length: total }, (_, i) => {
      const sizeFactor = pseudoRandom(i + 1);
      const horizontal = pseudoRandom(i + 101) - 0.5;
      const vertical = pseudoRandom(i + 201) - 0.5;
      const delaySeed = pseudoRandom(i + 301);
      const durationSeed = pseudoRandom(i + 401);
      const opacitySeed = pseudoRandom(i + 501);

      return {
        id: i,
        size: 2 + sizeFactor * 5,
        x: horizontal * numericSize * 0.6,
        y: vertical * numericSize * 0.6,
        delay: delaySeed * 3,
        duration: 2 + durationSeed * 2,
        opacity: 0.3 + opacitySeed * 0.5
      };
    });
  }, [numericSize]);

  const wobbleClass = state === 'speaking' ? 'blob-shape blob-shape--active' : 'blob-shape';

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative"
        style={{
          width: sizeStyle,
          height: sizeStyle
        }}
      >
        {/* Soft halo */}
        <div
          className="absolute inset-0 rounded-full blur-[120px] opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(212,165,116,0.55), rgba(212,165,116,0))',
            transform: `scale(${1.2 + audioLevel * 0.2})`
          }}
        />

        {/* Ambient rim */}
        <div
          className="absolute inset-[8%] rounded-full blur-[80px] opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,106,0.4), rgba(201,168,106,0.05))'
          }}
        />

        {/* Sparkles */}
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="absolute rounded-full animate-float-sparkle"
            style={{
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              left: `${sparkle.x}px`,
              top: `${sparkle.y}px`,
              background: 'radial-gradient(circle, rgba(212,165,116,0.9), rgba(212,165,116,0))',
              boxShadow: '0 0 10px rgba(212,165,116,0.7)',
              opacity: sparkle.opacity,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration + 2}s`
            }}
          />
        ))}

        <svg viewBox="0 0 400 400" className="relative z-10 w-full h-full">
          <defs>
            <radialGradient id={ids.gradient} cx="30%" cy="20%" r="80%">
              <stop offset="0%" stopColor="#F5E8D8" />
              <stop offset="35%" stopColor="#E3B888" />
              <stop offset="65%" stopColor="#D4A574" />
              <stop offset="100%" stopColor="#C9A86A" />
            </radialGradient>
            <radialGradient id={ids.glow} cx="30%" cy="25%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={ids.sheen} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id={ids.shadow} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="25" stdDeviation="20" floodColor="rgba(201,168,106,0.35)" />
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>

          <g style={{ transformOrigin: '50% 50%' }}>
            <path
              d={paths}
              fill={`url(#${ids.gradient})`}
              filter={`url(#${ids.shadow})`}
              className={wobbleClass}
              style={{
                transform: `scale(${1 + audioLevel * 0.08}) rotate(${state === 'speaking' ? 2 : -1}deg)`
              }}
            />
            <path d={paths} fill={`url(#${ids.glow})`} opacity="0.45" />
            <path d={paths} fill={`url(#${ids.sheen})`} className="blob-sheen" />
          </g>
        </svg>

        {showStatusLabel && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            style={{ bottom: '-64px' }}
          >
            <div
              className="px-8 py-3 rounded-full border backdrop-blur"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255,255,255,0.45)',
                boxShadow: '0 15px 45px rgba(9,9,9,0.35)'
              }}
            >
              <span className="text-sm font-semibold tracking-wide text-white">
                {state === 'listening' ? 'Listening…' : state === 'speaking' ? 'Processing…' : 'Ready for the next shift'}
              </span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-sparkle {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(6px, -10px, 0);
            opacity: 0.8;
          }
        }

        @keyframes blob-wobble {
          0%, 100% {
            transform: rotate(-2deg) scale(0.99);
          }
          50% {
            transform: rotate(2deg) scale(1.01);
          }
        }

        @keyframes blob-pulse {
          0%, 100% {
            transform: rotate(-1deg) scale(0.97);
          }
          50% {
            transform: rotate(3deg) scale(1.05);
          }
        }

        @keyframes sheen-sweep {
          0% {
            transform: translate(-40%, -40%) scale(0.9) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.45;
          }
          100% {
            transform: translate(30%, 30%) scale(1.1) rotate(180deg);
            opacity: 0;
          }
        }

        .blob-shape {
          animation: blob-wobble 9s ease-in-out infinite;
          transform-origin: center;
        }

        .blob-shape--active {
          animation: blob-pulse 5s ease-in-out infinite;
        }

        .blob-sheen {
          mix-blend-mode: screen;
          animation: sheen-sweep 6s ease-in-out infinite;
          opacity: 0.35;
        }

        .animate-float-sparkle {
          animation: float-sparkle 4.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
