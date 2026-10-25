'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundContext } from '../sound/SoundManager';

export function PubgmFlashShowcase() {
  const { playSound } = useSoundContext();
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://pubggo.go.link/c6Use — Pre-register for PUBG Mobile Flash with $1,000,000 in rewards!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const scrollToNext = () => {
    playSound('click');
    const target = document.getElementById('story') || document.getElementById('assembly');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.scrollBy({ top: 600, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="flash"
      aria-label="PUBG Mobile Flash Official Launch"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#040811] overflow-hidden select-none"
    >
      {/* ─── Ambient Atmospheric Cyan Lighting & Tactical Grid ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[450px] bg-[#00c2ff]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-[#0077ff]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid opacity-15 pointer-events-none" />

      {/* ─── Centered Clean Typography & Action Content ─── */}
      <div className="max-w-4xl mx-auto relative z-10 text-center space-y-7">
        
        {/* Top Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/40 text-[#00c2ff] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(0,194,255,0.25)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
          <span>OFFICIAL GLOBAL PRE-REGISTRATION · COMING SOON</span>
        </motion.div>

        {/* Main Title: Crisp White PUBG MOBILE + Full Blue FLASH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-1"
        >
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading tracking-tight uppercase leading-none">
            <span className="text-white block drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              PUBG MOBILE
            </span>
            {/* Full Solid Electric Blue FLASH */}
            <span className="text-[#00c2ff] drop-shadow-[0_0_40px_rgba(0,194,255,0.85)] filter inline-block">
              FLASH
            </span>
          </h2>

          {/* Subheading: November 13 Launch Date */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="inline-block w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent to-[#00c2ff]/60" />
            <span className="font-heading font-black italic text-lg sm:text-2xl md:text-3xl text-[#00c2ff] tracking-widest uppercase">
              COMING SOON · NOVEMBER 13
            </span>
            <span className="inline-block w-8 sm:w-12 h-[2px] bg-gradient-to-l from-transparent to-[#00c2ff]/60" />
          </div>
        </motion.div>

        {/* US $1,000,000 Reward Callout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-1"
        >
          <div className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-[#ffe600] tracking-tight leading-none drop-shadow-[0_4px_20px_rgba(255,230,0,0.45)]">
            US $1,000,000
          </div>
          <div className="font-heading font-bold text-sm sm:text-lg md:text-xl text-neutral-300 tracking-wider uppercase mt-1.5">
            IN REWARDS AWAITS — STAY TUNED!
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
        >
          {/* Main Pre-Register Button */}
          <a
            href="https://pubggo.go.link/c6Use"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click')}
            onMouseEnter={() => playSound('hover')}
            className="px-8 sm:px-10 py-4 rounded-xl font-heading font-black text-sm sm:text-base uppercase tracking-wider bg-[#00c2ff] hover:bg-[#38bdf8] text-black shadow-[0_0_30px_rgba(0,194,255,0.6)] hover:shadow-[0_0_45px_rgba(0,194,255,0.9)] transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>PRE-REGISTER NOW</span>
            <span className="font-bold">&gt;</span>
          </a>

          {/* Go to Official Website */}
          <a
            href="https://pubgmobile.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('click')}
            onMouseEnter={() => playSound('hover')}
            className="px-5 py-4 rounded-xl font-heading font-bold text-xs sm:text-sm uppercase tracking-wider bg-black/80 hover:bg-black text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all flex items-center gap-2.5 cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4 text-[#00c2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>GO TO OFFICIAL WEBSITE &gt;</span>
          </a>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            onMouseEnter={() => playSound('hover')}
            title="Share Campaign"
            aria-label="Share Campaign Link"
            className="p-4 rounded-xl bg-black/80 hover:bg-black text-neutral-300 hover:text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </motion.div>

        {/* Legal Footnote */}
        <p className="font-sans text-[11px] sm:text-xs text-neutral-400 italic pt-1 max-w-md mx-auto">
          Total rewards include in-game and out-of-game rewards. Actual value may vary by region.
        </p>

        {/* Bottom Navigation: Smooth Scroll Down */}
        <div className="pt-8 sm:pt-12">
          <button
            type="button"
            onClick={scrollToNext}
            onMouseEnter={() => playSound('hover')}
            className="inline-flex flex-col items-center gap-1.5 text-neutral-400 hover:text-[#00c2ff] transition-colors cursor-pointer group"
          >
            <span className="font-sans text-xs sm:text-sm font-semibold tracking-wider">
              Scroll down to explore Ethiopian Community Assembly
            </span>
            <svg
              className="w-5 h-5 text-[#00c2ff] group-hover:translate-y-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Share Notification Toast ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#0f172a] text-white border border-[#00c2ff]/60 shadow-[0_10px_35px_rgba(0,194,255,0.4)] flex items-center gap-3 font-sans text-xs sm:text-sm font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
            <span>Campaign link copied to clipboard! Share with your squad.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PubgmFlashShowcase;