import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RegistrationForm } from '@/components/registration/RegistrationForm';

export const metadata: Metadata = {
  title: 'Secure Registration | PUBG MOBILE Community Assembly Ethiopia',
  description:
    'Complete the official registration for the PUBG MOBILE Community Assembly Ethiopia. Secure your digital pass, compete in tournaments, and connect with the community.',
  openGraph: {
    title: 'Register | PUBG MOBILE Community Assembly Ethiopia',
    description:
      'Join Ethiopia’s premier PUBG MOBILE gathering. Free registration, limited to 300 players.',
  },
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen w-full bg-[var(--color-abyss,#0a0a0a)] text-white overflow-x-hidden selection:bg-[var(--color-lime,#CCFF00)] selection:text-black">
      {/* Background Ambience: Tactical Grid & Fog Overlays */}
      <div className="fixed inset-0 tactical-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--color-military)_0%,_transparent_65%)]" />

      {/* Decorative top radioactive glow sweep */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-[var(--color-lime,#CCFF00)] to-transparent opacity-60 shadow-[0_0_15px_rgba(204,255,0,0.8)]" />

      {/* Main Registration Container */}
      <main className="relative z-10 mx-auto max-w-2xl px-3 sm:px-6 pt-10 pb-24 md:pt-20 md:pb-32 w-full overflow-x-hidden">
        {/* Navigation Return Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-silver,#999999)] hover:text-[var(--color-lime,#CCFF00)] transition-colors group"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>RETURN TO HQ</span>
          </Link>
        </div>

        {/* Page Header */}
        <header className="mb-10 text-center space-y-3">
          <div className="flex justify-center mb-4 relative">
            <div className="absolute inset-0 bg-[#CCFF00]/20 blur-2xl rounded-full scale-110 pointer-events-none" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/community-assembly-logo.png"
              alt="PUBG Mobile Community Assembly Ethiopia"
              className="relative h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--color-lime,#CCFF00)]/30 bg-[var(--color-lime,#CCFF00)]/10 px-2.5 sm:px-3 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-widest text-[var(--color-lime,#CCFF00)] max-w-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime,#CCFF00)] animate-pulse shrink-0" />
            <span className="truncate">OFFICIAL PUBG MOBILE TEAM REGISTRATION • LIMITED CAPACITY</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight sm:tracking-wider text-white break-words">
            SECURE YOUR <span className="text-[var(--color-lime,#CCFF00)]">REGISTRATION</span>
          </h1>

          <p className="mx-auto max-w-lg text-sm sm:text-base text-[var(--color-silver,#999999)] font-body">
            Complete the steps below to register for the PUBG MOBILE Community Assembly Ethiopia.
            Receive your verified QR digital entry pass upon confirmation.
          </p>
        </header>

        {/* Multi-step Registration Form */}
        <RegistrationForm />

        {/* Bottom Legal / Privacy Notice */}
        <footer className="mt-12 text-center text-xs font-mono text-[var(--color-silver,#999999)]/80 space-y-2 border-t border-white/5 pt-8">
          <p>
            By submitting this registration, you agree to the collection and handling of your information as outlined in our{' '}
            <Link
              href="/privacy"
              className="text-[var(--color-lime,#CCFF00)] underline hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-[11px] text-white/30">
            PUBG MOBILE Ethiopian Community Assembly • Addis Ababa • All Rights Reserved
          </p>
        </footer>
      </main>
    </div>
  );
}
