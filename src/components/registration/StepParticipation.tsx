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
    ticketTier?: 'STANDARD' | 'VIP';
    vipPrice?: number;
    socialMediaPlatform?: string;
    socialMediaLink?: string;
    socialMediaFollowers?: string;
    volunteerRole?: string;
    volunteerExperience?: string;
  };
  updateField: (field: string, value: string | boolean | number) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  {
    value: 'attendee',
    label: 'Attendee (Spectator & Community Gathering)',
    description: 'General admission, community meetups, match viewing, and networking.',
    badge: 'GENERAL',
  },
  {
    value: 'tournament_player',
    label: 'Tournament Player (Competitive PUBG·M)',
    description: 'Compete in the official Ethiopian PUBG Mobile championship bracket.',
    badge: 'ESPORTS',
  },
  {
    value: 'team_rep',
    label: 'Esports Team Representative / Clan Leader',
    description: 'Official clan leader or manager registering a squad/organization.',
    badge: 'CLAN LEAD',
  },
  {
    value: 'content_creator',
    label: 'Content Creator / Media / Streamer',
    description: 'YouTube, TikTok, Telegram creators. Includes Free VIP pass upon approval.',
    badge: '⭐ FREE VIP',
  },
  {
    value: 'volunteer',
    label: 'Event Crew / Volunteer',
    description: 'Help organize gate check-in, stage, tournament, or logistics. 100% Free.',
    badge: 'CREW (FREE)',
  },
];

const VOLUNTEER_ROLES = [
  { id: 'gate_security', label: '🛡️ Gate Security & Registration Check-in', desc: 'Scan QR passes & verify attendee IDs at entrance' },
  { id: 'tournament_admin', label: '🏆 Tournament Admin / Match Referee', desc: 'Manage custom lobbies, record scores & enforce match rules' },
  { id: 'stage_av', label: '🎙️ Stage Setup & Audio/Visual Crew', desc: 'Help with screens, sound equipment, stage lighting & cables' },
  { id: 'crowd_usher', label: '👥 Crowd Management & Guest Ushering', desc: 'Guide guests to seating areas and assist attendees' },
  { id: 'media_photo', label: '📸 Media, Photography & Content Assistant', desc: 'Take photos, record event highlights & interview players' },
  { id: 'logistics_medic', label: '🚑 Logistics & Refreshments Support', desc: 'Distribute badges, manage water/snacks, assist organizing team' },
];

const CREATOR_PLATFORMS = ['TikTok', 'YouTube', 'Telegram', 'Instagram', 'Twitch', 'Kick', 'Facebook Gaming'];

