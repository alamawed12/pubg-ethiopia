'use client';

import React from 'react';
import Link from 'next/link';
import { useSoundContext } from '../sound/SoundManager';

export function Footer() {
  const { playSound } = useSoundContext();

  const currentYear = new Date().getFullYear();

  const handleLinkClick = (href: string) => {
    playSound('click');
    const hash = href.includes('#') ? '#' + href.split('#')[1] : null;
    if (hash && typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="w-full bg-[#050505] border-t border-white/5 select-none relative z-20">
      {/* ─── Top Section ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pubg-mobile-logo.png"
                alt="PUBG Mobile"
                className="h-9 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]"
              />
              <span className="font-heading font-black tracking-wider text-[#CCFF00] uppercase text-lg">
                COMMUNITY ASSEMBLY
              </span>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed font-sans">
              The premier in-person assembly uniting competitive squads, rising
              talents, and passionate fans across Ethiopia. One community. One battleground.
            </p>

            <div className="mt-2 font-sans text-xs text-neutral-400 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              <span>{'ADDIS ABABA • 9.0249° N, 38.7469° E'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-bold text-sm text-white tracking-widest uppercase">
              QUICK NAVIGATION
            </h2>
            <ul className="flex flex-col gap-2 font-sans text-xs text-neutral-400 font-medium">
              <li>
                <Link
                  href="/#hero"
                  onClick={() => handleLinkClick('/#hero')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'HOME'}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={() => handleLinkClick('/register')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'REGISTRATION'}
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  onClick={() => playSound('click')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'MY TICKET & PASS'}
                </Link>
              </li>
              <li>
                <Link
                  href="/#assembly"
                  onClick={() => handleLinkClick('/#assembly')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'COMMUNITY GATHERING'}
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  onClick={() => handleLinkClick('/#faq')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'FREQUENTLY ASKED'}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  onClick={() => playSound('click')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5 text-[#CCFF00] font-semibold"
                >
                  {'REGISTRATION PORTAL'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community Channels */}
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-bold text-sm text-white tracking-widest uppercase">
              COMMUNITY CHANNELS
            </h2>
            <ul className="flex flex-col gap-2 font-sans text-xs text-neutral-400 font-medium">
              <li>
                <a
                  href="https://t.me/pubgmethsupport"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>TELEGRAM SUPPORT</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/73xvuBch"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>DISCORD SERVER</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/pubgm_eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>TELEGRAM CHANNEL</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>TIKTOK CLIPS &amp; HUBS</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>YOUTUBE BROADCASTS</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>INSTAGRAM UPDATES</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Event Status & Advisory */}
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-bold text-sm text-white tracking-widest uppercase">
              STATUS &amp; PROTOCOLS
            </h2>
            <div className="bg-[#111111] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">REGISTRATION:</span>
                <span className="text-[#CCFF00] font-bold">OPEN / LIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">PLATFORM:</span>
                <span className="text-white font-medium">MOBILE (BYOD)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">ENTRY:</span>
                <span className="text-neutral-200 font-medium">REGISTERED ATTENDEES</span>
              </div>
            </div>
            <p className="font-sans text-xs text-neutral-400 leading-relaxed">
              Official inquiries and partnership questions can be submitted via verified community channels.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Disclaimers & Copyright ─── */}
      <div className="border-t border-white/5 bg-[#0a0a0a]/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 text-xs font-sans text-neutral-400">
          {/* Official PUBGM HQ Affiliation & Ownership Statement */}
          <div className="leading-relaxed border-l-2 border-[#CCFF00] pl-3 text-neutral-300">
            <p className="font-semibold text-white mb-0.5">
              Official PUBG MOBILE Community Assembly Ethiopia • Controlled and Organized under PUBG MOBILE HQ
            </p>
            <p className="text-neutral-400">
              This event, registration system, tournament operations, and community assemblies are officially operated and administered under PUBG MOBILE HQ. All PUBG MOBILE marks, logos, and materials belong to PUBG MOBILE HQ and Krafton, Inc.
            </p>
          </div>

          {/* Bottom Left Logos & Bottom Right Links */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-3 border-t border-white/5">
            {/* Left Bottom: Official Publisher & Studio Logos */}
            <div className="flex flex-col items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/krafton-partner-logos.png"
                alt="KRAFTON | LEVEL INFINITE | LIGHTSPEED STUDIOS"
                className="h-9 sm:h-10 md:h-11 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
              />
              <div className="text-[11px] text-neutral-400 font-medium">
                &copy; {currentYear} PUBG Mobile Community Assembly Ethiopia. Officially controlled by PUBG MOBILE HQ. All rights reserved.
              </div>
            </div>

            {/* Right Bottom: Navigation & Policy Links */}
            <div className="flex flex-wrap items-center gap-6 font-medium text-xs self-start lg:self-center">
              <Link
                href="/privacy"
                onClick={() => playSound('click')}
                className="hover:text-[#CCFF00] transition-colors"
              >
                PRIVACY POLICY
              </Link>
              <span className="text-white/20">/</span>
              <a
                href="#terms"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                className="hover:text-[#CCFF00] transition-colors"
              >
                TERMS OF EVENT
              </a>
              <span className="text-white/20">/</span>
              <a
                href="#conduct"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                className="hover:text-[#CCFF00] transition-colors"
              >
                CODE OF CONDUCT
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
