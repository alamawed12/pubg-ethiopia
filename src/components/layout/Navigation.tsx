'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundContext } from '../sound/SoundManager';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'HOME', href: '/#hero' },
  { label: 'THE ASSEMBLY', href: '/#assembly' },
  { label: 'TOURNAMENT', href: '/#tournament' },
  { label: 'FAQ', href: '/#faq' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMuted, toggleMute, playSound } = useSoundContext();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      playSound('click');
      const hash = href.includes('#') ? '#' + href.split('#')[1] : null;
      if (hash && (window.location.pathname === '/' || window.location.pathname === '')) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          setIsMobileMenuOpen(false);
          return;
        }
      }
      setIsMobileMenuOpen(false);
    },
    [playSound]
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-3'
            : 'bg-transparent border-b border-transparent py-5 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* ─── Left: Wordmark ─── */}
          <Link
            href="/"
            onClick={() => playSound('click')}
            onMouseEnter={() => playSound('hover')}
            className="group flex items-center gap-2 cursor-pointer select-none"
            aria-label="PUBG Mobile Community Assembly Ethiopia"
          >
            <div className="w-2.5 h-2.5 bg-[#CCFF00] rotate-45 transition-transform duration-300 group-hover:scale-125 group-hover:shadow-[0_0_10px_#CCFF00]" />
            <span className="font-heading font-black tracking-wider text-[#CCFF00] uppercase drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
              {/* Short version on mobile and tablets */}
              <span className="inline xl:hidden text-lg sm:text-xl">
                {'PMCA '}<span className="text-white/40">{'//'}</span>{' ETHIOPIA'}
              </span>
              {/* Full long version on large screens */}
              <span className="hidden xl:inline text-lg xl:text-xl">
                {'PUBG MOBILE COMMUNITY ASSEMBLY '}<span className="text-white/40">{'//'}</span>{' ETHIOPIA'}
              </span>
            </span>
          </Link>

          {/* ─── Center: Desktop Navigation Links ─── */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-8 lg:gap-10"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                onMouseEnter={() => playSound('hover')}
                className="relative py-1 font-mono text-xs lg:text-sm tracking-widest text-[#cccccc] hover:text-white transition-colors duration-200 group uppercase"
              >
                <span>{item.label}</span>
                {/* Underline growing from center */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#CCFF00] transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_8px_#CCFF00]" />
              </a>
            ))}
          </nav>

          {/* ─── Right: Audio Toggle + Register Button + Mobile Menu Button ─── */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleMute();
                playSound('click');
              }}
              onMouseEnter={() => playSound('hover')}
              aria-label={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
              title={isMuted ? 'Turn Sound ON' : 'Mute Audio'}
              className="p-2 rounded border border-white/10 hover:border-[#CCFF00]/50 bg-black/40 hover:bg-[#CCFF00]/10 text-[#999999] hover:text-[#CCFF00] transition-all duration-200 cursor-pointer"
            >
              {isMuted ? (
                /* Muted Speaker Icon */
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                /* Active Speaker Icon with Waves */
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-[#CCFF00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>

            {/* Desktop Register Button */}
            <Link
              href="/register"
              onClick={() => playSound('click')}
              onMouseEnter={() => playSound('hover')}
              className="hidden sm:inline-flex items-center justify-center px-4 md:px-5 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#050505] font-heading font-black text-xs md:text-sm tracking-wider uppercase transition-all duration-200 hover:shadow-[0_0_15px_rgba(204,255,0,0.4)] active:scale-95 cursor-pointer"
              style={{
                clipPath:
                  'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
            >
              REGISTER
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsMobileMenuOpen((prev) => !prev);
              }}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="md:hidden p-2 text-[#cccccc] hover:text-[#CCFF00] transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Full-Screen Overlay Navigation ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-2xl flex flex-col justify-between p-6 md:hidden select-none"
          >
            {/* Top Bar inside Mobile Menu */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-heading font-black text-xl tracking-wider text-[#CCFF00] uppercase">
                {'PMCA '}<span className="text-white/40">{'//'}</span>{' ETHIOPIA'}
              </span>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 text-[#999999] hover:text-white"
                aria-label="Close Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links in Center */}
            <nav className="flex flex-col items-center justify-center gap-6 my-auto">
              {NAV_ITEMS.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="font-heading font-black text-3xl sm:text-4xl text-[#cccccc] hover:text-[#CCFF00] tracking-wider uppercase transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Bottom Actions inside Mobile Menu */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
              <Link
                href="/register"
                onClick={() => {
                  playSound('click');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 text-center bg-[#CCFF00] text-[#050505] font-heading font-black text-base tracking-widest uppercase hover:bg-[#b8e600] transition-colors"
              >
                REGISTER NOW
              </Link>

              <div className="flex items-center justify-between text-xs font-mono text-[#999999]">
                <span>TACTICAL AUDIO:</span>
                <button
                  type="button"
                  onClick={() => {
                    toggleMute();
                    playSound('click');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 text-[#CCFF00]"
                >
                  <span>{isMuted ? 'OFF (MUTED)' : 'ACTIVE (UNMUTED)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;
