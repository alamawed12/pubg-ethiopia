'use client';

import React, { useState, useEffect } from 'react';
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
  const [data, setData] = useState<RegistrationSuccessData>(registrationData);
  const [isCheckingSms, setIsCheckingSms] = useState(true);
  const [countdown, setCountdown] = useState(4);

  const isVip = data.ticketTier?.toUpperCase() === 'VIP';
  const isConfirmed = data.status?.toUpperCase() === 'CONFIRMED';
  const isVipPending = isVip && !isConfirmed;

  // Auto-redirect to attendee portal for pending tickets
  useEffect(() => {
    if (!isConfirmed) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/portal';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConfirmed]);

  // Real-time polling to check if Android SMS bot automatically confirmed the transaction
  useEffect(() => {
    if (!isVip || isConfirmed) return;

    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > 40) {
        setIsCheckingSms(false);
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/register/${data.referenceId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.status?.toUpperCase() === 'CONFIRMED') {
              setData((prev) => ({
                ...prev,
                ...json.data,
                status: 'CONFIRMED',
                paymentStatus: 'APPROVED',
                qrDataUrl: json.qrDataUrl || prev.qrDataUrl,
              }));
              clearInterval(interval);
            }
          }
        }
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [data.referenceId, isConfirmed, isVip]);

  // Trigger pass image download
  const handleDownload = () => {
    const passDownloadTrigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Download pass"], button:has(svg)'
    );
    if (passDownloadTrigger) {
      passDownloadTrigger.click();
    } else if (data.qrDataUrl) {
      const link = document.createElement('a');
      link.href = data.qrDataUrl;
      link.download = `PUBG-${isVip ? 'VIP-' : ''}PASS-${data.referenceId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ─── VIP PASS PENDING VERIFICATION SCREEN ─────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (isVipPending) {
    const telegramClean = data.telegramUsername?.replace(/^@/, '') || '';
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

        {/* Real-time SMS Listener Status */}
        {isCheckingSms && (
          <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 font-mono text-[11px] shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Automated Bank SMS Listener: Checking incoming payment alerts...</span>
          </div>
        )}

        {/* Heading */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          VIP REGISTRATION SUBMITTED
        </h2>

        <p className="mt-2 text-sm sm:text-base text-neutral-300 max-w-lg mx-auto">
          Your payment transaction has been logged. As soon as the Telebirr / Awash SMS arrives on our system, your VIP ticket will unlock automatically.
        </p>

        {/* Official Reference Number Box */}
        <div className="mt-6 mb-8 inline-block rounded-lg bg-black/60 px-6 py-3.5 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <span className="block font-mono text-[11px] uppercase tracking-widest text-amber-300/80 mb-1">
            OFFICIAL VIP REGISTRATION REFERENCE
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-amber-400">
            REF: {data.referenceId}
          </span>
        </div>

        {/* ─── VIP Transaction Log Card ─── */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1c1810] via-[#12100d] to-[#0a0805] p-5 sm:p-6 text-left shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <span className="font-heading font-bold text-sm tracking-wider uppercase text-amber-400 flex items-center gap-2">
              <span>⭐</span> VIP TRANSACTION LOG
            </span>
            <span className="font-mono text-xs text-amber-300 font-bold">
              {data.vipPrice || 500} ETB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">ATTENDEE</span>
              <span className="text-white font-bold text-sm">{data.fullName}</span>
              <span className="text-amber-400 text-xs block">IGN: {data.inGameName}</span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">PAYMENT METHOD</span>
              <span className="text-white font-bold text-sm uppercase">
                {data.paymentMethod === 'AWASH_BANK'
                  ? 'Awash Bank (Tsige Dagne)'
                  : 'Telebirr (Alamawed Begashawe)'}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">TRANSACTION CODE / REF</span>
              <span className="text-amber-400 font-bold text-sm break-all">
                {data.paymentTxnCode || 'LOGGED FOR VERIFICATION'}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">DELIVERY TELEGRAM</span>
              <span className="text-white font-bold text-sm">
                {data.telegramUsername || 'Contact Recorded'}
              </span>
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 font-body text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-400 block font-mono text-[11px] uppercase mb-1">
              🛡️ AUTOMATIC VERIFICATION IN EFFECT
            </strong>
            When our phone receives the Telebirr or Awash Bank confirmation SMS, this page will update automatically and reveal your <strong>Horizontal Luxury VIP Ticket</strong> with QR credentials.
          </div>
        </div>

        {/* Redirect Notice Banner */}
        <div className="mt-6 p-4 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Redirecting to your Ticket Portal in <strong>{countdown}s</strong>...</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            href="/portal"
            className="w-full sm:flex-1"
          >
            GO TO ATTENDEE PORTAL →
          </Button>

          {telegramLink && (
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-white/20 font-heading font-black text-xs md:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>TELEGRAM</span>
            </a>
          )}
        </div>

        <p className="mt-6 text-xs font-mono text-neutral-400 max-w-sm mx-auto">
          Need urgent assistance? Contact HQ admin on Telegram with your Reference: {data.referenceId}
        </p>
      </motion.div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ─── STANDARD (FREE) PASS: PENDING ADMIN APPROVAL (NO QR UNTIL ACCEPTED) ───
  // ════════════════════════════════════════════════════════════════════════════
  if (!isConfirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full text-center py-6 px-4 max-w-xl mx-auto"
      >
        {/* Hourglass/Pending Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <svg className="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          REGISTRATION RECEIVED • PENDING REVIEW
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
          APPLICATION SUBMITTED
        </h2>

        <p className="mt-3 text-sm text-[#cccccc] leading-relaxed">
          Thank you, <strong className="text-white">{data.fullName}</strong>. Your free registration application has been queued for committee review. 
        </p>

        {/* Ref box */}
        <div className="mt-6 mb-6 p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-xs text-[#999999] uppercase">Application Reference</span>
            <span className="font-mono text-sm font-bold text-[#CCFF00]">{data.referenceId}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-mono text-xs text-[#999999] uppercase">Player Name &amp; IGN</span>
            <span className="font-mono text-xs text-white">{data.fullName} ({data.inGameName})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#999999] uppercase">Status</span>
            <span className="font-mono text-xs font-bold text-amber-400">PENDING ADMIN AUDIT</span>
          </div>
        </div>

        {/* Informative Explanation of Ticket Unlock */}
        <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#CCFF00]/20 text-xs text-left text-[#cccccc] space-y-2">
          <div className="flex items-center gap-2 font-mono text-[#CCFF00] uppercase font-bold">
            <span>ℹ️</span> HOW TO GET YOUR DIGITAL TICKET
          </div>
          <p className="text-[12px] text-[#999999] leading-relaxed">
            Free tickets do not show an immediate QR code. As soon as the admin reviews and accepts your submission, your QR ticket unlocks in the <strong>Attendee Portal</strong>.
          </p>
          <p className="text-[11px] text-[#999999] font-mono">
            You can log into your portal anytime using your <strong>Full Name</strong> and <strong>Phone Number</strong>.
          </p>
        </div>

        {/* Redirect Notice Banner */}
        <div className="mt-6 p-4 rounded-xl bg-black/60 border border-[#CCFF00]/30 text-xs font-mono text-[#CCFF00] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
          <span>Redirecting to your Ticket Portal in <strong>{countdown}s</strong>...</span>
        </div>

        {/* Portal Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            href="/portal"
            className="w-full sm:w-auto min-w-[200px]"
          >
            GO TO ATTENDEE PORTAL →
          </Button>

          <Button
            variant="secondary"
            size="lg"
            href="/"
            className="w-full sm:w-auto min-w-[160px]"
          >
            RETURN HOME
          </Button>
        </div>
      </motion.div>
    );
  }
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
          REF: {data.referenceId}
        </span>
      </div>

      {/* Digital Event Pass Component */}
      <div className="my-6">
        <EventPass
          referenceId={data.referenceId}
          fullName={data.fullName}
          inGameName={data.inGameName}
          category={data.category}
          status={data.status}
          ticketTier={data.ticketTier}
          qrDataUrl={data.qrDataUrl}
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
