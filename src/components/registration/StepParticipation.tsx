'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectOption } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { participationSchema, ParticipationCategory } from '@/lib/validation';
import {
  ShieldSecurityIcon,
  TrophyIcon,
  MicrophoneIcon,
  UsersIcon,
  CameraIcon,
  FirstAidIcon,
  StarVipIcon,
  ClipboardListIcon,
  CheckMarkIcon,
} from '@/components/ui/TacticalIcons';

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
    badge: 'FREE VIP',
  },
  {
    value: 'volunteer',
    label: 'Event Crew / Volunteer',
    description: 'Help organize gate check-in, stage, tournament, or logistics. 100% Free.',
    badge: 'CREW (FREE)',
  },
];

const VOLUNTEER_ROLES = [
  {
    id: 'gate_security',
    label: 'Gate Security & Registration Check-in',
    shortDesc: 'Scan QR passes & verify attendee IDs at entrance',
    fullDuties: 'Operate the high-speed QR ticket scanner at the arena gate, verify attendee photo ID credentials, hand out official wristbands, and ensure safe, unauthorized-free entrance flow.',
    rolePerks: 'Official Staff Credential, front-row queue management badge, crew radio comms access.',
    Icon: ShieldSecurityIcon,
  },
  {
    id: 'tournament_admin',
    label: 'Tournament Admin / Match Referee',
    shortDesc: 'Manage custom lobbies, record scores & enforce match rules',
    fullDuties: 'Create private custom tournament rooms in PUBG MOBILE, inspect player devices for fair-play compliance, record match placements/kills, and enforce competitive league regulations.',
    rolePerks: 'Referee Arena Desk Seating, official esports admin badge, live scoring console access.',
    Icon: TrophyIcon,
  },
  {
    id: 'stage_av',
    label: 'Stage Setup & Audio/Visual Crew',
    shortDesc: 'Help with screens, sound equipment, stage lighting & cables',
    fullDuties: 'Assist production directors with tournament spectator projection screens, casters audio headsets, stage lighting rigs, streaming capture cards, and player team voice channels.',
    rolePerks: 'Production booth access, stage crew lanyard, technical production experience badge.',
    Icon: MicrophoneIcon,
  },
  {
    id: 'crowd_usher',
    label: 'Crowd Management & Guest Ushering',
    shortDesc: 'Guide guests to seating areas and assist attendees',
    fullDuties: 'Welcome players as they enter, guide General vs. VIP attendees to their designated seating tiers, escort competing esports teams to their squad tables, and keep aisles clear.',
    rolePerks: 'Main arena all-area mobility, hospitality staff badge, complimentary refreshments.',
    Icon: UsersIcon,
  },
  {
    id: 'media_photo',
    label: 'Media, Photography & Content Assistant',
    shortDesc: 'Take photos, record event highlights & interview players',
    fullDuties: 'Capture professional 4K stage photos, film match-winning squad reactions, interview tournament champions for community socials, and assist live-streaming content creators.',
    rolePerks: 'Media Pit access, official press pass, portfolio credits on official community assembly channels.',
    Icon: CameraIcon,
  },
  {
    id: 'logistics_medic',
    label: 'Logistics & Refreshments Support',
    shortDesc: 'Distribute badges, manage water/snacks, assist organizing team',
    fullDuties: 'Manage backstage inventory, distribute competitor lunch and drink packs, assist with emergency first-aid station coordination, and support event headquarters operations.',
    rolePerks: 'Logistics operations command access, priority meal pass, official event crew certificate.',
    Icon: FirstAidIcon,
  },
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
                <span className="font-sans text-xs font-bold px-3 py-1 rounded-full bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] border border-[var(--color-lime,#CCFF00)]/40">
                  NO PAYMENT REQUIRED (FREE)
                </span>
              </div>

              {/* What will you do: Role Selection */}
              <div className="space-y-3">
                <label className="block font-sans text-xs uppercase tracking-wider text-[var(--color-lime,#CCFF00)] font-bold">
                  SELECT YOUR PREFERRED VOLUNTEER ROLE
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VOLUNTEER_ROLES.map((role) => {
                    const isSelected = formData.volunteerRole === role.id;
                    const RoleIcon = role.Icon;
                    return (
                      <div
                        key={role.id}
                        onClick={() => updateField('volunteerRole', role.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? 'border-[var(--color-lime,#CCFF00)] bg-[var(--color-lime,#CCFF00)]/15 ring-2 ring-[var(--color-lime,#CCFF00)]/60 shadow-[0_0_20px_rgba(204,255,0,0.25)] scale-[1.02]'
                            : 'border-white/10 bg-[#141414] hover:border-white/30 hover:bg-[#181818]'
                        }`}
                      >
                        <div className="font-sans font-semibold text-sm text-white flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-2">
                            <RoleIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[var(--color-lime,#CCFF00)]' : 'text-neutral-400'}`} />
                            <span className="leading-tight">{role.label}</span>
                          </span>
                          {isSelected && <CheckMarkIcon className="w-3.5 h-3.5 text-[var(--color-lime,#CCFF00)] shrink-0 stroke-[3]" />}
                        </div>
                        <p className="text-xs text-neutral-300 font-sans leading-relaxed pl-6">{role.shortDesc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Role Pop-Out Briefing (Shows what they will do) */}
                {(() => {
                  const currentRole = VOLUNTEER_ROLES.find((r) => r.id === formData.volunteerRole) || VOLUNTEER_ROLES[0];
                  const ActiveIcon = currentRole.Icon;
                  return (
                    <motion.div
                      key={currentRole.id}
                      initial={{ opacity: 0, y: 8, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl border border-[var(--color-lime,#CCFF00)]/40 bg-black/60 shadow-[0_4px_24px_rgba(0,0,0,0.7)] space-y-3 font-sans"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[var(--color-lime,#CCFF00)]/15 border border-[var(--color-lime,#CCFF00)]/30 text-[var(--color-lime,#CCFF00)] shrink-0">
                            <ActiveIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[var(--color-lime,#CCFF00)] block">
                              SELECTED ROLE DUTIES
                            </span>
                            <h4 className="font-heading font-black text-base text-white uppercase tracking-wider">
                              {currentRole.label}
                            </h4>
                          </div>
                        </div>
                        <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-[var(--color-lime,#CCFF00)] text-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.3)] self-start sm:self-auto">
                          <CheckMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
                          <span>ASSIGNMENT CHOSEN</span>
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-sans text-neutral-300">
                        <div>
                          <strong className="text-white block uppercase text-[11px] tracking-wider mb-0.5">
                            What You Will Do on Event Day:
                          </strong>
                          <p className="leading-relaxed text-neutral-200">
                            {currentRole.fullDuties}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <strong className="text-[var(--color-lime,#CCFF00)] block uppercase text-[11px] tracking-wider mb-0.5">
                            Special Role Access &amp; Privileges:
                          </strong>
                          <p className="leading-relaxed text-neutral-400">
                            {currentRole.rolePerks}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </div>

              {/* Volunteer Experience / Skills Input */}
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  WHAT EXPERIENCE OR SKILLS CAN YOU BRING? (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={formData.volunteerExperience || ''}
                  onChange={(e) => updateField('volunteerExperience', e.target.value)}
                  placeholder="e.g. Previous tournament organizing, gaming community management, first aid, fluent in English/Amharic..."
                  className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-xs text-white placeholder:text-neutral-400 placeholder:opacity-80 outline-none focus:border-[var(--color-lime,#CCFF00)] resize-none font-sans"
                />
              </div>

              {/* Dedicated Perks & Duties Card */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-2.5 font-sans">
                <h4 className="font-heading text-sm uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <ClipboardListIcon className="w-4 h-4 text-[var(--color-lime,#CCFF00)]" />
                  WHAT HAPPENS IF YOU ARE ACCEPTED AS EVENT CREW
                </h4>
                <ul className="text-xs text-neutral-300 space-y-2 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[var(--color-lime,#CCFF00)] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong className="text-white">100% Free Event Admission:</strong> No registration or ticket fee required.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[var(--color-lime,#CCFF00)] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong className="text-white">Official Crew Gear:</strong> Official PUBG Mobile Ethiopia Staff Lanyard &amp; Crew Badge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[var(--color-lime,#CCFF00)] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong className="text-white">Complimentary Food &amp; Drinks:</strong> Meals and refreshments provided on event day.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[var(--color-lime,#CCFF00)] shrink-0 mt-0.5 stroke-[2.5]" />
                    <span><strong className="text-white">Volunteer Certificate:</strong> Official Certificate of Contribution for your CV/portfolio.</span>
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
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    <StarVipIcon className="w-5 h-5" />
                  </div>
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
                    label="Channel Handle or Profile Link"
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
              <div className="rounded-xl border border-amber-500/30 bg-black/60 p-4 space-y-2.5 font-sans">
                <h4 className="font-heading text-sm uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
                  <StarVipIcon className="w-4 h-4 text-amber-400" />
                  YOUR CREATOR VIP PRIVILEGES INCLUDE:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 font-sans">
                  <div className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
                    <span>VIP Lounge &amp; Streamer Zone Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
                    <span>Priority Front-Row Arena Seating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
                    <span>Fast-Track VIP Check-In Queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
                    <span>Official Creator Assembly Lanyard</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── STANDARD / VIP TIER SELECTOR (FOR ATTENDEES & PLAYERS) ─── */}
        {!isVolunteer && !isCreator && (
          <div className="space-y-2.5 pt-1 font-sans">
            <label className="block text-xs uppercase font-sans font-semibold tracking-wider text-neutral-300">
              SELECT EVENT ACCESS TIER
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Standard Pass */}
              <div
                onClick={() => updateField('ticketTier', 'STANDARD')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                  formData.ticketTier !== 'VIP'
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-[0_0_20px_rgba(204,255,0,0.15)] ring-2 ring-[#CCFF00]/50 scale-[1.01]'
                    : 'border-white/10 bg-[#141414] hover:border-white/20 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-base uppercase text-white">STANDARD PASS</span>
                  <span className="font-sans text-xs font-bold text-[#CCFF00] px-2.5 py-0.5 rounded-full bg-black/50 border border-[#CCFF00]/40">
                    FREE
                  </span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-2 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 stroke-[2.5]" />
                    <span>General Event Admission</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 stroke-[2.5]" />
                    <span>Tournament Spectator Area</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#CCFF00] shrink-0 stroke-[2.5]" />
                    <span>Digital QR Event Pass</span>
                  </li>
                </ul>
              </div>

              {/* VIP Pass */}
              <div
                onClick={() => updateField('ticketTier', 'VIP')}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                  formData.ticketTier === 'VIP'
                    ? 'border-[#f59e0b] bg-[#f59e0b]/15 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-[#f59e0b]/60 scale-[1.01]'
                    : 'border-white/10 bg-[#141414] hover:border-[#f59e0b]/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-base uppercase text-[#f59e0b] flex items-center gap-1.5">
                    <StarVipIcon className="w-4 h-4 text-[#f59e0b]" />
                    VIP ACCESS PASS
                  </span>
                  <span className="font-sans text-xs font-bold text-[#f59e0b] px-2.5 py-0.5 rounded-full bg-black/50 border border-[#f59e0b]/40">
                    {activeVipPrice.toLocaleString()} ETB
                  </span>
                </div>
                <ul className="text-xs text-neutral-200 space-y-2 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 stroke-[2.5]" />
                    <span>Priority Front-Row Arena Seating</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 stroke-[2.5]" />
                    <span>Fast-Track VIP Check-In Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 stroke-[2.5]" />
                    <span>Official Assembly Lanyard &amp; Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckMarkIcon className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 stroke-[2.5]" />
                    <span>Pro Player &amp; Creator Lounge Access</span>
                  </li>
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

              {/* Squad Details Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="squadDetails"
                    className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-300"
                  >
                    Squad Teammates / Roster Details (Optional)
                  </label>
                  <span className="font-sans text-xs text-neutral-400">
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
                  className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 font-sans text-xs text-white placeholder:text-neutral-400 placeholder:opacity-80 outline-none transition-all duration-200 hover:border-white/20 focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40 resize-none"
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
