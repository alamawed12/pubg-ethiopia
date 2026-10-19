'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EventPass } from './EventPass';
import { Button } from '@/components/ui/Button';

export interface RegistrationSuccessData {
  referenceId: string;
  fullName: string;
  inGameName: string;
  category: string;
  status: string;
  ticketTier?: string;
  vipPrice?: number;
  paymentMethod?: string;
  paymentTxnCode?: string;
  telegramUsername?: string;
  paymentStatus?: string;
  qrToken?: string;
  qrDataUrl?: string;
}

export interface RegistrationSuccessProps {
  registrationData: RegistrationSuccessData;
}

export function RegistrationSuccess({ registrationData }: RegistrationSuccessProps) {
  const isVip = registrationData.ticketTier?.toUpperCase() === 'VIP';
  const isConfirmed = registrationData.status?.toUpperCase() === 'CONFIRMED';
  const isVipPending = isVip && !isConfirmed;

  // Trigger pass image download
  const handleDownload = () => {
    const passDownloadTrigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Download pass"], button:has(svg)'
    );
    if (passDownloadTrigger) {
      passDownloadTrigger.click();
    } else if (registrationData.qrDataUrl) {
      const link = document.createElement('a');
      link.href = registrationData.qrDataUrl;
      link.download = `PUBG-${isVip ? 'VIP-' : ''}PASS-${registrationData.referenceId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ─── VIP PASS PENDING VERIFICATION SCREEN ─────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (isVipPending) {
    const telegramClean = registrationData.telegramUsername?.replace(/^@/, '') || '';
    const telegramLink = telegramClean ? `https://t.me/${telegramClean}` : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center py-6 px-4 max-w-2xl mx-auto"
      >
        {/* Animated Amber Gold Shield Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <svg
            className="h-10 w-10 text-amber-400 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        {/* Status Pill */}
        <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-heading font-black text-xs tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>PAYMENT VERIFICATION IN PROGRESS</span>
        </div>

        {/* Heading */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          VIP REGISTRATION SUBMITTED
        </h2>

        <p className="mt-2 text-sm sm:text-base text-neutral-300 max-w-lg mx-auto">
          Your payment transaction has been logged. Our Head Admin will confirm receipt with our bank/Telebirr records and dispatch your official ticket directly to your Telegram.
        </p>

        {/* Official Reference Number Box */}
        <div className="mt-6 mb-8 inline-block rounded-lg bg-black/60 px-6 py-3.5 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="block font-mono text-[11px] uppercase tracking-widest text-amber-300/80 mb-1">
            OFFICIAL VIP REGISTRATION REFERENCE
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-amber-400">
            REF: {registrationData.referenceId}
          </span>
        </div>

        {/* ─── VIP Transaction Log Card ─── */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1c1810] via-[#12100d] to-[#0a0805] p-5 sm:p-6 text-left shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <span className="font-heading font-bold text-sm tracking-wider uppercase text-amber-400 flex items-center gap-2">
              <span>⭐</span> VIP TRANSACTION LOG
            </span>
            <span className="font-mono text-xs text-amber-300 font-bold">
              {registrationData.vipPrice || 500} ETB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">ATTENDEE</span>
              <span className="text-white font-bold text-sm">{registrationData.fullName}</span>
              <span className="text-amber-400 text-xs block">IGN: {registrationData.inGameName}</span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">PAYMENT METHOD</span>
              <span className="text-white font-bold text-sm uppercase">
                {registrationData.paymentMethod === 'AWASH_BANK'
                  ? 'Awash Bank (Tsige Dagne)'
                  : 'Telebirr (Alamawed Begashawe)'}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">TRANSACTION CODE / REF</span>
              <span className="text-amber-400 font-bold text-sm break-all">
                {registrationData.paymentTxnCode || 'LOGGED FOR VERIFICATION'}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">DELIVERY TELEGRAM</span>
              <span className="text-white font-bold text-sm">
                {registrationData.telegramUsername || 'Contact Recorded'}
              </span>
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 font-body text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 block font-mono text-[11px] uppercase mb-1">
              🛡️ WHAT HAPPENS NEXT?
            </strong>
            1. The Head Admin verifies your transaction code in our official Telebirr or Awash Bank records.
            <br />
            2. Once approved, your custom <strong>Horizontal Luxury VIP Ticket</strong> with embedded anti-tamper QR code is generated.
            <br />
            3. The verified ticket is sent directly to your Telegram (<strong>{registrationData.telegramUsername}</strong>).
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {telegramLink && (
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-heading font-black text-xs md:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>CHECK TELEGRAM</span>
            </a>
          )}

          <Button
            variant="secondary"
            size="lg"
            href="/"
            className="w-full sm:w-auto min-w-[180px]"
          >
            RETURN HOME
          </Button>
        </div>

        <p className="mt-6 text-xs font-mono text-neutral-400 max-w-sm mx-auto">
          Need urgent assistance? Contact HQ admin on Telegram with your Reference: {registrationData.referenceId}
        </p>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ─── STANDARD / CONFIRMED PASS SUCCESS SCREEN ─────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-center py-6 px-4"
    >
      {/* Animated Military Success Checkmark Icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
        <svg
          className="h-20 w-20 text-[var(--color-lime,#CCFF00)]"
          viewBox="0 0 52 52"
          fill="none"
          aria-hidden="true"
        >
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="filter drop-shadow-[0_0_12px_rgba(204,255,0,0.6)]"
          />
          <motion.path
            d="M14 27l8 8 16-16"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
            className="filter drop-shadow-[0_0_10px_rgba(204,255,0,0.8)]"
          />
        </svg>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-[var(--color-lime,#CCFF00)] drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]">
        REGISTRATION COMPLETE
      </h2>

      <p className="mt-2 text-sm sm:text-base text-[var(--color-silver,#999999)] max-w-lg mx-auto">
        Your registration has been securely received. Here is your digital event pass and unique reference code.
      </p>

      {/* Prominent Reference Number Display */}
      <div className="mt-6 mb-8 inline-block rounded-md bg-[var(--color-graphite,#1a1a1a)] px-6 py-3 border border-[var(--color-lime,#CCFF00)]/30 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-[var(--color-silver,#999999)] mb-1">
          OFFICIAL REGISTRATION REFERENCE
        </span>
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-white selection:bg-[var(--color-lime,#CCFF00)] selection:text-black">
          REF: {registrationData.referenceId}
        </span>
      </div>

      {/* Digital Event Pass Component */}
      <div className="my-6">
        <EventPass
          referenceId={registrationData.referenceId}
          fullName={registrationData.fullName}
          inGameName={registrationData.inGameName}
          category={registrationData.category}
          status={registrationData.status}
          ticketTier={registrationData.ticketTier}
          qrDataUrl={registrationData.qrDataUrl}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={handleDownload}
          className="w-full sm:w-auto min-w-[200px]"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          DOWNLOAD PASS
        </Button>

        <Button
          variant="secondary"
          size="lg"
          href="/"
          className="w-full sm:w-auto min-w-[180px]"
        >
          RETURN HOME
        </Button>
      </div>

      {/* Instructions Note */}
      <p className="mt-6 text-xs font-mono text-[var(--color-silver,#999999)] max-w-sm mx-auto">
        A copy of your pass details has been registered to the community ledger. Save your reference code for event entry.
      </p>
    </motion.div>
  );
}

export default RegistrationSuccess;
