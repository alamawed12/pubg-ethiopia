'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { playerIdentitySchema } from '@/lib/validation';

export interface StepPlayerIdentityProps {
  formData: {
    fullName: string;
    inGameName: string;
    pubgUid: string;
    phoneNumber: string;
    countryCode: string;
    cityRegion: string;
  };
  updateField: (field: string, value: string) => void;
  onNext: () => void;
}

const ETHIOPIAN_REGIONS: SelectOption[] = [
  { value: 'Addis Ababa', label: 'Addis Ababa' },
  { value: 'Oromia', label: 'Oromia' },
  { value: 'Amhara', label: 'Amhara' },
  { value: 'Tigray', label: 'Tigray' },
  { value: 'SNNPR', label: 'SNNPR' },
  { value: 'Dire Dawa', label: 'Dire Dawa' },
  { value: 'Harar', label: 'Harar' },
  { value: 'Somali', label: 'Somali' },
  { value: 'Afar', label: 'Afar' },
  { value: 'Benishangul-Gumuz', label: 'Benishangul-Gumuz' },
  { value: 'Gambela', label: 'Gambela' },
  { value: 'Sidama', label: 'Sidama' },
];

const COUNTRY_CODES: SelectOption[] = [
  { value: '+251', label: '+251 (Ethiopia)' },
  { value: '+254', label: '+254 (Kenya)' },
  { value: '+253', label: '+253 (Djibouti)' },
  { value: '+252', label: '+252 (Somalia)' },
  { value: '+249', label: '+249 (Sudan)' },
  { value: '+256', label: '+256 (Uganda)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+966', label: '+966 (Saudi Arabia)' },
];

export function StepPlayerIdentity({
  formData,
  updateField,
  onNext,
}: StepPlayerIdentityProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const handleValidation = (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = playerIdentitySchema.safeParse({
      fullName: formData.fullName,
      inGameName: formData.inGameName,
      pubgUid: formData.pubgUid,
      phoneNumber: formData.phoneNumber,
      countryCode: formData.countryCode || '+251',
      cityRegion: formData.cityRegion,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <motion.form
      onSubmit={handleValidation}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
      noValidate
    >
      {/* Header section */}
      <div>
        <div className="font-mono text-xs font-semibold tracking-widest text-[var(--color-lime,#CCFF00)] uppercase">
          STEP 01
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          PLAYER IDENTITY
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)]">
          Enter your official attendee information and in-game credentials.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Full Legal Name */}
        <Input
          label="Full Legal Name"
          name="fullName"
          value={formData.fullName}
          onChange={(e) => {
            updateField('fullName', e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
          }}
          placeholder="e.g. Abebe Bikila"
          error={errors.fullName}
          required
        />

        {/* PUBG In-Game Name */}
        <Input
          label="PUBG MOBILE In-Game Name (IGN)"
          name="inGameName"
          value={formData.inGameName}
          onChange={(e) => {
            updateField('inGameName', e.target.value);
            if (errors.inGameName) setErrors((prev) => ({ ...prev, inGameName: '' }));
          }}
          placeholder="e.g. SNIPER_ET"
          error={errors.inGameName}
          required
        />

        {/* PUBG UID */}
        <div>
          <Input
            label="PUBG MOBILE UID"
            name="pubgUid"
            value={formData.pubgUid}
            onChange={(e) => {
              // Restrict to numeric characters
              const val = e.target.value.replace(/\D/g, '');
              updateField('pubgUid', val);
              if (errors.pubgUid) setErrors((prev) => ({ ...prev, pubgUid: '' }));
            }}
            placeholder="e.g. 5123456789"
            error={errors.pubgUid}
            required
            type="text"
            inputMode="numeric"
          />
          <p className="mt-1 font-sans text-xs text-neutral-400 pl-1">
            Your numeric player ID found in your PUBG MOBILE profile (5-15 digits).
          </p>
        </div>

        {/* Phone Number with Country Code */}
        <div>
          <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Phone Number <span className="text-[var(--color-lime,#CCFF00)]">*</span>
          </label>
          <div className="flex gap-2.5">
            <div className="w-36 sm:w-44 shrink-0">
              <Select
                name="countryCode"
                value={formData.countryCode || '+251'}
                onChange={(e) => updateField('countryCode', e.target.value)}
                onOpenChange={setIsCountryOpen}
                options={COUNTRY_CODES}
                aria-label="Country Code"
              />
            </div>
            <div className="flex-1">
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  updateField('phoneNumber', e.target.value);
                  if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                }}
                placeholder="e.g. 911234567"
                error={errors.phoneNumber}
                required
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* City / Region (Expands box smoothly when popped up so no country/region is ever unseen) */}
        <div
          className={clsx(
            'transition-all duration-300 ease-out',
            isRegionOpen ? 'pb-72 sm:pb-64' : isCountryOpen ? 'pb-60 sm:pb-52' : 'pb-0'
          )}
        >
          <Select
            label="City / Region"
            name="cityRegion"
            value={formData.cityRegion}
            onChange={(e) => {
              updateField('cityRegion', e.target.value);
              if (errors.cityRegion) setErrors((prev) => ({ ...prev, cityRegion: '' }));
            }}
            onOpenChange={setIsRegionOpen}
            options={ETHIOPIAN_REGIONS}
            placeholder="Select your region in Ethiopia"
            error={errors.cityRegion}
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
        >
          CONTINUE TO PARTICIPATION
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.form>
  );
}

export default StepPlayerIdentity;
