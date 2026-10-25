'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, ParticipationCategory } from '@/lib/validation';
import { StarVipIcon, CheckMarkIcon } from '@/components/ui/TacticalIcons';

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
  socialMediaPlatform?: string;
  socialMediaLink?: string;
  socialMediaFollowers?: string;
  volunteerRole?: string;
  volunteerExperience?: string;
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

const VOLUNTEER_ROLE_LABELS: Record<string, string> = {
  gate_security: 'Gate Security & Registration Check-in',
  tournament_admin: 'Tournament Admin / Match Referee',
  stage_av: 'Stage Setup & Audio/Visual Crew',
  crowd_usher: 'Crowd Management & Guest Ushering',
  media_photo: 'Media, Photography & Content Assistant',
  logistics_medic: 'Logistics & Refreshments Support',
};

export function StepVerification({
  formData,
  onSubmit,
  onBack,
  isSubmitting,
  onEditStep,
  apiError,
}: StepVerificationProps) {
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const isVolunteer = formData.category === 'volunteer';
  const isCreator = formData.category === 'content_creator';
  const isVip = formData.ticketTier === 'VIP';
  const isVipPaid = isVip && !isCreator && !isVolunteer;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          {isVipPaid ? 'STEP 06' : 'STEP 05'}
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          REVIEW &amp; CONFIRM
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)]">
          Verify your identity, role, and uploaded photos before submitting for administrative approval.
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
                className="px-3 py-1 rounded-md bg-white/5 hover:bg-[var(--color-lime,#CCFF00)] hover:text-black text-[var(--color-lime,#CCFF00)] font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border border-[var(--color-lime,#CCFF00)]/30 hover:border-[var(--color-lime,#CCFF00)] shadow-sm active:scale-95"
              >
                EDIT
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                Legal Full Name
              </span>
              <span className="font-semibold text-white">{formData.fullName}</span>
            </div>

            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                In-Game Name (IGN)
              </span>
              <span className="font-sans font-semibold text-[var(--color-lime,#CCFF00)]">
                {formData.inGameName}
              </span>
            </div>

            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                PUBG Mobile UID
              </span>
              <span className="font-sans font-semibold text-white">{formData.pubgUid}</span>
            </div>

            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                Contact Phone
              </span>
              <span className="font-sans text-white">
                {formData.countryCode} {formData.phoneNumber}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
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
              <span className="text-[var(--color-lime,#CCFF00)]">02.</span> PARTICIPATION &amp; ROLE
            </h3>
            {onEditStep && (
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="px-3 py-1 rounded-md bg-white/5 hover:bg-[var(--color-lime,#CCFF00)] hover:text-black text-[var(--color-lime,#CCFF00)] font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border border-[var(--color-lime,#CCFF00)]/30 hover:border-[var(--color-lime,#CCFF00)] shadow-sm active:scale-95"
              >
                EDIT
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                Category
              </span>
              <span className="font-semibold text-white">{categoryLabel}</span>
            </div>

            {/* Access Pass Tier */}
            <div>
              <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                Access Pass Tier
              </span>
              {isVolunteer ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] font-bold font-sans text-xs border border-[var(--color-lime,#CCFF00)]/30">
                  EVENT CREW PASS (100% FREE)
                </span>
              ) : isCreator ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 text-amber-300 font-bold font-sans text-xs border border-amber-500/40">
                  <StarVipIcon className="w-3.5 h-3.5 text-amber-400" />
                  COMPLIMENTARY CREATOR VIP (FREE)
                </span>
              ) : isVip ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 text-amber-400 font-bold font-sans text-xs border border-amber-500/40">
                  <StarVipIcon className="w-3.5 h-3.5 text-amber-400" />
                  VIP ALL-ACCESS PASS ({formData.vipPrice || 500} ETB)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#CCFF00]/10 text-[#CCFF00] font-bold font-sans text-xs border border-[#CCFF00]/30">
                  STANDARD PASS (FREE)
                </span>
              )}
            </div>

            {/* Volunteer specific role */}
            {isVolunteer && (
              <div className="sm:col-span-2 space-y-1 bg-black/40 p-3 rounded-lg border border-[var(--color-lime,#CCFF00)]/20">
                <span className="block font-sans text-xs text-[var(--color-lime,#CCFF00)] uppercase font-bold">
                  Assigned Volunteer Role
                </span>
                <span className="text-white font-medium text-xs block">
                  {VOLUNTEER_ROLE_LABELS[formData.volunteerRole || ''] || formData.volunteerRole || 'Gate Security & Check-in'}
                </span>
                {formData.volunteerExperience && (
                  <p className="text-xs text-neutral-400 font-sans mt-1">
                    Skills: {formData.volunteerExperience}
                  </p>
                )}
              </div>
            )}

            {/* Creator specific social link */}
            {isCreator && (
              <div className="sm:col-span-2 space-y-1 bg-black/40 p-3 rounded-lg border border-amber-500/20">
                <span className="block font-sans text-xs text-amber-300 uppercase font-bold">
                  Creator Channel &amp; Platform
                </span>
                <div className="text-white font-sans text-xs flex items-center gap-2">
                  <span className="font-semibold text-amber-300 uppercase">{formData.socialMediaPlatform || 'Social'}</span>
                  <span>•</span>
                  <span className="text-neutral-200">{formData.socialMediaLink}</span>
                </div>
                {formData.socialMediaFollowers && (
                  <span className="text-xs text-neutral-400 font-sans block">
                    Audience: {formData.socialMediaFollowers}
                  </span>
                )}
              </div>
            )}

            {/* Team name for Esports */}
            {formData.teamName && (
              <div className="sm:col-span-2">
                <span className="block font-sans text-xs text-neutral-400 uppercase">
                  Team / Clan Name
                </span>
                <span className="text-white font-sans font-semibold">{formData.teamName}</span>
              </div>
            )}

            {formData.squadDetails && (
              <div className="sm:col-span-2">
                <span className="block font-sans text-xs text-neutral-400 uppercase">
                  Squad &amp; Roster Details
                </span>
                <p className="mt-1 font-sans text-xs text-neutral-300 whitespace-pre-line bg-black/40 p-2.5 rounded border border-white/5">
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
                className="px-3 py-1 rounded-md bg-white/5 hover:bg-[var(--color-lime,#CCFF00)] hover:text-black text-[var(--color-lime,#CCFF00)] font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border border-[var(--color-lime,#CCFF00)]/30 hover:border-[var(--color-lime,#CCFF00)] shadow-sm active:scale-95"
              >
                EDIT
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {formData.idFrontImage ? (
              <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.idFrontImage} alt="Front of ID" className="w-full h-24 object-contain p-1" />
                <div className="px-2 py-1 bg-[var(--color-charcoal,#111111)] text-center">
                  <span className="font-mono text-[9px] text-[var(--color-lime,#CCFF00)] uppercase flex items-center justify-center gap-1">
                    <span>Front</span>
                    <CheckMarkIcon className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
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
                  <span className="font-mono text-[9px] text-[var(--color-lime,#CCFF00)] uppercase flex items-center justify-center gap-1">
                    <span>Back</span>
                    <CheckMarkIcon className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/30 bg-red-950/20 flex items-center justify-center h-28">
                <span className="font-mono text-[10px] text-red-400">NOT UPLOADED</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4 (If Paid VIP): Payment Review */}
        {isVipPaid && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>04.</span> VIP PAYMENT DETAILS
              </h3>
              {onEditStep && (
                <button
                  type="button"
                  onClick={() => onEditStep(4)}
                  className="px-3 py-1 rounded-md bg-white/5 hover:bg-amber-400 hover:text-black text-amber-400 font-sans font-black text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer border border-amber-400/30 hover:border-amber-400 shadow-sm active:scale-95"
                >
                  EDIT
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                  Payment Method
                </span>
                <span className="font-bold text-amber-400 font-sans">{formData.paymentMethod || 'TELEBIRR'}</span>
              </div>

              <div>
                <span className="block font-sans text-xs font-medium text-neutral-400 uppercase">
                  Transaction Code
                </span>
                <span className="font-sans font-bold text-white tracking-wider">
                  {formData.paymentTxnCode || 'NOT PROVIDED'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Consent Checkboxes */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-black/50 text-[var(--color-lime,#CCFF00)] focus:ring-[var(--color-lime,#CCFF00)] cursor-pointer"
          />
          <span className="text-xs text-[var(--color-silver,#999999)] leading-relaxed group-hover:text-white transition-colors">
            I confirm that the provided information, ID card photos, and face photo are genuine and belong to me. I agree to the{' '}
            <Link href="/privacy" className="text-[var(--color-lime,#CCFF00)] underline hover:text-white" target="_blank">
              Registration Terms and Privacy Policy
            </Link>.
          </span>
        </label>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {(consentError || apiError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded border border-red-500/40 bg-red-950/40 p-3 text-xs font-mono text-red-300"
          >
            {consentError || apiError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[140px]"
        >
          ← BACK
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[220px]"
        >
          {isSubmitting ? 'SUBMITTING...' : 'COMPLETE REGISTRATION'}
        </Button>
      </div>
    </motion.form>
  );
}

export default StepVerification;
