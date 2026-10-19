'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectOption } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { participationSchema, ParticipationCategory } from '@/lib/validation';

export interface StepParticipationProps {
  formData: {
    category: ParticipationCategory;
    teamName: string;
    tournamentInterest: boolean;
    squadDetails: string;
  };
  updateField: (field: string, value: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'attendee', label: 'Attendee (Spectator & Community Gathering)' },
  { value: 'tournament_player', label: 'Tournament Player (Competitive PUBG·M)' },
  { value: 'team_rep', label: 'Esports Team Representative / Clan Leader' },
  { value: 'content_creator', label: 'Content Creator / Media / Streamer' },
  { value: 'volunteer', label: 'Event Crew / Volunteer' },
];

export function StepParticipation({
  formData,
  updateField,
  onNext,
  onBack,
}: StepParticipationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEsportsCategory =
    formData.category === 'tournament_player' || formData.category === 'team_rep';

  const showSquadDetails =
    formData.tournamentInterest && isEsportsCategory;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as ParticipationCategory;
    updateField('category', newCategory);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
    // Auto-enable tournament interest for tournament players
    if (newCategory === 'tournament_player' && !formData.tournamentInterest) {
      updateField('tournamentInterest', true);
    }
  };

  const handleToggleTournament = () => {
    updateField('tournamentInterest', !formData.tournamentInterest);
  };

  const handleValidation = (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = participationSchema.safeParse({
      category: formData.category,
      teamName: formData.teamName ? formData.teamName.trim() : null,
      tournamentInterest: Boolean(formData.tournamentInterest),
      squadDetails: formData.squadDetails ? formData.squadDetails.trim() : null,
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
      {/* Step Header */}
      <div>
        <div className="font-mono text-xs font-semibold tracking-widest text-[var(--color-lime,#CCFF00)] uppercase">
          STEP 02
        </div>
        <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white">
          PARTICIPATION
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)]">
          Select your event category, clan affiliation, and tournament preferences.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        {/* Category Select */}
        <Select
          label="Registration Category"
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          options={CATEGORY_OPTIONS}
          error={errors.category}
          required
        />

        {/* Team Name Input (conditional for tournament player or team rep) */}
        <AnimatePresence>
          {isEsportsCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Input
                label="Team / Clan Name"
                name="teamName"
                value={formData.teamName}
                onChange={(e) => {
                  updateField('teamName', e.target.value);
                  if (errors.teamName) setErrors((prev) => ({ ...prev, teamName: '' }));
                }}
                placeholder="e.g. Habesha Esports / Red Dragon Clan"
                error={errors.teamName}
                required={isEsportsCategory}
              />
              <p className="mt-1 font-mono text-[11px] text-[var(--color-silver,#999999)] pl-1">
                The official clan tag or esports organization you represent.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tournament Interest Toggle Switch */}
        <div className="rounded-sm border border-white/10 bg-[var(--color-charcoal,#111111)] p-4 sm:p-5 transition-all hover:border-white/20">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 pr-2">
              <label
                htmlFor="tournament-toggle"
                className="font-heading text-sm sm:text-base font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                TOURNAMENT PARTICIPATION INTENT
              </label>
              <p className="text-xs text-[var(--color-silver,#999999)] font-body">
                Are you looking to compete in the main PUBG MOBILE Ethiopian Assembly Tournament?
              </p>
            </div>

            {/* Tactical Toggle Switch */}
            <button
              id="tournament-toggle"
              type="button"
              role="switch"
              aria-checked={formData.tournamentInterest}
              onClick={handleToggleTournament}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lime,#CCFF00)] ${
                formData.tournamentInterest
                  ? 'border-[var(--color-lime,#CCFF00)] bg-[var(--color-lime,#CCFF00)] shadow-[0_0_12px_rgba(204,255,0,0.5)]'
                  : 'border-white/20 bg-black/50'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out mt-[2px] ${
                  formData.tournamentInterest
                    ? 'translate-x-6.5 bg-[var(--color-void,#050505)]'
                    : 'translate-x-0.5 bg-[var(--color-silver,#999999)]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Squad Details Textarea (conditional) */}
        <AnimatePresence>
          {showSquadDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="squadDetails"
                    className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver,#999999)]"
                  >
                    Squad Teammates / Roster Details (Optional)
                  </label>
                  <span className="font-mono text-[10px] text-[var(--color-silver,#999999)]">
                    {formData.squadDetails.length}/500
                  </span>
                </div>
                <textarea
                  id="squadDetails"
                  name="squadDetails"
                  rows={4}
                  maxLength={500}
                  value={formData.squadDetails}
                  onChange={(e) => {
                    updateField('squadDetails', e.target.value);
                    if (errors.squadDetails) setErrors((prev) => ({ ...prev, squadDetails: '' }));
                  }}
                  placeholder="List your squad members (IGNs, Player UIDs) or indicate if you are looking for free agent teammates."
                  className="w-full rounded-sm border border-white/10 bg-[var(--color-charcoal,#111111)] px-4 py-3 font-body text-sm text-white placeholder:text-[var(--color-silver,#999999)]/40 outline-none transition-all duration-200 hover:border-white/20 focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40 resize-none"
                />
                {errors.squadDetails && (
                  <p className="font-mono text-xs text-red-400">{errors.squadDetails}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
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
          className="w-full sm:w-auto min-w-[200px]"
        >
          REVIEW & CONFIRM
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

export default StepParticipation;
