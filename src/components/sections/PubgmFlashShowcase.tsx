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
    const heroEl = document.getElementById('hero') || document.getElementById('assembly');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof window !== 'undefined') {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="flash"
      aria-label="PUBG Mobile Flash Official Launch"
      className="relative w-full overflow-hidden bg-[#99d6ff] select-none"
    >
      {/* ─── Sky Background Gradient for ultra-wide monitors ─── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eef7ff] via-[#d6efff] to-[#99d6ff] pointer-events-none" />

      {/* ─── Full-Bleed Edge-to-Edge Hero Canvas (Exactly like pubgmobile.com) ─── */}
      <div className="relative w-full max-w-[1920px] mx-auto pt-14 sm:pt-16 md:pt-20">
        {/* Main Flash Graphic Image (100% full width, 0 frame, 0 border, 0 rounded corners) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pubgm-flash-banner.png"
          alt="PUBG Mobile Flash - Launches in November - US $1,000,000 In Rewards"
          className="w-full h-auto object-cover block select-none"
        />

        {/* ─── Interactive Overlay Hotspots ─── */}
        {/* 1. Hotspot: "PRE-REGISTER NOW >" Button -> links directly to https://pubggo.go.link/c6Use */}
        <a
          href="https://pubggo.go.link/c6Use"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click')}
          onMouseEnter={() => playSound('hover')}
          aria-label="Pre-Register Now for PUBG Mobile Flash"
          title="Pre-Register Now: https://pubggo.go.link/c6Use"
          style={{
            position: 'absolute',
            left: '41.5%',
            top: '72.5%',
            width: '16.5%',
            height: '11%',
          }}
          className="group cursor-pointer rounded-sm focus:outline-none transition-all block z-20"
        >
          {/* Subtle electric cyan pulse effect over the button */}
          <span className="absolute inset-0 bg-[#00c2ff]/0 group-hover:bg-[#00c2ff]/25 rounded-sm transition-all shadow-[0_0_20px_rgba(0,194,255,0)] group-hover:shadow-[0_0_35px_rgba(0,194,255,0.7)]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffe600] animate-ping opacity-75 group-hover:opacity-100" />
        </a>

        {/* 2. Hotspot: "GO TO OFFICIAL WEBSITE >" Pill */}
        <a
          href="https://pubgmobile.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click')}
          onMouseEnter={() => playSound('hover')}
          aria-label="Go to Official Website"
          title="Go to Official PUBG Mobile Website"
          style={{
            position: 'absolute',
            left: '44.8%',
            top: '86.5%',
            width: '8.8%',
            height: '5.5%',
          }}
          className="group cursor-pointer rounded-full focus:outline-none z-20"
        >
          <span className="absolute inset-0 rounded-full group-hover:bg-white/15 transition-all shadow-[0_0_15px_rgba(255,255,255,0)] group-hover:shadow-[0_0_15px_rgba(0,194,255,0.4)]" />
        </a>

        {/* 3. Hotspot: Share Button */}
        <button
          type="button"
          onClick={handleShare}
          onMouseEnter={() => playSound('hover')}
          aria-label="Share Campaign"
          title="Share Campaign Link"
          style={{
            position: 'absolute',
            left: '54.5%',
            top: '86.5%',
            width: '2.5%',
            height: '5.5%',
          }}
          className="group cursor-pointer rounded-md focus:outline-none z-20"
        >
          <span className="absolute inset-0 rounded-md group-hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(0,194,255,0.4)]" />
        </button>

        {/* 4. Hotspot: "SCROLL DOWN TO LEARN MORE" */}
        <button
          type="button"
          onClick={scrollToNext}
          onMouseEnter={() => playSound('hover')}
          aria-label="Scroll down to explore Ethiopian Community Assembly"
          title="Scroll Down"
          style={{
            position: 'absolute',
            left: '43%',
            top: '92.5%',
            width: '14%',
            height: '7%',
          }}
          className="group cursor-pointer focus:outline-none flex flex-col items-center justify-end z-20"
        >
          <span className="absolute inset-0 group-hover:bg-[#00c2ff]/10 rounded transition-all" />
        </button>
      </div>

      {/* ─── Mobile Fallback Quick-Action Bar (Clean, unobtrusive on small phones) ─── */}
      <div className="sm:hidden px-4 py-3 bg-[#0d1624] border-t border-[#00c2ff]/20 flex items-center justify-between gap-3 relative z-20">
        <a
          href="https://pubggo.go.link/c6Use"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click')}
          className="flex-1 py-2.5 px-3 rounded-lg bg-[#00c2ff] text-black font-heading font-black text-xs uppercase tracking-wider text-center shadow-[0_0_15px_rgba(0,194,255,0.4)] active:scale-95 transition-transform block"
        >
          PRE-REGISTER NOW &gt;
        </a>

        <a
          href="https://pubgmobile.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playSound('click')}
          className="py-2.5 px-3 rounded-lg bg-black/60 text-white border border-white/20 font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap"
        >
          OFFICIAL SITE &gt;
        </a>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="p-2.5 rounded-lg bg-black/60 text-neutral-300 border border-white/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* ─── Smooth Transition into the Dark Battlefield Atmosphere ─── */}
      <div className="w-full h-16 sm:h-24 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] pointer-events-none -mt-8 sm:-mt-12 relative z-10" />

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