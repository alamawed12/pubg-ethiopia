'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundContext } from '../sound/SoundManager';
import { useTheme } from '../theme/ThemeContext';

export function PubgmFlashShowcase() {
  const { playSound } = useSoundContext();
  const { isLight } = useTheme();

  const [isPreRegistered, setIsPreRegistered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ignInput, setIgnInput] = useState('');
  const [uidInput, setUidInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleOpenModal = () => {
    playSound('click');
    setModalOpen(true);
  };

  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uidInput.trim()) {
      setFeedbackMessage('Please enter your PUBG Mobile UID.');
      return;
    }
    playSound('success');
    setIsPreRegistered(true);
    setFeedbackMessage('⚡ Congratulations! You are pre-registered for PUBG Mobile Flash with exclusive rewards reserved!');
    setTimeout(() => {
      setModalOpen(false);
    }, 2800);
  };

  const handleShare = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://pubgmobile.com — Pre-register for PUBG Mobile Flash with $1,000,000 in rewards!');
      alert('Campaign link copied to clipboard! Share with your squad on Telegram / Discord.');
    }
  };

  return (
    <section
      id="flash"
      className={`relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-500 overflow-hidden ${
        isLight
          ? 'bg-gradient-to-b from-[#e0f2fe]/60 via-[#f0f9ff] to-[#ffffff]'
          : 'bg-[#0a0a0a]'
      }`}
    >
      {/* Electric Lightning & Cyan Atmospheric Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00c2ff]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[200px] bg-[#ffe600]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ─── Header Badge & Teaser Intro ─── */}
        <div className="text-center space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-[#00c2ff] text-xs font-sans font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(0,194,255,0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#00c2ff] animate-ping" />
            <span>OFFICIAL GLOBAL LAUNCH • NOVEMBER 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight uppercase">
            <span className={isLight ? 'text-slate-900' : 'text-white'}>PUBG MOBILE </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c2ff] via-[#38bdf8] to-[#ffe600] drop-shadow-[0_0_25px_rgba(0,194,255,0.5)]">
              FLASH
            </span>
          </h2>

          <p className="font-sans text-sm sm:text-base font-semibold tracking-wider italic text-[#00c2ff]">
            LAUNCHES IN NOVEMBER — US $1,000,000 IN REWARDS AWAITS
          </p>
        </div>

        {/* ─── Hero Poster Banner Card (Match reference image exactly) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-[#00c2ff]/30 shadow-[0_20px_60px_rgba(0,194,255,0.15)] bg-slate-950 group"
        >
          {/* Main Banner Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pubgm-flash-banner.png"
            alt="PUBG Mobile Flash - Launches in November - US $1,000,000 In Rewards"
            className="w-full h-auto object-cover max-h-[640px] select-none"
          />

          {/* Interactive Action Bar Overlay along the bottom of the card */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-heading font-black text-xs sm:text-sm text-[#ffe600] uppercase tracking-wider block">
                ★ EXCLUSIVE ETHIOPIAN COMMUNITY REWARDS POOL
              </span>
              <p className="font-sans text-xs sm:text-sm text-neutral-300 font-medium">
                Early pre-registrations receive guaranteed in-game crates &amp; VIP priority access.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              {/* Pre-Register Button */}
              <button
                type="button"
                onClick={handleOpenModal}
                className="px-8 py-3.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider bg-[#00c2ff] hover:bg-[#38bdf8] text-black shadow-[0_0_30px_rgba(0,194,255,0.5)] hover:shadow-[0_0_40px_rgba(0,194,255,0.8)] transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>{isPreRegistered ? '✓ PRE-REGISTERED' : 'PRE-REGISTER NOW'}</span>
                <span>&gt;</span>
              </button>

              {/* Official Website Pill */}
              <a
                href="https://pubgmobile.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => playSound('click')}
                className="px-5 py-3.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-black/80 hover:bg-black text-white border border-white/20 transition-all flex items-center gap-2 hover:border-[#00c2ff]/60"
              >
                <svg className="w-4 h-4 text-[#00c2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>OFFICIAL SITE &gt;</span>
              </a>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                title="Share Campaign"
                className="p-3.5 rounded-xl bg-black/80 hover:bg-black text-neutral-300 hover:text-white border border-white/20 hover:border-[#00c2ff]/60 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ─── Highlights Row with Color Combo (Cyan, Gold, Deep Navy) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white/90 border-[#00c2ff]/20 shadow-[0_10px_30px_rgba(0,194,255,0.06)]'
                : 'bg-[#111111] border-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#00c2ff]/15 border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff] mb-4">
              <span className="font-heading font-black text-lg">$1M</span>
            </div>
            <h3 className={`font-heading font-bold text-lg uppercase mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              $1,000,000 REWARD CHALLENGE
            </h3>
            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              Global prize pools, in-game mythical skins, and tournament incentives for competitive mobile players.
            </p>
          </div>

          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white/90 border-[#ffe600]/30 shadow-[0_10px_30px_rgba(255,230,0,0.06)]'
                : 'bg-[#111111] border-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffe600]/15 border border-[#ffe600]/30 flex items-center justify-center text-[#ffe600] mb-4">
              <span className="font-heading font-black text-lg">⚡</span>
            </div>
            <h3 className={`font-heading font-bold text-lg uppercase mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              FLASH DAYLIGHT ENGINE
            </h3>
            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              Experience dynamic Day / Night battlefield lighting matching the new Erangel daylight aesthetic.
            </p>
          </div>

          <div
            className={`p-6 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white/90 border-[#00c2ff]/20 shadow-[0_10px_30px_rgba(0,194,255,0.06)]'
                : 'bg-[#111111] border-white/10'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#00c2ff]/15 border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff] mb-4">
              <span className="font-heading font-black text-lg">ET</span>
            </div>
            <h3 className={`font-heading font-bold text-lg uppercase mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ETHIOPIA ASSEMBLY INTEGRATION
            </h3>
            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              Pre-registered players at the Addis Ababa gathering get exclusive physical merchandise and custom badges.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Pre-Registration Modal ─── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-[#00c2ff]/40 text-white shadow-[0_0_50px_rgba(0,194,255,0.3)] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c2ff] animate-ping" />
                  <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider">
                    PUBG MOBILE FLASH PRE-REGISTRATION
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {feedbackMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-sans border ${
                    isPreRegistered
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {feedbackMessage}
                </div>
              )}

              {!isPreRegistered ? (
                <form onSubmit={handlePreRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      PUBG MOBILE IN-GAME NAME (IGN)
                    </label>
                    <input
                      type="text"
                      value={ignInput}
                      onChange={(e) => setIgnInput(e.target.value)}
                      placeholder="e.g. FLASH_WARRIOR"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white font-sans text-sm outline-none focus:border-[#00c2ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                      PUBG MOBILE NUMERIC UID *
                    </label>
                    <input
                      type="text"
                      value={uidInput}
                      onChange={(e) => setUidInput(e.target.value)}
                      placeholder="e.g. 5123456789"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-white font-sans text-sm outline-none focus:border-[#00c2ff]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-xs font-sans text-neutral-300 space-y-1">
                    <p className="font-bold text-[#00c2ff]">REWARDS RESERVED FOR YOU:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-neutral-300">
                      <li>Exclusive Flash Helmet Parachute Skin</li>
                      <li>Entry into $1,000,000 Global Challenge Pool</li>
                      <li>VIP Fast-track check-in badge at Ethiopia Assembly</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl font-heading font-black text-sm uppercase tracking-wider bg-[#00c2ff] hover:bg-[#38bdf8] text-black shadow-lg transition-all cursor-pointer"
                    >
                      CONFIRM FLASH PRE-REGISTRATION
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#00c2ff]/20 border-2 border-[#00c2ff] flex items-center justify-center text-2xl mx-auto">
                    ✓
                  </div>
                  <h4 className="font-heading font-black text-lg text-white uppercase">
                    SLOT SECURED
                  </h4>
                  <p className="font-sans text-xs text-neutral-300">
                    Your account is registered for PUBG Mobile Flash with the Ethiopia Assembly priority tier.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
