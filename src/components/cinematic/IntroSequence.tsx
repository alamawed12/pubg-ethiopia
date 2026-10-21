'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleField } from './ParticleField';

export interface IntroSequenceProps {
  onComplete?: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [mounted, setMounted] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);

  const ethLetters = useMemo(() => 'ETHIOPIA'.split(''), []);
  const assemblyWords = useMemo(() => ['COMMUNITY', 'ASSEMBLY'], []);

  const handleFinish = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('intro-seen', 'true');
      } catch {
        // Safe catch for private browsing restrictions
      }
    }
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 600);
  }, [onComplete]);

  useEffect(() => {
    setMounted(true);

    try {
      const seen = sessionStorage.getItem('intro-seen');
      if (seen === 'true') {
        setHasSeenIntro(true);
        onComplete?.();
        return;
      }
    } catch {
      // Continue if storage is inaccessible
    }
    setHasSeenIntro(false);

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setPhase(4); // Jump directly to logo reveal
      const timer = setTimeout(() => {
        handleFinish();
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Sequence timelines - smoothly orchestrated to prevent frame drops
    // 0.4s: Laser scanline sweep
    const tScan = setTimeout(() => setPhase(1), 400);
    // 0.9s: ETHIOPIA // COMMUNITY ASSEMBLY reveals
    const tEth = setTimeout(() => setPhase(2), 900);
    // 2.2s: ONE COMMUNITY. ONE BATTLEGROUND. converges
    const tCreed = setTimeout(() => setPhase(3), 2200);
    // 3.6s: MORPH text into official PUBG MOBILE logo!
    const tLogo = setTimeout(() => setPhase(4), 3600);
    // 5.2s: Seamless fade out into homepage hero
    const tExit = setTimeout(() => {
      handleFinish();
    }, 5200);

    return () => {
      clearTimeout(tScan);
      clearTimeout(tEth);
      clearTimeout(tCreed);
      clearTimeout(tLogo);
      clearTimeout(tExit);
    };
  }, [handleFinish, onComplete]);

  // Don't render until mounted or if already seen
  if (!mounted || hasSeenIntro) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden select-none"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Subtle background particle field - reduced count for 60fps mobile stability */}
          <ParticleField particleCount={60} opacity={0.35} />

          {/* Vignette background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#050505_90%)] pointer-events-none" />

          {/* Phase 1: Thin green horizontal laser scanline sweep (GPU transform only) */}
          {phase >= 1 && phase < 3 && (
            <motion.div
              initial={{ x: '-100vw' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent pointer-events-none shadow-[0_0_12px_#CCFF00]"
              style={{ willChange: 'transform' }}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* Phase 2: "ETHIOPIA // COMMUNITY ASSEMBLY" Staggered Hardware Reveal */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {phase === 2 && (
              <motion.div
                key="phase-2-title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.3, ease: 'easeIn' } }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Pre-tag */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[10px] sm:text-xs text-[#CCFF00] tracking-[0.25em] uppercase mb-2"
                >
                  {'ADDIS ABABA GATHERING'}
                </motion.div>

                {/* ETHIOPIA Letters (Hardware Accelerated without blur filters) */}
                <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-[#ffffff] tracking-[0.14em] sm:tracking-[0.22em] uppercase flex flex-wrap justify-center font-bold max-w-full">
                  {ethLetters.map((char, index) => (
                    <motion.span
                      key={`eth-${index}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="inline-block"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>

                {/* COMMUNITY ASSEMBLY words */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-2 sm:mt-4 font-heading text-base sm:text-2xl md:text-4xl text-[#999999] tracking-[0.15em] sm:tracking-[0.22em] uppercase flex flex-wrap justify-center gap-2 font-medium max-w-full"
                >
                  {assemblyWords.map((word, wIdx) => (
                    <span key={`word-${wIdx}`} className="inline-block">
                      {word}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* Phase 3: Creed "ONE COMMUNITY. ONE BATTLEGROUND."                */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {phase === 3 && (
              <motion.div
                key="phase-3-creed"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.75,
                  transition: { duration: 0.45, ease: [0.32, 0, 0.67, 0] },
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto leading-tight"
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="font-heading text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#CCFF00] tracking-tight sm:tracking-wider uppercase">
                  ONE COMMUNITY.
                </div>
                <div className="font-heading text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight sm:tracking-wider uppercase mt-1 sm:mt-2">
                  ONE BATTLEGROUND.
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* Phase 4: MORPH TEXT INTO OFFICIAL PUBG MOBILE LOGO!               */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {phase === 4 && (
              <motion.div
                key="phase-4-logo-morph"
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{
                  opacity: 1,
                  scale: [0.55, 1.06, 1],
                }}
                exit={{
                  opacity: 0,
                  scale: 1.1,
                  transition: { duration: 0.4, ease: 'easeOut' },
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md mx-auto"
                style={{ willChange: 'transform, opacity' }}
              >
                {/* Expanding Lime Energy Ring Pulse */}
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: [0.3, 1.4, 1.9], opacity: [0.9, 0.4, 0] }}
                  transition={{ duration: 1.4, ease: 'easeOut' }}
                  className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full border-2 border-[#CCFF00] pointer-events-none"
                  style={{ willChange: 'transform, opacity' }}
                />

                {/* PUBG MOBILE Official Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/community-assembly-logo.png"
                  alt="PUBG Mobile Community Assembly Ethiopia"
                  className="h-28 sm:h-36 md:h-44 w-auto object-contain filter drop-shadow-[0_0_45px_rgba(204,255,0,0.7)] select-none"
                />

                {/* Tactical Assembly Title below morph */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mt-4 flex flex-col items-center gap-1"
                >
                  <span className="font-heading font-black text-sm sm:text-base md:text-lg tracking-[0.25em] text-[#CCFF00] uppercase">
                    COMMUNITY ASSEMBLY
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs tracking-[0.3em] text-[#999999] uppercase">
                    ADDIS ABABA • ETHIOPIA
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button in bottom-right (Always available) */}
          <button
            onClick={handleFinish}
            type="button"
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/60 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/60 text-[#999999] hover:text-[#CCFF00] font-mono text-xs tracking-widest transition-all duration-300 backdrop-blur-sm cursor-pointer group shadow-lg"
          >
            <span>SKIP</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroSequence;
