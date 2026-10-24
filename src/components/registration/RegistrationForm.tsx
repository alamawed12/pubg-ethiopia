'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar, StepItem } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ClockPendingIcon } from '@/components/ui/TacticalIcons';
import { StepPlayerIdentity } from './StepPlayerIdentity';
import { StepParticipation } from './StepParticipation';
import { StepIdUpload } from './StepIdUpload';
import { StepFaceVerification } from './StepFaceVerification';
import { StepVipPayment } from './StepVipPayment';
import { StepVerification } from './StepVerification';
import { RegistrationSuccess, RegistrationSuccessData } from './RegistrationSuccess';
import { ParticipationCategory } from '@/lib/validation';

export interface RegistrationFormData {
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
  socialMediaPlatform: string;
  socialMediaLink: string;
  socialMediaFollowers: string;
  volunteerRole: string;
  volunteerExperience: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
  faceMatchScore: number;
  faceMatchStatus: string;
  ticketTier: 'STANDARD' | 'VIP';
  vipPrice: number;
  paymentMethod: string;
  paymentTxnCode: string;
  telegramUsername: string;
  paymentReceiptImage: string;
}

const INITIAL_FORM_DATA: RegistrationFormData = {
  fullName: '',
  inGameName: '',
  pubgUid: '',
  phoneNumber: '',
  countryCode: '+251',
  cityRegion: '',
  category: 'attendee',
  teamName: '',
  tournamentInterest: false,
  squadDetails: '',
  socialMediaPlatform: 'TikTok',
  socialMediaLink: '',
  socialMediaFollowers: '',
  volunteerRole: 'gate_security',
  volunteerExperience: '',
  idFrontImage: '',
  idBackImage: '',
  selfieImage: '',
  faceMatchScore: 100,
  faceMatchStatus: 'PENDING_ADMIN_REVIEW',
  ticketTier: 'STANDARD',
  vipPrice: 500,
  paymentMethod: 'TELEBIRR',
  paymentTxnCode: '',
  telegramUsername: '',
  paymentReceiptImage: '',
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationSuccessData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Dynamic Registration Gate status (controlled by Head Admin in /admin/settings)
  const [isGateLoaded, setIsGateLoaded] = useState<boolean>(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  const [telegramLink, setTelegramLink] = useState<string>('https://t.me/pubgmethiopia');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.registrationOpen !== undefined) {
          setIsRegistrationOpen(Boolean(data.registrationOpen));
        }
        if (data.telegramLink) setTelegramLink(data.telegramLink);
        if (data.vipPrice) {
          setFormData((prev) => ({ ...prev, vipPrice: data.vipPrice }));
        }
        setIsGateLoaded(true);
      })
      .catch(() => {
        setIsGateLoaded(true);
      });
  }, []);

  // VIP Payment is only required for standard attendees/players upgrading to VIP.
  // Content Creators get Complimentary VIP (Free).
  // Volunteers get Free Crew Pass.
  const isVipPaid =
    formData.ticketTier === 'VIP' &&
    formData.category !== 'content_creator' &&
    formData.category !== 'volunteer';

  const formSteps: StepItem[] = isVipPaid
    ? [
        { number: 1, label: 'Identity' },
        { number: 2, label: 'Role' },
        { number: 3, label: 'ID Upload' },
        { number: 4, label: 'Face Photo' },
        { number: 5, label: 'VIP Payment' },
        { number: 6, label: 'Review' },
      ]
    : [
        { number: 1, label: 'Identity' },
        { number: 2, label: 'Role' },
        { number: 3, label: 'ID Upload' },
        { number: 4, label: 'Face Photo' },
        { number: 5, label: 'Review' },
      ];

  const maxSteps = isVipPaid ? 6 : 5;

  // Field updater
  const updateField = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Step navigation
  const goToNextStep = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, maxSteps));
    setApiError(null);
  };

  const goToPreviousStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setApiError(null);
  };

  const jumpToStep = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= maxSteps) {
      setDirection(targetStep > currentStep ? 1 : -1);
      setCurrentStep(targetStep);
      setApiError(null);
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!formData.selfieImage) {
      setApiError('Please take your face photo in Step 4 before submitting registration.');
      return;
    }

    if (!formData.idFrontImage) {
      setApiError('Please upload your National ID card before submitting registration.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.isHeld) {
          setIsRegistrationOpen(false);
        }
        throw new Error(
          result.error ||
            'Registration could not be completed. Please check your input and try again.'
        );
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'pmca_attendee_session',
            JSON.stringify({
              referenceId: result.data.referenceId,
              fullName: result.data.fullName,
              phoneNumber: formData.phoneNumber,
            })
          );
        } catch {}
      }

      setRegistrationResult(result.data);
      setIsComplete(true);
    } catch (err: unknown) {
      console.error('[REGISTRATION_SUBMISSION_ERROR]', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected network error occurred.';
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If registrations are on hold by Head Admin, render holding screen
  if (isGateLoaded && !isRegistrationOpen) {
    return (
      <div className="relative overflow-visible rounded-2xl bg-gradient-to-b from-[#14120c] to-[#0c0a06] p-6 sm:p-10 border-2 border-amber-500/40 text-center shadow-2xl space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
          <ClockPendingIcon className="w-10 h-10 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>REGISTRATION GATE CLOSED • ON HOLD</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
          REGISTRATIONS TEMPORARILY ON HOLD
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 max-w-lg mx-auto leading-relaxed font-sans">
          The Head Administration has temporarily placed attendee registration on hold while auditing player capacity and reviewing submitted applications.
        </p>

        <div className="p-5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-neutral-300 max-w-md mx-auto text-left space-y-2.5">
          <div>
            <span className="text-amber-400 font-bold block uppercase mb-0.5">• ALREADY REGISTERED?</span>
            <span className="text-neutral-400">
              You do not need to register again. You can access your attendee dashboard below to check your ticket status.
            </span>
          </div>
          <div className="border-t border-white/5 pt-2">
            <span className="text-amber-400 font-bold block uppercase mb-0.5">• REOPENING BULLETINS:</span>
            <span className="text-neutral-400">
              Announcements regarding registration re-opening will be broadcast live via our official Telegram community.
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
          <Button
            variant="primary"
            size="lg"
            href="/portal"
            className="w-full sm:flex-1"
          >
            GO TO ATTENDEE PORTAL →
          </Button>

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-xl border border-white/20 bg-neutral-900 hover:bg-neutral-800 text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <span>JOIN TELEGRAM</span>
          </a>
        </div>
      </div>
    );
  }

  // If registration is complete, render success state
  if (isComplete && registrationResult) {
    return <RegistrationSuccess registrationData={registrationResult} />;
  }

  return (
    <div className="w-full">
      {/* Multi-step Progress Bar */}
      <div className="mb-8 sm:mb-10">
        <ProgressBar currentStep={currentStep} steps={formSteps} />
      </div>

      {/* Global Form Error Message / Toast */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mb-6 flex items-start justify-between gap-3 rounded border border-red-500/40 bg-red-950/40 p-4 text-red-300"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-red-400 mt-0.5"
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
              <div>
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-red-200">
                  REGISTRATION FAILED
                </h4>
                <p className="mt-0.5 font-mono text-xs text-red-300/90 leading-relaxed">
                  {apiError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Step Form Container */}
      <div className="relative overflow-visible rounded-xl bg-[var(--color-charcoal,#111111)]/70 p-4 sm:p-8 md:p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md w-full max-w-full">
        {/* Subtle decorative grid lines */}
        <div className="pointer-events-none absolute inset-0 tactical-grid opacity-30" />

        {/* Tactical Corner Marks */}
        <div className="pointer-events-none absolute top-2 left-2 h-2.5 w-2.5 border-t border-l border-[var(--color-lime,#CCFF00)]/40" />
        <div className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 border-t border-r border-[var(--color-lime,#CCFF00)]/40" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-[var(--color-lime,#CCFF00)]/40" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-[var(--color-lime,#CCFF00)]/40" />

        <div className="relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Player Identity */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepPlayerIdentity
                  formData={formData}
                  updateField={updateField}
                  onNext={goToNextStep}
                />
              </motion.div>
            )}

            {/* Step 2: Participation & Role */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepParticipation
                  formData={formData}
                  updateField={updateField}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              </motion.div>
            )}

            {/* Step 3: ID Documents Upload */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepIdUpload
                  formData={formData}
                  updateField={updateField}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              </motion.div>
            )}

            {/* Step 4: Face Photo Capture */}
            {currentStep === 4 && (
              <motion.div
                key="step-4-face-kyc"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepFaceVerification
                  idFrontImage={formData.idFrontImage}
                  selfieImage={formData.selfieImage}
                  faceMatchScore={formData.faceMatchScore}
                  faceMatchStatus={formData.faceMatchStatus}
                  ticketTier={formData.ticketTier}
                  updateField={updateField}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              </motion.div>
            )}

            {/* Step 5 (Paid VIP Only): VIP Payment */}
            {isVipPaid && currentStep === 5 && (
              <motion.div
                key="step-5-vip-payment"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepVipPayment
                  formData={formData}
                  updateField={updateField}
                  onNext={goToNextStep}
                  onBack={goToPreviousStep}
                />
              </motion.div>
            )}

            {/* Final Step: Verification & Review */}
            {((isVipPaid && currentStep === 6) || (!isVipPaid && currentStep === 5)) && (
              <motion.div
                key="step-verification"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <StepVerification
                  formData={formData}
                  onSubmit={handleSubmit}
                  onBack={goToPreviousStep}
                  onEditStep={jumpToStep}
                  isSubmitting={isSubmitting}
                  apiError={apiError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;
