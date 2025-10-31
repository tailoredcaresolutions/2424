'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

export default function SplashPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth');
    }, 2600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-tcs-blue-deep via-tcs-blue-dark to-tcs-blue-primary p-6"
      aria-label="Tailored Care Solutions loading screen"
    >
      {/* Enhanced background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--tcs-gold)]/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--tcs-blue-light)]/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.15),transparent_45%),radial-gradient(circle_at_80%_0,rgba(212,165,116,0.12),transparent_40%)]" />
      <div className="absolute inset-8 rounded-glass-lg border border-white/20 liquid-glass-card shadow-[0_40px_80px_rgba(0,0,0,0.4)]" />

      <section className="relative z-10 flex flex-col items-center gap-10 text-center text-white" role="status">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <Orb prefersReducedMotion={prefersReducedMotion} />
        </div>

        <motion.div
          className="max-w-xl space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] md:text-5xl lg:text-6xl">
            Tailored Care Solutions
          </h1>
          <p className="text-lg font-semibold text-[#E6C5A1] md:text-xl">
            PSW Voice Documentation Platform
          </p>
        </motion.div>

        <motion.div
          className="liquid-glass-light rounded-full border border-white/20 px-6 py-2 text-sm text-[#F3D7B7] shadow-[0_12px_30px_rgba(12,22,44,0.45)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Preparing secure local environment…
        </motion.div>
      </section>
    </main>
  );
}

function Orb({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2A3F6A] to-[#0A1426] blur-3xl opacity-70" />
      <motion.div
        initial={{ scale: prefersReducedMotion ? 1 : 0.9, opacity: 0 }}
        animate={{
          scale: prefersReducedMotion ? 1 : [0.92, 1.05, 0.92],
          opacity: 1,
          rotate: prefersReducedMotion ? 0 : [0, 6, -4, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0.6 : 5,
          repeat: prefersReducedMotion ? 0 : Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
        className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#F6E3CB] via-[#E0AE74] to-[#B97A3A] shadow-[0_0_60px_rgba(212,165,116,0.45)]"
        aria-label="Golden orb loading animation"
        role="img"
      >
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 0.4 : 0 }}
          animate={{
            opacity: prefersReducedMotion ? 0.45 : [0.2, 0.55, 0.2],
            scale: prefersReducedMotion ? 1 : [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: prefersReducedMotion ? 1 : 4.5,
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="h-[65%] w-[65%] rounded-full bg-gradient-to-br from-white/90 to-white/20 shadow-[0_-12px_22px_rgba(255,255,255,0.3)]"
        />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.2)_0deg,rgba(255,255,255,0)_120deg,rgba(255,255,255,0)_360deg)]" />
        <div className="absolute inset-2 rounded-full border border-white/25" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_60%)]" />
      </motion.div>

      {!prefersReducedMotion && (
        <>
          <motion.div
            initial={{ opacity: 0.25, scale: 1.05 }}
            animate={{ opacity: [0.25, 0.05], scale: [1.05, 1.35] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-[-12%] rounded-full border border-[#D4A574]/30"
          />
          <motion.div
            initial={{ opacity: 0.18, scale: 1.15 }}
            animate={{ opacity: [0.18, 0], scale: [1.15, 1.45] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute inset-[-22%] rounded-full border border-[#D4A574]/15"
          />
        </>
      )}
    </div>
  );
}
