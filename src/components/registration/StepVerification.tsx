'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, ParticipationCategory } from '@/lib/validation';

export interface RegistrationReviewData {
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  countryCode: string;
  cityRegion: string;
  category: ParticipationCategory;
  teamName: string;
  tournamentInterest: boolean;
  squadDetails: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage?: string;
  faceMatchScore?: number;
  faceMatchStatus?: string;
  ticketTier?: 'STANDARD' | 'VIP';
  vipPrice?: number;
  paymentMethod?: string;
  paymentTxnCode?: string;
  telegramUsername?: string;
}

export interface StepVerificationProps {
  formData: RegistrationReviewData;
  onSubmit: () => void | Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  onEditStep?: (step: number) => void;
  apiError?: string | null;
}

export function StepVerification({
  formData,
  onSubmit,
  onBack,
  isSubmitting,
  onEditStep,
  apiError,
}: StepVerificationProps) {
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const isVip = formData.ticketTier === 'VIP';
  const isFaceVerified = formData.faceMatchStatus === 'PASSED' && (formData.faceMatchScore || 0) >= 70;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFaceVerified) {
      setConsentError('Biometric verification failed. Your live selfie does not match the National ID card portrait.');
      return;
    }
    if (!agreedToPrivacy) {
      setConsentError('Please agree to the Registration and Privacy Policy to proceed.');
      return;
    }
    setConsentError(null);
    onSubmit();
  };

  const categoryLabel =
    CATEGORY_LABELS[formData.category] || formData.category.replace(/_/g, ' ').toUpperCase();

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
      noValidate
    >
      {/* Step Header */}
      <div>
        <div className="font-mono text-xs font-semibold tracking-widest text-[var(--color-lime,#CCFF00)] uppercase">
          {isVip ? 'STEP 06' : 'STEP 05'}
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          REVIEW &amp; CONFIRM
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)]">
          {isVip
            ? 'Verify all player, ID, AI face match, and VIP transaction details before submitting for Head Admin confirmation.'
            : 'Verify your details before generating your official PUBG Mobile Community Assembly pass.'}
        </p>
      </div>

      {/* Review Card */}
      <Card padding="md" className="space-y-6 border-white/15 bg-[var(--color-graphite,#1a1a1a)]">
        {/* Section 1: Player Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-[var(--color-lime,#CCFF00)]">01.</span> PLAYER DETAILS
            </h3>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="font-mono text-xs uppercase tracking-wider text-[var(--color-lime,#CCFF00)] hover:text-white transition-colors cursor-pointer"
              >
                [ EDIT ]
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                Legal Full Name
              </span>
              <span className="font-semibold text-white">{formData.fullName}</span>
            </div>

            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                In-Game Name (IGN)
              </span>
              <span className="font-mono font-semibold text-[var(--color-lime,#CCFF00)]">
                {formData.inGameName}
              </span>
            </div>

            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                PUBG Mobile UID
              </span>
              <span className="font-mono font-semibold text-white">{formData.pubgUid}</span>
            </div>

            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                Contact Phone
              </span>
              <span className="font-mono text-white">
                {formData.countryCode} {formData.phoneNumber}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                City / Region
              </span>
              <span className="text-white">{formData.cityRegion}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Participation Details */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-[var(--color-lime,#CCFF00)]">02.</span> PARTICIPATION DETAILS
            </h3>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="font-mono text-xs uppercase tracking-wider text-[var(--color-lime,#CCFF00)] hover:text-white transition-colors cursor-pointer"
              >
                [ EDIT ]
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                Category
              </span>
              <span className="font-semibold text-white">{categoryLabel}</span>
            </div>

            <div>
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                Tournament Intent
              </span>
              <span
                className={`font-semibold ${
                  formData.tournamentInterest
                    ? 'text-[var(--color-lime,#CCFF00)]'
                    : 'text-[var(--color-silver,#999999)]'
                }`}
              >
                {formData.tournamentInterest ? 'Yes (Active Competitor)' : 'Spectating / Non-competitor'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                Access Pass Tier
              </span>
              {isVip ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 text-amber-400 font-bold font-mono text-xs border border-amber-500/40">
                  ★ VIP ALL-ACCESS PASS ({formData.vipPrice || 500} ETB)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#CCFF00]/10 text-[#CCFF00] font-bold font-mono text-xs border border-[#CCFF00]/30">
                  STANDARD PASS (FREE)
                </span>
              )}
            </div>

            {formData.teamName && (
              <div className="sm:col-span-2">
                <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                  Team / Clan Name
                </span>
                <span className="text-white font-mono">{formData.teamName}</span>
              </div>
            )}

            {formData.squadDetails && (
              <div className="sm:col-span-2">
                <span className="block font-mono text-[11px] text-[var(--color-silver,#999999)] uppercase">
                  Squad &amp; Roster Details
                </span>
                <p className="mt-1 font-body text-xs text-[var(--color-silver,#999999)] whitespace-pre-line bg-black/40 p-2.5 rounded border border-white/5">
                  {formData.squadDetails}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: ID Documents */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-[var(--color-lime,#CCFF00)]">03.</span> ID DOCUMENTS
            </h3>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="font-mono text-xs uppercase tracking-wider text-[var(--color-lime,#CCFF00)] hover:text-white transition-colors cursor-pointer"
              >
                [ EDIT ]
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {formData.idFrontImage ? (
              <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.idFrontImage} alt="Front of ID" className="w-full h-24 object-contain p-1" />
                <div className="px-2 py-1 bg-[var(--color-charcoal,#111111)] text-center">
                  <span className="font-mono text-[9px] text-[var(--color-lime,#CCFF00)] uppercase">Front ✓</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 flex items-center justify-center h-28">
                <span className="font-mono text-[10px] text-red-400">NOT UPLOADED</span>
              </div>
            )}
            {formData.idBackImage ? (
              <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.idBackImage} alt="Back of ID" className="w-full h-24 object-contain p-1" />
                <div className="px-2 py-1 bg-[var(--color-charcoal,#111111)] text-center">
                  <span className="font-mono text-[9px] text-[var(--color-lime,#CCFF00)] uppercase">Back ✓</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 flex items-center justify-center h-28">
                <span className="font-mono text-[10px] text-red-400">NOT UPLOADED</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: AI Biometric KYC Match */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-[var(--color-lime,#CCFF00)]">04.</span> AI BIOMETRIC KYC MATCH
            </h3>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(4)}
                className="font-mono text-xs uppercase tracking-wider text-[var(--color-lime,#CCFF00)] hover:text-white transition-colors cursor-pointer"
              >
                [ EDIT ]
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.selfieImage ? (
              <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 p-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.selfieImage}
                  alt="Live Selfie"
                  className="w-16 h-16 rounded-full object-cover border border-[#CCFF00]/40 shrink-0"
                />
                <div className="text-xs font-mono">
                  <span className="text-[#CCFF00] font-bold block">✓ KYC FACE VERIFIED</span>
                  <span className="text-[#888888] text-[11px]">
                    Match Score: {formData.faceMatchScore || 90}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 flex items-center justify-center p-3">
                <span className="font-mono text-xs text-red-400">NO SELFIE CAPTURED</span>
              </div>
            )}

            <div className="rounded-lg border border-white/10 bg-black/40 p-3 flex flex-col justify-center text-xs font-mono">
              <span className="text-white font-bold block mb-1">
                ⚡ INSTANT {isVip ? 'VIP' : 'STANDARD'} PASS APPROVAL
              </span>
              <span className="text-[#888888] text-[11px] leading-relaxed">
                Face and ID match verified. Your official {isVip ? 'VIP All-Access Pass' : 'admission pass'} will be issued immediately upon completing registration!
              </span>
            </div>
          </div>
        </div>

        {/* Section 5 (VIP Only): Payment Verification Details */}
        {isVip && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>05.</span> VIP PAYMENT DETAILS
              </h3>
              {onEditStep && (
                <button
                  type="button"
                  onClick={() => onEditStep(5)}
                  className="font-mono text-xs uppercase tracking-wider text-amber-400 hover:text-white transition-colors cursor-pointer"
                >
                  [ EDIT ]
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm bg-black/40 p-4 rounded-lg border border-amber-500/20">
              <div>
                <span className="block font-mono text-[11px] text-amber-300/70 uppercase">
                  Payment Method
                </span>
                <span className="font-bold text-white uppercase">
                  {formData.paymentMethod === 'AWASH_BANK' ? 'Awash Bank (Tsige Dagne)' : 'Telebirr (Alamawed Begashawe)'}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[11px] text-amber-300/70 uppercase">
                  Transaction Code / Ref
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {formData.paymentTxnCode || 'Not provided'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="block font-mono text-[11px] text-amber-300/70 uppercase">
                  Telegram Delivery Contact
                </span>
                <span className="font-mono font-bold text-white">
                  {formData.telegramUsername || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-sm border border-sky-500/30 bg-sky-950/20 p-4 text-sky-200">
        <svg
          className="h-5 w-5 shrink-0 text-sky-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-xs font-mono space-y-1">
          <p className="font-semibold text-sky-300 uppercase tracking-wide">
            {isVip ? 'INSTANT VIP PASS ISSUANCE' : 'PASS ISSUANCE'}
          </p>
          <p className="text-sky-200/80 leading-relaxed">
            Your identity and National ID have been matched by AI. Once you click complete, your official {isVip ? 'VIP All-Access Pass' : 'admission pass'} will be instantly generated!
          </p>
        </div>
      </div>

      {/* Registration & Privacy Policy Consent Checkbox */}
      <div className="space-y-3 pt-1">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => {
              setAgreedToPrivacy(e.target.checked);
              if (consentError) setConsentError(null);
            }}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-[var(--color-charcoal,#111111)] text-[var(--color-lime,#CCFF00)] accent-[var(--color-lime,#CCFF00)] focus:ring-[var(--color-lime,#CCFF00)] cursor-pointer shrink-0"
          />
          <span className="text-xs sm:text-sm text-[var(--color-silver,#999999)] leading-relaxed">
            I have read and agree to the{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="text-[var(--color-lime,#CCFF00)] underline hover:text-white transition-colors"
            >
              Registration and Privacy Policy
            </Link>
            . I confirm that the information and biometric selfie I provide are accurate and truthful. <span className="text-red-400">*</span>
          </span>
        </label>

        {consentError && (
          <p className="font-mono text-xs text-red-400 pl-7">{consentError}</p>
        )}

        {/* Optional Marketing Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedToMarketing}
            onChange={(e) => setAgreedToMarketing(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-[var(--color-charcoal,#111111)] text-[var(--color-lime,#CCFF00)] accent-[var(--color-lime,#CCFF00)] focus:ring-[var(--color-lime,#CCFF00)] cursor-pointer shrink-0"
          />
          <span className="text-xs sm:text-sm text-[var(--color-silver,#999999)]/80 leading-relaxed">
            I agree to receive future event announcements and promotional updates. <span className="text-[#666666] font-mono text-[11px]">(Optional; not required to register.)</span>
          </span>
        </label>
      </div>

      {/* API Submission Error Banner */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 rounded-sm border border-red-500/40 bg-red-950/30 p-3.5 text-xs font-mono text-red-400"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{apiError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[140px]"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting || !isFaceVerified}
          className="w-full sm:w-auto min-w-[220px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isFaceVerified
            ? isVip
              ? 'SUBMIT FOR VIP APPROVAL →'
              : 'CONFIRM & GET TICKET NOW →'
            : 'FACE MATCH REQUIRED'}
        </Button>
      </div>
    </motion.form>
  );
}

export default StepVerification;
