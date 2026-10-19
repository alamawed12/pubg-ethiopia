'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar, StepItem } from '@/components/ui/ProgressBar';
import { StepPlayerIdentity } from './StepPlayerIdentity';
import { StepParticipation } from './StepParticipation';
import { StepIdUpload } from './StepIdUpload';
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
  idFrontImage: string;
  idBackImage: string;
  ticketTier: 'STANDARD' | 'VIP';
  vipPrice: number;
  paymentMethod: string;
  paymentTxnCode: string;
  telegramUsername: string;
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
  idFrontImage: '',
  idBackImage: '',
  ticketTier: 'STANDARD',
  vipPrice: 500,
  paymentMethod: 'TELEBIRR',
  paymentTxnCode: '',
  telegramUsername: '',
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

  const isVip = formData.ticketTier === 'VIP';
  const formSteps: StepItem[] = isVip
    ? [
        { number: 1, label: 'Player Identity' },
        { number: 2, label: 'Participation' },
        { number: 3, label: 'ID Upload' },
        { number: 4, label: 'VIP Payment' },
        { number: 5, label: 'Verification' },
      ]
    : [
        { number: 1, label: 'Player Identity' },
        { number: 2, label: 'Participation' },
        { number: 3, label: 'ID Upload' },
        { number: 4, label: 'Verification' },
      ];

  const maxSteps = isVip ? 5 : 4;

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
        throw new Error(
          result.error ||
            'Registration could not be completed. Please check your input and try again.'
        );
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
      <div className="relative overflow-hidden rounded-lg bg-[var(--color-charcoal,#111111)]/70 p-6 sm:p-8 md:p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md">
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

            {/* Step 2: Participation */}
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

            {/* Step 4 (VIP Only): VIP Payment & Accounts */}
            {isVip && currentStep === 4 && (
              <motion.div
                key="step-4-vip-payment"
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

            {/* Final Step: Verification (Step 5 for VIP, Step 4 for Standard) */}
            {((isVip && currentStep === 5) || (!isVip && currentStep === 4)) && (
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
