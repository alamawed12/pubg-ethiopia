'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundContext } from '../sound/SoundManager';

const FLASH_FAQS = [
  {
    q: 'What is PUBG MOBILE Flash?',
    a: 'PUBG MOBILE Flash is a high-speed, lightweight official edition designed for ultra-smooth performance, faster matchmaking, optimized storage, and competitive 90/120 FPS gameplay.',
  },
  {
    q: 'When do I receive my pre-registration rewards?',
    a: 'After pre-registering, rewards will be automatically delivered to your in-game mailbox when the game officially launches in November.',
  },
  {
    q: 'Can I play with my existing squad and friends?',
    a: 'Yes, PUBG MOBILE Flash shares the same global match servers, inventory, friends lists, and battleground lobbies as standard PUBG MOBILE.',
  },
  {
    q: 'Are there special perks for Ethiopian Community Assembly attendees?',
    a: 'Yes! Pre-registered attendees at the Addis Ababa gathering get priority access to on-site flash tournament challenges and limited physical merchandise.',
  },
];

export function PubgmFlashShowcase() {
  const { playSound } = useSoundContext();
  const [showToast, setShowToast] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleShare = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://pubggo.go.link/c6Use — Pre-register for PUBG Mobile Flash with $1,000,000 in rewards!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const toggleFaq = (index: number) => {
    playSound('click');
    setActiveFaq((prev) => (prev === index ? null : index));
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
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#050505] via-[#070e1c] to-[#050505] overflow-hidden select-none border-y border-[#00c2ff]/15"
    >
      {/* ─── Ambient Lightning Glows & Atmospheric Fog ─── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-[#00c2ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[300px] bg-[#ffe600]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 tactical-grid opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* ─── Hero Row: Native Sharp Branding + Parachute Artwork ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Native Crisp Typography & Action CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-[#00c2ff] text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,194,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
              <span>PUBGMOBILE FLASH PRE-REGISTRATION · Coming Soon</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tight uppercase leading-none">
                <span className="text-white block">PUBG MOBILE</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-[#ffe600] drop-shadow-[0_0_35px_rgba(0,194,255,0.6)]">
                  FLASH
                </span>
              </h2>

              <p className="font-heading font-black italic text-lg sm:text-2xl text-[#00c2ff] tracking-widest uppercase pt-2">
                LAUNCHES IN NOVEMBER
              </p>
            </div>

            {/* US $1,000,000 Reward Callout */}
            <div className="py-2">
              <div className="inline-block text-left">
                <div className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-[#ffe600] tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(255,230,0,0.45)]">
                  US $1,000,000
                </div>
                <div className="font-heading font-bold text-sm sm:text-lg text-neutral-300 tracking-wider uppercase mt-1">
                  IN REWARDS AWAITS — STAY TUNED!
                </div>
              </div>
            </div>

            {/* Official CTA Buttons Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Primary Pre-Register Button */}
              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="px-8 sm:px-10 py-4 rounded-xl font-heading font-black text-base sm:text-lg uppercase tracking-wider bg-[#00c2ff] hover:bg-[#38bdf8] text-black shadow-[0_0_30px_rgba(0,194,255,0.6)] hover:shadow-[0_0_45px_rgba(0,194,255,0.9)] transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
                className="px-5 py-4 rounded-xl font-heading font-bold text-xs sm:text-sm uppercase tracking-wider bg-black/70 hover:bg-black text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all flex items-center gap-2.5 cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4 text-[#00c2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Go to Official Website &gt;</span>
              </a>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                onMouseEnter={() => playSound('hover')}
                title="Share Campaign"
                aria-label="Share Campaign Link"
                className="p-4 rounded-xl bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            {/* Legal Footnote */}
            <p className="font-sans text-[11px] sm:text-xs text-neutral-400 italic">
              Total rewards include in-game and out-of-game rewards. Actual value may vary by region.
            </p>
          </div>

          {/* Right Column: Level 3 Helmet & Parachute Artwork (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Pulsing Lightning Energy Behind Art */}
            <div className="absolute inset-0 bg-radial-gradient from-[#00c2ff]/20 via-[#00c2ff]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* High-Resolution Parachute Helmet Artwork */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="relative z-10 w-full max-w-[480px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pubgm-flash-helmet-art.png"
                alt="PUBG Mobile Flash Level 3 Helmet Parachute Drop"
                className="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,194,255,0.35)] select-none"
              />
            </motion.div>
          </div>
        </div>

        {/* ─── Secondary Cards Row: Rewards Card + Gameplay Preview Card ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card 1: Pre-Register Rewards Notice */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1220]/90 border border-[#00c2ff]/25 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#00c2ff]/15 border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff] font-heading font-black text-lg">
                  ★
                </span>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
                  Pre-register to get
                </h3>
              </div>
              
              <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed">
                After pre-registering, rewards will be sent when the game officially launches.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#00c2ff]/10 border border-[#00c2ff]/20 flex items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#00c2ff] font-semibold">
                OFFICIAL PORTAL: pubggo.go.link/c6Use
              </span>
              <a
                href="https://pubggo.go.link/c6Use"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="text-xs font-heading font-bold uppercase text-[#ffe600] hover:underline whitespace-nowrap"
              >
                Claim Entry &gt;
              </a>
            </div>
          </div>

          {/* Card 2: Gameplay Preview Feature */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0b1220]/90 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-widest text-[#ffe600]">
                  OFFICIAL PREVIEW ENGINE
                </span>
                <span className="text-[11px] font-mono text-neutral-400">90/120 FPS READY</span>
              </div>

              {/* Gameplay Graphic */}
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pubgm-flash-gameplay.png"
                  alt="PUBG Mobile Flash Squad Drop Gameplay Preview"
                  className="w-full h-auto object-cover max-h-[140px] select-none"
                />
              </div>
            </div>

            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              Experience dynamic Day &amp; Night battlefield lighting with rapid asset streaming optimized for high-intensity mobile combat.
            </p>
          </div>
        </div>

        {/* ─── Interactive Section: Why choose PUBG MOBILE Flash? (FAQ Accordion) ─── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#090e1a]/95 border border-white/10 shadow-xl space-y-6">
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
              Why choose PUBG MOBILE Flash?
            </h3>
            <p className="font-sans text-xs sm:text-sm text-neutral-400">
              Tap here to learn about common questions regarding PUBG MOBILE Flash.
            </p>
          </div>

          {/* Accordion Questions */}
          <div className="divide-y divide-white/10">
            {FLASH_FAQS.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={faq.q} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 text-left font-heading font-bold text-sm sm:text-base text-neutral-200 hover:text-[#00c2ff] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="font-mono text-lg text-[#00c2ff]">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-2.5 font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Bottom Navigation: Scroll Down to Learn More ─── */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={scrollToNext}
            onMouseEnter={() => playSound('hover')}
            className="inline-flex flex-col items-center gap-1.5 text-neutral-400 hover:text-[#00c2ff] transition-colors cursor-pointer group"
          >
            <span className="font-sans text-xs sm:text-sm font-semibold tracking-wider">
              Scroll down to learn more.
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

      {/* ─── Share Toast Notification ─── */}
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