export function StepParticipation({
  formData,
  updateField,
  onNext,
  onBack,
}: StepParticipationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeVipPrice, setActiveVipPrice] = useState(formData.vipPrice || 500);

  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.vipPrice) {
          setActiveVipPrice(d.vipPrice);
          if (formData.category !== 'content_creator' && formData.category !== 'volunteer') {
            updateField('vipPrice', d.vipPrice);
          }
        }
      })
      .catch(() => {});
  }, [updateField, formData.category]);

  const isEsportsCategory =
    formData.category === 'tournament_player' || formData.category === 'team_rep';
  const isVolunteer = formData.category === 'volunteer';
  const isCreator = formData.category === 'content_creator';

  const handleCategoryChange = (e: { target: { value: string } }) => {
    const newCategory = e.target.value as ParticipationCategory;
    updateField('category', newCategory);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }

    // Auto-configure perks & tiers based on category
    if (newCategory === 'volunteer') {
      updateField('ticketTier', 'STANDARD');
      updateField('vipPrice', 0);
      if (!formData.volunteerRole) {
        updateField('volunteerRole', VOLUNTEER_ROLES[0].id);
      }
    } else if (newCategory === 'content_creator') {
      // Content Creators automatically get complimentary VIP!
      updateField('ticketTier', 'VIP');
      updateField('vipPrice', 0);
      if (!formData.socialMediaPlatform) {
        updateField('socialMediaPlatform', 'TikTok');
      }
    } else if (newCategory === 'tournament_player') {
      if (!formData.tournamentInterest) {
        updateField('tournamentInterest', true);
      }
    }
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

    // Additional validations for Creator & Volunteer
    if (isCreator && !formData.socialMediaLink?.trim()) {
      setErrors((prev) => ({ ...prev, socialMediaLink: 'Please provide your channel link or handle.' }));
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
          PARTICIPATION &amp; ROLE
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--color-silver,#999999)]">
          Select your registration category to unlock dedicated event access and roles.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {/* Custom Tactical Category Dropdown */}
        <Select
          label="Registration Category"
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          options={CATEGORY_OPTIONS}
          error={errors.category}
          required
        />

        {/* ─── CUSTOM PART 1: EVENT CREW / VOLUNTEER ─── */}
        <AnimatePresence mode="wait">
          {isVolunteer && (
            <motion.div
              key="volunteer-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4 rounded-xl border border-[var(--color-lime,#CCFF00)]/30 bg-[#0d1a0d]/60 p-5 backdrop-blur-md"
            >
              {/* Free Crew Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-lime,#CCFF00)] animate-pulse" />
                  <span className="font-heading text-base font-bold text-white uppercase tracking-wider">
                    EVENT CREW / VOLUNTEER APPLICATION
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] border border-[var(--color-lime,#CCFF00)]/40">
                  NO PAYMENT REQUIRED (FREE)
                </span>
              </div>

              {/* What will you do: Role Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-lime,#CCFF00)] font-bold mb-2">
                  SELECT YOUR PREFERRED VOLUNTEER ROLE *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {VOLUNTEER_ROLES.map((role) => {
                    const isSelected = formData.volunteerRole === role.id;
                    return (
                      <div
                        key={role.id}
                        onClick={() => updateField('volunteerRole', role.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[var(--color-lime,#CCFF00)] bg-[var(--color-lime,#CCFF00)]/10 ring-1 ring-[var(--color-lime,#CCFF00)]'
                            : 'border-white/10 bg-[#141414] hover:border-white/25'
                        }`}
                      >
                        <div className="font-semibold text-xs text-white flex items-center justify-between mb-1">
                          <span>{role.label}</span>
                          {isSelected && <span className="text-[var(--color-lime,#CCFF00)] font-mono text-xs">✓</span>}
                        </div>
                        <p className="text-[11px] text-[#888888] font-mono leading-tight">{role.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volunteer Experience / Skills Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  WHAT EXPERIENCE OR SKILLS CAN YOU BRING? (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={formData.volunteerExperience || ''}
                  onChange={(e) => updateField('volunteerExperience', e.target.value)}
                  placeholder="e.g. Previous tournament organizing, gaming community management, first aid, fluent in English/Amharic..."
                  className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--color-lime,#CCFF00)] resize-none"
                />
              </div>

              {/* Dedicated Perks & Duties Card */}
              <div className="rounded-lg border border-white/10 bg-black/50 p-4 space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                  <span>📋</span> WHAT HAPPENS IF YOU ARE ACCEPTED AS EVENT CREW
                </h4>
                <ul className="text-xs text-[#999999] space-y-1.5 font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-lime,#CCFF00)] font-bold">✓</span>
                    <span><strong>100% Free Event Admission:</strong> No registration or ticket fee required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-lime,#CCFF00)] font-bold">✓</span>
                    <span><strong>Official Crew Gear:</strong> Official PUBG Mobile Ethiopia Staff Lanyard &amp; Crew Badge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-lime,#CCFF00)] font-bold">✓</span>
                    <span><strong>Complimentary Food &amp; Drinks:</strong> Meals and refreshments provided on event day.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-lime,#CCFF00)] font-bold">✓</span>
                    <span><strong>Volunteer Certificate:</strong> Official Certificate of Contribution for your CV/portfolio.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CUSTOM PART 2: CONTENT CREATOR / MEDIA (FREE VIP) ─── */}
        <AnimatePresence mode="wait">
          {isCreator && (
            <motion.div
              key="creator-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4 rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 backdrop-blur-md"
            >
              {/* Creator VIP Banner */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">⭐</span>
                  <div>
                    <h3 className="font-heading text-base font-bold text-amber-300 uppercase tracking-wider">
                      COMPLIMENTARY CREATOR VIP PASS
                    </h3>
                    <p className="text-[11px] text-amber-200/70 font-mono">
                      Special Creator privileges included at zero cost upon verification.
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50">
                  FREE VIP (0 ETB)
                </span>
              </div>

              {/* Social Media Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Platform */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                    PLATFORM *
                  </label>
                  <select
                    value={formData.socialMediaPlatform || 'TikTok'}
                    onChange={(e) => updateField('socialMediaPlatform', e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#141414] px-3 py-3 text-sm text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CREATOR_PLATFORMS.map((p) => (
                      <option key={p} value={p} className="bg-[#141414] text-white">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel Link / Handle */}
                <div className="sm:col-span-2">
                  <Input
                    label="Channel Handle or Profile Link *"
                    placeholder="e.g. @pubg_ethiopia_pro or https://tiktok.com/@..."
                    value={formData.socialMediaLink || ''}
                    onChange={(e) => {
                      updateField('socialMediaLink', e.target.value);
                      if (errors.socialMediaLink) setErrors((prev) => ({ ...prev, socialMediaLink: '' }));
                    }}
                    error={errors.socialMediaLink}
                    required
                  />
                </div>
              </div>

              {/* Followers count */}
              <div>
                <Input
                  label="Approximate Follower / Subscriber Count (Optional)"
                  placeholder="e.g. 5,000+ followers"
                  value={formData.socialMediaFollowers || ''}
                  onChange={(e) => updateField('socialMediaFollowers', e.target.value)}
                />
              </div>

              {/* Creator VIP Perks Card */}
              <div className="rounded-lg border border-amber-500/30 bg-black/60 p-4 space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <span>★</span> YOUR CREATOR VIP PRIVILEGES INCLUDE:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#cccccc] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> VIP Lounge &amp; Streamer Zone Access
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> Priority Front-Row Arena Seating
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> Fast-Track VIP Check-In Queue
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> Official Creator Assembly Lanyard
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── STANDARD / VIP TIER SELECTOR (FOR ATTENDEES & PLAYERS) ─── */}
        {!isVolunteer && !isCreator && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs uppercase font-mono tracking-wider text-[#cccccc]">
              SELECT EVENT ACCESS TIER
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Standard Pass */}
              <div
                onClick={() => updateField('ticketTier', 'STANDARD')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.ticketTier !== 'VIP'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_15px_rgba(204,255,0,0.15)] ring-1 ring-[#CCFF00]'
                    : 'border-white/10 bg-[#111111] hover:border-white/20 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-base uppercase text-white">STANDARD PASS</span>
                  <span className="font-mono text-xs font-bold text-[#CCFF00] px-2 py-0.5 rounded bg-black/40 border border-[#CCFF00]/40">
                    FREE
                  </span>
                </div>
                <ul className="text-[11px] text-[#999999] space-y-1 font-mono">
                  <li>✓ General Event Admission</li>
                  <li>✓ Tournament Spectator Area</li>
                  <li>✓ Digital QR Event Pass</li>
                </ul>
              </div>

              {/* VIP Pass */}
              <div
                onClick={() => updateField('ticketTier', 'VIP')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.ticketTier === 'VIP'
                    ? 'border-[#f59e0b] bg-[#f59e0b]/15 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-[#f59e0b]'
                    : 'border-white/10 bg-[#111111] hover:border-[#f59e0b]/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-base uppercase text-[#f59e0b] flex items-center gap-1.5">
                    <span>⭐</span> VIP ACCESS PASS
                  </span>
                  <span className="font-mono text-xs font-bold text-[#f59e0b] px-2 py-0.5 rounded bg-black/40 border border-[#f59e0b]/40">
                    {activeVipPrice.toLocaleString()} ETB
                  </span>
                </div>
                <ul className="text-[11px] text-[#cccccc] space-y-1 font-mono">
                  <li>★ Priority Front-Row Arena Seating</li>
                  <li>★ Fast-Track VIP Check-In Queue</li>
                  <li>★ Official Assembly Lanyard &amp; Badge</li>
                  <li>★ Pro Player &amp; Creator Lounge Access</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── TOURNAMENT PLAYER & TEAM REP FIELDS ─── */}
        <AnimatePresence>
          {isEsportsCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 pt-1 overflow-hidden"
            >
              <Input
                label="Team / Clan Name *"
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

              {/* Squad Details Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="squadDetails"
                    className="font-mono text-xs uppercase tracking-wider text-[var(--color-silver,#999999)]"
                  >
                    Squad Teammates / Roster Details (Optional)
                  </label>
                  <span className="font-mono text-[10px] text-[var(--color-silver,#999999)]">
                    {(formData.squadDetails || '').length}/500
                  </span>
                </div>
                <textarea
                  id="squadDetails"
                  name="squadDetails"
                  rows={3}
                  maxLength={500}
                  value={formData.squadDetails || ''}
                  onChange={(e) => {
                    updateField('squadDetails', e.target.value);
                    if (errors.squadDetails) setErrors((prev) => ({ ...prev, squadDetails: '' }));
                  }}
                  placeholder="List your squad members (IGNs, Player UIDs) or indicate if you are looking for free agent teammates."
                  className="w-full rounded-xl border border-white/10 bg-[var(--color-charcoal,#111111)] px-4 py-3 font-body text-xs text-white placeholder:text-[var(--color-silver,#999999)]/40 outline-none transition-all duration-200 hover:border-white/20 focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40 resize-none"
                />
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
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
          CONTINUE TO ID UPLOAD
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </motion.form>
  );
}

export default StepParticipation;
