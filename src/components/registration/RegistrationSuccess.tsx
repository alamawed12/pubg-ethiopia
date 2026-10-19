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
  qrToken?: string;
  qrDataUrl?: string;
}

export interface RegistrationSuccessProps {
  registrationData: RegistrationSuccessData;
}

export function RegistrationSuccess({ registrationData }: RegistrationSuccessProps) {
  // Trigger pass image download
  const handleDownload = () => {
    // Find the save pass image button inside EventPass or download QR directly
    const passDownloadTrigger = document.querySelector<HTMLButtonElement>(
      'button[aria-label="Download pass"], button:has(svg)'
    );
    if (passDownloadTrigger) {
      passDownloadTrigger.click();
    } else if (registrationData.qrDataUrl) {
      const link = document.createElement('a');
      link.href = registrationData.qrDataUrl;
      link.download = `PUBG-PASS-${registrationData.referenceId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
          {/* Animated Glow Circle */}
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
          {/* Animated Checkmark Path */}
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
