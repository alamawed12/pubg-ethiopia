'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { ParticleField } from './ParticleField';
import { useSoundContext } from '../sound/SoundManager';

export function HeroSection() {
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const { playSound } = useSoundContext();
  const [mousePos, setMousePos] = useState({ x: '50%', y: '40%' });
  const [heroDisplay, setHeroDisplay] = useState<string>('100-1000');
  const [eventDate, setEventDate] = useState<string>('COMING SOON');
  const [eventVenue, setEventVenue] = useState<string>('ADDIS ABABA, ETHIOPIA');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);

  // Fetch dynamic capacity setting configured by admin
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.heroAttendeesDisplay) {
          setHeroDisplay(data.heroAttendeesDisplay);
        } else if (data?.maxCapacity && typeof data.maxCapacity === 'number') {
          setHeroDisplay(`${data.maxCapacity}+`);
        }
        if (data?.eventDate) setEventDate(data.eventDate);
        if (data?.eventVenue) setEventVenue(data.eventVenue);
        if (data?.registrationOpen !== undefined) {
          setIsRegistrationOpen(Boolean(data.registrationOpen));
        }
      })
      .catch(() => {});
  }, []);

  // Mouse move handler for interactive ambient spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = `${((e.clientX - rect.left) / rect.width) * 100}%`;
      const y = `${((e.clientY - rect.top) / rect.height) * 100}%`;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-label="PUBG Mobile Community Assembly Ethiopia Hero"
      className="relative min-h-[100svh] w-full flex flex-col justify-between items-center overflow-hidden bg-[#050505] pt-24 pb-12 px-4 sm:px-6 md:px-12 select-none"
      style={
        {
          '--mouse-x': mousePos.x,
          '--mouse-y': mousePos.y,
        } as React.CSSProperties
      }
    >
      {/* ─── Layered Battlefield Backgrounds ─── */}
      {/* 1. Base Dark Military-Green to Abyss Radial Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1a2e1a 0%, #0a0a0a 70%)',
        }}
      />

      {/* 2. Top Subtle Green Light Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(204, 255, 0, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* 3. Interactive Desktop Mouse Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 hidden md:block"
        style={{
          background:
            'radial-gradient(650px circle at var(--mouse-x, 50%) var(--mouse-y, 40%), rgba(204, 255, 0, 0.08), transparent 70%)',
        }}
      />

      {/* 4. Particle Field Layer */}
      <ParticleField opacity={0.65} particleCount={140} />

      {/* 5. Atmospheric Fog Layers */}
      <div className="fog-layer" />
      <div className="fog-layer fog-layer-2" />

      {/* 6. Deep Vignette Border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 45%, #050505 95%)',
        }}
      />

      {/* ─── Center Hero Content ─── */}
      <div className="relative z-20 w-full max-w-5xl mx-auto my-auto flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col items-center w-full"
        >
          {/* Official PUBG Mobile Hero Logo with High-Impact Pop Glow */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8 flex justify-center relative group">
            {/* Ambient neon lime backglow behind logo */}
            <div className="absolute inset-0 bg-[#CCFF00]/25 blur-3xl rounded-full scale-125 -z-10 animate-pulse pointer-events-none" />
            <div className="absolute inset-0 bg-[#CCFF00]/15 blur-xl rounded-full scale-110 -z-10 pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/community-assembly-logo.png"
              alt="PUBG Mobile Community Assembly Ethiopia"
              className="h-24 sm:h-32 md:h-40 lg:h-44 w-auto object-contain filter drop-shadow-[0_0_35px_rgba(204,255,0,0.6)] transition-transform duration-500 hover:scale-105 select-none"
            />
          </motion.div>

          {/* Pre-heading: Official PUBGM HQ Tag */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-1.5 sm:gap-2 mb-4 px-3.5 py-1.5 rounded-full border border-[#CCFF00]/40 bg-black/60 backdrop-blur-sm max-w-full"
          >
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#CCFF00] animate-pulse shrink-0" />
            <span className="font-sans text-[11px] sm:text-xs md:text-sm font-semibold text-[#CCFF00] tracking-wider uppercase truncate">
              {'OFFICIAL PUBG MOBILE HQ • ADDIS ABABA, ETHIOPIA'}
            </span>
            <span className="inline-block w-1.5 h-3 bg-[#CCFF00] animate-pulse ml-0.5 shrink-0" />
          </motion.div>

          {/* Main Headline: Exact 3 Lines */}
          <div className="flex flex-col items-center justify-center font-heading font-black tracking-tight uppercase leading-[0.95] text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-center max-w-full">
            <motion.h1 variants={itemVariants} className="text-white drop-shadow-sm">
              PUBG MOBILE
            </motion.h1>
            <motion.div
              variants={itemVariants}
              className="text-[#CCFF00] drop-shadow-[0_0_35px_rgba(204,255,0,0.35)] py-1 md:py-2 break-words"
            >
              COMMUNITY ASSEMBLY
            </motion.div>
            <motion.div variants={itemVariants} className="text-[#cccccc] drop-shadow-sm">
              ETHIOPIA
            </motion.div>
          </div>

          {/* Supporting Copy */}
          <motion.p
            variants={itemVariants}
            className="mt-6 md:mt-8 max-w-2xl text-base sm:text-lg text-[#cccccc] leading-relaxed font-body font-normal text-center"
          >
            &ldquo;Bringing Ethiopia&rsquo;s PUBG MOBILE community together through competition, collaboration, and a shared vision for the future of esports.&rdquo;
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md sm:max-w-none"
          >
            {/* Primary Button */}
            <Link
              href="/register"
              onClick={() => playSound('click')}
              onMouseEnter={() => playSound('hover')}
              className={`relative group overflow-hidden w-full sm:w-auto px-8 py-4 font-heading font-bold text-base md:text-lg tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center rounded-xl ${
                !isRegistrationOpen
                  ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
                  : 'bg-[#CCFF00] text-[#050505] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>{isRegistrationOpen ? 'REGISTER NOW' : 'REGISTRATION ON HOLD'}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </Link>

            {/* Secondary Ghost Button -> Scrolls to Assembly Program Section */}
            <a
              href="#assembly"
              onClick={() => playSound('click')}
              onMouseEnter={() => playSound('hover')}
              className="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-[#CCFF00] bg-black/40 hover:bg-[#CCFF00]/5 text-white hover:text-[#CCFF00] font-heading font-bold text-base md:text-lg tracking-wider uppercase transition-all duration-300 backdrop-blur-sm text-center rounded-xl"
            >
              EXPLORE THE PROGRAM
            </a>
          </motion.div>

          {/* Three Key Data Points */}
          <motion.div
            variants={itemVariants}
            className="mt-12 md:mt-16 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl shadow-black/50"
          >
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-white/10 px-4">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-[#CCFF00] tracking-tight whitespace-nowrap">
                {heroDisplay}
              </span>
              <span className="font-sans text-xs font-semibold text-neutral-400 tracking-wider uppercase mt-1.5">
                EXPECTED ATTENDEES
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-white/10 px-4">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                ESPORTS
              </span>
              <span className="font-sans text-xs font-semibold text-neutral-400 tracking-wider uppercase mt-1.5">
                TOURNAMENT
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center px-4">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-[#cccccc] tracking-tight">
                ADDIS ABABA
              </span>
              <span className="font-sans text-xs font-semibold text-neutral-400 tracking-wider uppercase mt-1.5">
                ETHIOPIA
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Hero Footer / Coming Soon Status & Scroll Indicator ─── */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
        {/* Status Labels */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 md:gap-8 font-sans text-xs text-neutral-400 font-medium tracking-wide">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            <span>DATE: <strong className="text-white font-semibold">{eventDate}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            <span>VENUE: <strong className="text-white font-semibold">{eventVenue}</strong></span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 font-sans text-xs font-semibold text-neutral-400 hover:text-[#CCFF00] tracking-wider uppercase transition-colors group cursor-pointer"
          aria-label="Scroll down"
        >
          <span>SCROLL</span>
          <svg
            className="w-4 h-4 text-[#CCFF00] animate-bounce transition-transform duration-300 group-hover:translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default HeroSection;
