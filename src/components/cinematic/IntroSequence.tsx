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
  const assemblyLetters = useMemo(() => 'COMMUNITY ASSEMBLY'.split(''), []);

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
    }, 700);
  }, [onComplete]);

  useEffect(() => {
    setMounted(true);
    // Check sessionStorage
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
      setPhase(3); // Jump straight to creed / summary
      const timer = setTimeout(() => {
        handleFinish();
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Sequence timelines
    // 0.5s: scan line
    const tScan = setTimeout(() => setPhase(1), 500);
    // 1.0s: Ethiopia reveals
    const tEth = setTimeout(() => setPhase(2), 1000);
    // 1.5s: Community Assembly reveals
    const tAssembly = setTimeout(() => setPhase(2.5), 1500);
    // 2.5s: Creed slams in
    const tCreed = setTimeout(() => setPhase(3), 2500);
    // 4.0s: Fade out
    const tExit = setTimeout(() => {
      handleFinish();
    }, 4000);

    return () => {
      clearTimeout(tScan);
      clearTimeout(tEth);
      clearTimeout(tAssembly);
      clearTimeout(tCreed);
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
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] overflow-hidden select-none"
        >
          {/* Subtle background particle field */}
          <ParticleField particleCount={80} opacity={0.4} />

          {/* Vignette & scanline gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_90%)] pointer-events-none" />

          {/* Phase 1: Thin green horizontal scanline sweep */}
          {phase >= 1 && phase < 3 && (
            <motion.div
              initial={{ x: '-100vw' }}
              animate={{ x: '100vw' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent pointer-events-none shadow-[0_0_15px_#CCFF00]"
            />
          )}

          {/* Phase 2: Letter by letter Title "ETHIOPIA // COMMUNITY ASSEMBLY" */}
          <AnimatePresence>
            {phase >= 2 && phase < 3 && (
              <motion.div
                key="title-group"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.4 } }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4"
              >
                {/* ETHIOPIA letters */}
                <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl text-[#cccccc] tracking-[0.3em] uppercase flex flex-wrap justify-center overflow-hidden font-bold">
                  {ethLetters.map((char, index) => (
                    <motion.span
                      key={`eth-${index}`}
                      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </h1>

                {/* COMMUNITY ASSEMBLY letters */}
                {phase >= 2.5 && (
                  <h2 className="mt-4 font-heading text-2xl md:text-4xl lg:text-5xl text-[#999999] tracking-[0.25em] uppercase flex flex-wrap justify-center font-medium">
                    {assemblyLetters.map((char, index) => (
                      <motion.span
                        key={`ca-${index}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.03,
                          ease: 'easeOut',
                        }}
                        className="inline-block"
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    ))}
                  </h2>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Creed slam in */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                key="creed-group"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-4 leading-none"
              >
                <div className="font-heading text-5xl md:text-7xl lg:text-8xl font-black text-[#CCFF00] tracking-wider uppercase drop-shadow-[0_0_35px_rgba(204,255,0,0.4)]">
                  ONE COMMUNITY.
                </div>
                <div className="font-heading text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-wider uppercase mt-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  ONE BATTLEGROUND.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button in bottom-right */}
          <button
            onClick={handleFinish}
            type="button"
            className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 bg-black/60 hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/60 text-[#999999] hover:text-[#CCFF00] font-mono text-xs tracking-widest transition-all duration-300 backdrop-blur-sm cursor-pointer group"
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
