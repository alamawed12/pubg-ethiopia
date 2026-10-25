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
      className="relative w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#040811] overflow-hidden select-none border-y border-[#00c2ff]/20"
    >
      {/* ─── Ambient Atmospheric Cyan Lighting ─── */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-[#00c2ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[350px] bg-[#00a3ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── Main Showcase Grid (No Frame — Seamless Photoshop Blend) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* ─── Left Column: Native Typography & Actions (7 cols) ─── */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left z-20">
            
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/40 text-[#00c2ff] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(0,194,255,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
              <span>OFFICIAL GLOBAL PRE-REGISTRATION · COMING SOON</span>
            </div>

            {/* Main Title: Full Blue FLASH */}
            <div className="space-y-1.5">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tight uppercase leading-none">
                <span className="text-white block drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  PUBG MOBILE
                </span>
                {/* Full Solid Electric Blue FLASH */}
                <span className="text-[#00c2ff] drop-shadow-[0_0_35px_rgba(0,194,255,0.85)] filter inline-block">
                  FLASH
                </span>
              </h2>

              {/* Subheading: November 13 Launch Date */}
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                <span className="font-heading font-black italic text-lg sm:text-2xl text-[#00c2ff] tracking-widest uppercase">
                  COMING SOON · NOVEMBER 13 —
                </span>
              </div>
            </div>

            {/* US $1,000,000 Reward Callout */}
            <div className="py-1">
              <div className="inline-block text-center lg:text-left">
                <div className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-[#ffe600] tracking-tight leading-none drop-shadow-[0_4px_18px_rgba(255,230,0,0.45)]">
                  US $1,000,000
                </div>
                <div className="font-heading font-bold text-sm sm:text-lg text-neutral-300 tracking-wider uppercase mt-1">
                  IN REWARDS AWAITS — STAY TUNED!
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              {/* Main Pre-Register Button */}
              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="px-7 sm:px-9 py-3.5 rounded-xl font-heading font-black text-sm sm:text-base uppercase tracking-wider bg-[#00c2ff] hover:bg-[#38bdf8] text-black shadow-[0_0_30px_rgba(0,194,255,0.6)] hover:shadow-[0_0_45px_rgba(0,194,255,0.9)] transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
                className="px-5 py-3.5 rounded-xl font-heading font-bold text-xs sm:text-sm uppercase tracking-wider bg-black/80 hover:bg-black text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all flex items-center gap-2 cursor-pointer shadow-md"
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
                className="p-3.5 rounded-xl bg-black/80 hover:bg-black text-neutral-300 hover:text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            {/* App Store & Google Play Quick Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/15 hover:border-[#00c2ff]/50 text-[11px] font-sans text-neutral-300 transition-colors"
              >
                <span className="text-white font-bold">App Store</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[#00c2ff]">Pre-order</span>
              </a>

              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/15 hover:border-[#00c2ff]/50 text-[11px] font-sans text-neutral-300 transition-colors"
              >
                <span className="text-white font-bold">Google Play</span>
                <span className="text-neutral-500">•</span>
                <span className="text-[#00c2ff]">Pre-register</span>
              </a>
            </div>

            {/* Legal Footnote */}
            <p className="font-sans text-[11px] text-neutral-400 italic pt-1">
              Total rewards include in-game and out-of-game rewards. Actual value may vary by region.
            </p>
          </div>

          {/* ─── Right Column: Frameless Feathered Promo Artwork (5 cols) ─── */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[500px]"
            >
              {/* Soft ambient back-glow behind artwork */}
              <div className="absolute inset-0 bg-radial-gradient from-[#00c2ff]/25 via-transparent to-transparent blur-3xl pointer-events-none" />

              {/* Frameless artwork with soft gradient mask on the left (Dissolving smoothly into background) */}
              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                title="Pre-Register for PUBG MOBILE FLASH"
                className="block relative group cursor-pointer select-none focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pubgm-flash-promo.png"
                  alt="PUBG Mobile Flash - Coming Soon November 13"
                  className="w-full h-auto object-contain filter drop-shadow-[0_15px_35px_rgba(0,194,255,0.2)] transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 6%, rgba(0,0,0,0.85) 18%, black 28%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
                    maskImage:
                      'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 6%, rgba(0,0,0,0.85) 18%, black 28%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
                    WebkitMaskComposite: 'destination-in',
                    maskComposite: 'intersect',
                  }}
                />
              </a>
            </motion.div>
          </div>
        </div>

        {/* ─── Bottom Navigation: Smooth Scroll Down ─── */}
        <div className="text-center pt-8 sm:pt-12">
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