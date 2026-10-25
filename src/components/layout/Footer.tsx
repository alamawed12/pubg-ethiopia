'use client';

import React from 'react';
import Link from 'next/link';
import { useSoundContext } from '../sound/SoundManager';

export function Footer() {
  const { playSound } = useSoundContext();

  return (
    <footer className="w-full bg-[#0d0d0f] border-t border-white/5 select-none relative z-20 text-neutral-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
          
          {/* ─── Left Column: Partner Logos, Copyright & Legal Links ─── */}
          <div className="flex flex-col gap-4 max-w-2xl">
            {/* Publisher & Studio Logos (Krafton, Level Infinite, Lightspeed) */}
            <div className="mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/krafton-level-infinite-lightspeed.png"
                alt="KRAFTON | LEVEL INFINITE | LIGHTSPEED STUDIOS"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Dual Official Copyright Lines */}
            <div className="text-[12px] sm:text-[13px] text-neutral-400 font-normal leading-relaxed space-y-0.5">
              <p>&copy; 2026 KRAFTON, Inc. ALL RIGHTS RESERVED.</p>
              <p>&copy; 2019-2026 Proxima Beta Pte. Limited. ALL RIGHTS RESERVED.</p>
            </div>

            {/* Policy & Legal Links separated by pipes */}
            <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-[12px] text-neutral-400 pt-1">
              <Link
                href="/privacy"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-neutral-600">|</span>
              <a
                href="#cookies"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                onMouseEnter={() => playSound('hover')}
                className="hover:text-white transition-colors"
              >
                Cookies Policy
              </a>
              <span className="text-neutral-600">|</span>
              <a
                href="#user-agreement"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                onMouseEnter={() => playSound('hover')}
                className="hover:text-white transition-colors"
              >
                User Agreement
              </a>
              <span className="text-neutral-600">|</span>
              <a
                href="#law-enforcement"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                onMouseEnter={() => playSound('hover')}
                className="hover:text-white transition-colors"
              >
                Law Enforcement Requests
              </a>
              <span className="text-neutral-600">|</span>
              <a
                href="#open-source"
                onClick={(e) => {
                  e.preventDefault();
                  playSound('click');
                }}
                onMouseEnter={() => playSound('hover')}
                className="hover:text-white transition-colors"
              >
                Open Source
              </a>
            </div>
          </div>

          {/* ─── Right Column: Follow Us, Social Icons & Inquiries ─── */}
          <div className="flex flex-col gap-3 lg:items-end">
            <h4 className="font-sans font-bold text-[12px] tracking-wider text-neutral-300 uppercase">
              FOLLOW US
            </h4>

            {/* Social Media Square Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/PUBGMOBILE"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="Facebook"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/PUBGMOBILE"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/c/PUBGMOBILE"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="YouTube"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/pubgmobile"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="Instagram"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Reddit */}
              <a
                href="https://www.reddit.com/r/PUBGMobile"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="Reddit"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/73xvuBch"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="Discord"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-white/5 flex items-center justify-center text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              {/* Telegram Channel */}
              <a
                href="https://t.me/pubgm_eth"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                aria-label="Official Telegram Channel"
                title="Official Telegram Channel: @pubgm_eth"
                className="w-8 h-8 rounded bg-[#202124] hover:bg-[#2b2d32] border border-[#00c2ff]/30 flex items-center justify-center text-[#00c2ff] transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.942z" />
                </svg>
              </a>
            </div>

            {/* Official Support & Inquiries */}
            <div className="text-[11px] sm:text-[12px] text-neutral-400 space-y-0.5 lg:text-right mt-1">
              <div>
                <span>Official Support: </span>
                <a
                  href="mailto:support.pmcaethiopia@gmail.com"
                  className="text-neutral-300 hover:text-white transition-colors font-medium"
                >
                  support.pmcaethiopia@gmail.com
                </a>
                <span className="text-neutral-600 mx-1.5">•</span>
                <a
                  href="https://t.me/pubgmethsupport"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00c2ff] hover:underline"
                >
                  @pubgmethsupport
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;