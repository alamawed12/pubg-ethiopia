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
                PUBG MOBILE
              </span>
            </div>

            <p className="text-[#999999] text-sm leading-relaxed font-body">
              The premier in-person assembly uniting competitive squads, rising
              talents, and passionate fans across Ethiopia. One community. One battleground.
            </p>

            <div className="mt-2 font-mono text-xs text-[#999999]/60 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00]/50 animate-pulse" />
              <span>{'ADDIS ABABA • 9.0249° N, 38.7469° E'}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h2 className="font-heading font-bold text-sm text-white tracking-widest uppercase">
              QUICK NAVIGATION
            </h2>
            <ul className="flex flex-col gap-2 font-mono text-xs text-[#999999]">
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
                  href="/#tournament"
                  onClick={() => handleLinkClick('/#tournament')}
                  onMouseEnter={() => playSound('hover')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5"
                >
                  {'TOURNAMENT RULES'}
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
                  className="hover:text-[#CCFF00] transition-colors duration-200 inline-block py-0.5 text-[#CCFF00]"
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
            <ul className="flex flex-col gap-2 font-mono text-xs text-[#999999]">
              <li>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>TELEGRAM COMMUNITY</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#CCFF00]">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => playSound('hover')}
                  onClick={() => playSound('click')}
                  className="hover:text-[#CCFF00] transition-colors duration-200 flex items-center justify-between group py-0.5"
                >
                  <span>DISCORD DISPATCH</span>
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
                  <span>TIKTOK CLIPS & HUBS</span>
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
              STATUS & PROTOCOLS
            </h2>
            <div className="bg-[#111111] p-3 border border-white/5 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#999999]">REGISTRATION:</span>
                <span className="text-[#CCFF00] font-bold">OPENING SOON</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#999999]">PLATFORM:</span>
                <span className="text-white">MOBILE (BYOD)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#999999]">ENTRY:</span>
                <span className="text-[#cccccc]">REGISTERED ATTENDEES</span>
              </div>
            </div>
            <p className="font-mono text-[11px] text-[#999999]/70 leading-normal">
              For partnership or squad inquiries, contact community organizers via official
              channels.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Disclaimers & Copyright ─── */}
      <div className="border-t border-white/5 bg-[#0a0a0a]/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 text-xs font-mono text-[#999999]/70">
          {/* Official Team & Community Affiliation */}
          <p className="leading-relaxed border-l-2 border-[#CCFF00] pl-3 text-[#cccccc]">
            Official PUBG MOBILE Esports Team &amp; Community Assembly Ethiopia. Organized for competitive squads and esports talent in Ethiopia. All PUBG MOBILE logos, trademarks, and game properties belong to Krafton, Inc. and Level Infinite.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div>
              &copy; {currentYear} PUBG Mobile Community Assembly Ethiopia. All rights
              reserved.
            </div>

            <div className="flex items-center gap-6">
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
