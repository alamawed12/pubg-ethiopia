'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminManagementSection } from '@/components/admin/AdminManagementSection';
import {
  CalendarIcon,
  MegaphoneIcon,
  CreditCardIcon,
  ShieldSecurityIcon,
  LightningBoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  TrophyIcon,
  TrashIcon,
  LinkChainIcon,
} from '@/components/ui/TacticalIcons';

type TabKey = 'event' | 'announcements' | 'vip' | 'sponsors' | 'admins' | 'ai';

interface TabItem {
  id: TabKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'event', label: 'Event & Gate', Icon: CalendarIcon },
  { id: 'announcements', label: 'Announcements', Icon: MegaphoneIcon },
  { id: 'vip', label: 'VIP & Banking', Icon: CreditCardIcon },
  { id: 'sponsors', label: 'Sponsors', Icon: TrophyIcon },
  { id: 'admins', label: 'Admin Team', Icon: ShieldSecurityIcon },
  { id: 'ai', label: 'AI & Socials', Icon: LightningBoltIcon },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Tab from URL search params or default
  const paramTab = searchParams.get('tab') as TabKey;
  const [activeTab, setActiveTab] = useState<TabKey>(
    TABS.some((t) => t.id === paramTab) ? paramTab : 'event'
  );

  useEffect(() => {
    if (paramTab && TABS.some((t) => t.id === paramTab)) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/admin/settings?tab=${tab}`, { scroll: false });
  };

  // Quota & Pricing
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [heroAttendeesDisplay, setHeroAttendeesDisplay] = useState('100-1000');
  const [vipPrice, setVipPrice] = useState(500);
  const [vipEnabled, setVipEnabled] = useState(true);

  // Gemini AI Key
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestFeedback, setGeminiTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Announcement Controls
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementType, setAnnouncementType] = useState<'warning' | 'urgent' | 'info' | 'update'>('warning');
  const [announcementTitle, setAnnouncementTitle] = useState('IMPORTANT EVENT ANNOUNCEMENT');
  const [announcementMessage, setAnnouncementMessage] = useState('Official announcement from the PUBG MOBILE Ethiopia team.');
  const [announcementLinkText, setAnnouncementLinkText] = useState('REGISTER NOW');
  const [announcementLinkUrl, setAnnouncementLinkUrl] = useState('/register');

  // Event Metadata
  const [eventDate, setEventDate] = useState('DATE: TO BE ANNOUNCED');
  const [eventVenue, setEventVenue] = useState('ADDIS ABABA, ETHIOPIA');
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Official Payment Accounts
  const [telebirrNumber, setTelebirrNumber] = useState('+251950986841');
  const [telebirrName, setTelebirrName] = useState('Tsige Dagne');
  const [awashAccount, setAwashAccount] = useState('013201378990300');
  const [awashName, setAwashName] = useState('Tsige Dagne');

  // Community Socials
  const [telegramLink, setTelegramLink] = useState('https://t.me/pubgmethiopia');
  const [discordLink, setDiscordLink] = useState('https://discord.gg/pubgethiopia');

  // Sponsors Marquee
  const [sponsorsEnabled, setSponsorsEnabled] = useState(true);
  const [sponsorsTitle, setSponsorsTitle] = useState('OFFICIAL SPONSORS & PARTNERS');
  const [sponsorsSubtitle, setSponsorsSubtitle] = useState('POWERING THE PUBG MOBILE COMMUNITY ASSEMBLY ETHIOPIA');
  const [sponsorsList, setSponsorsList] = useState<Array<{ id: string; name: string; logo?: string; url?: string; tier?: string }>>([]);

  // Form state for adding/editing a sponsor
  const [sponsorNameInput, setSponsorNameInput] = useState('');
  const [sponsorTierInput, setSponsorTierInput] = useState('');
  const [sponsorUrlInput, setSponsorUrlInput] = useState('');
  const [sponsorLogoInput, setSponsorLogoInput] = useState('');
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [sponsorFormError, setSponsorFormError] = useState('');

  // Stats & States
  const [stats, setStats] = useState({ vipCount: 0, standardCount: 0, totalRegistrations: 0, estimatedVipRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.maxCapacity !== undefined) setMaxCapacity(d.maxCapacity);
          if (d.heroAttendeesDisplay !== undefined) setHeroAttendeesDisplay(d.heroAttendeesDisplay);
          if (d.vipPrice !== undefined) setVipPrice(d.vipPrice);
          if (d.vipEnabled !== undefined) setVipEnabled(d.vipEnabled);
          setHasGeminiKey(Boolean(d.hasGeminiKey));
          if (d.geminiApiKey) setGeminiApiKey(d.geminiApiKey);

          // Announcements
          if (d.announcementEnabled !== undefined) setAnnouncementEnabled(d.announcementEnabled);
          if (d.announcementType) setAnnouncementType(d.announcementType);
          if (d.announcementTitle) setAnnouncementTitle(d.announcementTitle);
          if (d.announcementMessage) setAnnouncementMessage(d.announcementMessage);
          if (d.announcementLinkText) setAnnouncementLinkText(d.announcementLinkText);
          if (d.announcementLinkUrl) setAnnouncementLinkUrl(d.announcementLinkUrl);

          // Event & Registration
          if (d.eventDate) setEventDate(d.eventDate);
          if (d.eventVenue) setEventVenue(d.eventVenue);
          if (d.registrationOpen !== undefined) setRegistrationOpen(d.registrationOpen);

          // Payment accounts
          if (d.telebirrNumber) setTelebirrNumber(d.telebirrNumber);
          if (d.telebirrName) setTelebirrName(d.telebirrName);
          if (d.awashAccount) setAwashAccount(d.awashAccount);
          if (d.awashName) setAwashName(d.awashName);

          // Socials
          if (d.telegramLink) setTelegramLink(d.telegramLink);
          if (d.discordLink) setDiscordLink(d.discordLink);

          // Sponsors
          if (d.sponsorsEnabled !== undefined) setSponsorsEnabled(Boolean(d.sponsorsEnabled));
          if (d.sponsorsTitle) setSponsorsTitle(d.sponsorsTitle);
          if (d.sponsorsSubtitle) setSponsorsSubtitle(d.sponsorsSubtitle);
          if (Array.isArray(d.sponsors)) setSponsorsList(d.sponsors);

          if (d.stats) setStats(d.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setGeminiTestFeedback(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST_GEMINI',
          geminiApiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeminiTestFeedback({
          success: true,
          message: data.message || 'Google Gemini Vision AI connected successfully! Anti-fraud biometric checks active.',
        });
        setHasGeminiKey(true);
      } else {
        setGeminiTestFeedback({
          success: false,
          message: data.error || 'Connection to Google Gemini failed. Check the API key.',
        });
      }
    } catch {
      setGeminiTestFeedback({
        success: false,
        message: 'Network error while contacting Google AI service.',
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSponsorFormError('Image size exceeds 2MB limit. Please upload a smaller logo or provide an image URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSponsorLogoInput(reader.result);
        setSponsorFormError('');
      }
    };
    reader.onerror = () => {
      setSponsorFormError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdateSponsor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sponsorNameInput.trim()) {
      setSponsorFormError('Please enter a sponsor or partner name.');
      return;
    }

    if (editingSponsorId) {
      setSponsorsList((prev) =>
        prev.map((s) =>
          s.id === editingSponsorId
            ? {
                ...s,
                name: sponsorNameInput.trim(),
                tier: sponsorTierInput.trim() || 'Official Partner',
                url: sponsorUrlInput.trim(),
                logo: sponsorLogoInput.trim(),
              }
            : s
        )
      );
      setEditingSponsorId(null);
    } else {
      const newSponsor = {
        id: `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: sponsorNameInput.trim(),
        tier: sponsorTierInput.trim() || 'Official Partner',
        url: sponsorUrlInput.trim(),
        logo: sponsorLogoInput.trim(),
      };
      setSponsorsList((prev) => [...prev, newSponsor]);
    }

    // Reset input fields
    setSponsorNameInput('');
    setSponsorTierInput('');
    setSponsorUrlInput('');
    setSponsorLogoInput('');
    setSponsorFormError('');
  };

  const handleStartEditSponsor = (sponsor: { id: string; name: string; logo?: string; url?: string; tier?: string }) => {
    setEditingSponsorId(sponsor.id);
    setSponsorNameInput(sponsor.name);
    setSponsorTierInput(sponsor.tier || '');
    setSponsorUrlInput(sponsor.url || '');
    setSponsorLogoInput(sponsor.logo || '');
    setSponsorFormError('');
  };

  const handleCancelEditSponsor = () => {
    setEditingSponsorId(null);
    setSponsorNameInput('');
    setSponsorTierInput('');
    setSponsorUrlInput('');
    setSponsorLogoInput('');
    setSponsorFormError('');
  };

  const handleDeleteSponsor = (id: string) => {
    setSponsorsList((prev) => prev.filter((s) => s.id !== id));
    if (editingSponsorId === id) {
      handleCancelEditSponsor();
    }
  };

  const handleMoveSponsor = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sponsorsList.length) return;
    const updated = [...sponsorsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSponsorsList(updated);
  };

  const executeSave = async () => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxCapacity: Number(maxCapacity),
          heroAttendeesDisplay: heroAttendeesDisplay.trim(),
          vipPrice: Number(vipPrice),
          vipEnabled,
          geminiApiKey: geminiApiKey.trim(),
          announcementEnabled,
          announcementType,
          announcementTitle: announcementTitle.trim(),
          announcementMessage: announcementMessage.trim(),
          announcementLinkText: announcementLinkText.trim(),
          announcementLinkUrl: announcementLinkUrl.trim(),
          eventDate: eventDate.trim(),
          eventVenue: eventVenue.trim(),
          registrationOpen,
          telebirrNumber: telebirrNumber.trim(),
          telebirrName: telebirrName.trim(),
          awashAccount: awashAccount.trim(),
          awashName: awashName.trim(),
          telegramLink: telegramLink.trim(),
          discordLink: discordLink.trim(),
          sponsorsEnabled,
          sponsorsTitle: sponsorsTitle.trim(),
          sponsorsSubtitle: sponsorsSubtitle.trim(),
          sponsors: sponsorsList,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (geminiApiKey && !geminiApiKey.includes('••••')) {
          setHasGeminiKey(true);
        }
        setTimeout(() => setSaveSuccess(false), 6000);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Loading Control Center...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      {/* ═══════════════════════════════════════════════════════════════
          STICKY TOP ACTION BAR WITH SAVE BUTTON (LIVES AT THE VERY TOP)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10 py-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Section Identity */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="font-sans text-[11px] font-bold tracking-widest text-[#CCFF00] uppercase">
              MASTER CONTROL CENTER
            </span>
            <span className="text-white/20">•</span>
            <span className="font-sans text-[11px] font-semibold text-neutral-400 uppercase">
              LIVE ON PUBGMETHIOPIA.ET
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight uppercase">
            WEBSITE CONFIGURATION
          </h1>
        </div>

        {/* Right: Prominent Top Save Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
          <button
            type="button"
            onClick={executeSave}
            disabled={saving}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-sans text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 ${
              saveSuccess
                ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                : 'bg-[#CCFF00] text-black hover:bg-[#b8e600] shadow-[#CCFF00]/25 hover:shadow-[#CCFF00]/40'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>PUSHING CHANGES LIVE...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircleIcon className="w-4 h-4 stroke-[3]" />
                <span>SAVED &amp; LIVE ON WEBSITE!</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
                <span>SAVE CHANGES (PUSH LIVE)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl text-sm border flex items-center gap-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="font-sans text-xs sm:text-sm leading-relaxed">
            <strong className="text-white">Changes Deployed Live:</strong> All quotas, schedule updates, payment account numbers, and announcements are active across the public website.
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl text-xs sm:text-sm border bg-red-500/10 border-red-500/30 text-red-300 flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          APPLE-STYLE TAB NAVIGATION PILLS (ALL TABS 100% VISIBLE)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-[#141414] border border-white/10">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                isSelected
                  ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.35)]'
                  : 'text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-[#CCFF00]'}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: EVENT SCHEDULE, VENUE & GATE CONTROLS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'event' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
              <span className="font-sans text-[11px] font-semibold uppercase text-neutral-400">TOTAL PLAYERS</span>
              <div className="text-2xl font-black font-heading text-white mt-1">
                {stats.totalRegistrations || 0} / {maxCapacity}
              </div>
              <span className="text-[11px] text-neutral-400 font-sans font-medium">
                {Math.round(((stats.totalRegistrations || 0) / (maxCapacity || 1)) * 100)}% capacity
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
              <span className="font-sans text-[11px] font-semibold uppercase text-neutral-400">REGISTRATION GATE</span>
              <div
                className={`text-xl font-black font-heading mt-1 flex items-center gap-1.5 ${
                  registrationOpen ? 'text-[#CCFF00]' : 'text-amber-400'
                }`}
              >
                <span>{registrationOpen ? '● OPEN' : '○ ON HOLD'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-sans font-medium">
                {registrationOpen ? 'Accepting forms' : 'Public form paused'}
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
              <span className="font-sans text-[11px] font-semibold uppercase text-neutral-400">HERO DISPLAY</span>
              <div className="text-xl font-black font-heading text-white mt-1">
                {heroAttendeesDisplay}
              </div>
              <span className="text-[11px] text-neutral-400 font-sans font-medium">
                Shown on home page
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
              <span className="font-sans text-[11px] font-semibold uppercase text-neutral-400">DATABASE LIMIT</span>
              <div className="text-2xl font-black font-heading text-[#CCFF00] mt-1">
                {maxCapacity} MAX
              </div>
              <span className="text-[11px] text-neutral-400 font-sans font-medium">
                Enforced server quota
              </span>
            </div>
          </div>

          {/* Event Details Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                  EVENT SCHEDULE &amp; VENUE METADATA
                </h2>
                <p className="text-xs text-neutral-400 font-sans">
                  Configures the announcement dates, arena location, and holding gate.
                </p>
              </div>
            </div>

            {/* Registration Gate Switch */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-sans text-sm font-bold text-white uppercase tracking-wider block">
                  REGISTRATION ADMISSION GATE
                </span>
                <span className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Toggle whether attendees can submit new registrations or see the on-hold waiting screen.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRegistrationOpen(!registrationOpen)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  registrationOpen
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                    : 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                }`}
              >
                {registrationOpen ? '● GATE: LIVE (OPEN)' : '○ GATE: ON HOLD (PAUSED)'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  EVENT DATE DISPLAY
                </label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. NOVEMBER 2026 / COMING SOON"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  EVENT VENUE / LOCATION
                </label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  placeholder="e.g. ADDIS ABABA, ETHIOPIA"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  HERO ATTENDANCE DISPLAY NUMBER
                </label>
                <input
                  type="text"
                  value={heroAttendeesDisplay}
                  onChange={(e) => setHeroAttendeesDisplay(e.target.value)}
                  placeholder="e.g. 100-1000, 200-300, 500+"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
                <p className="text-[11px] text-neutral-400 font-sans mt-1">
                  Updates the big hero counter number on the homepage.
                </p>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  SYSTEM CAPACITY LIMIT (QUOTA)
                </label>
                <input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  min={1}
                  max={5000}
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
                <p className="text-[11px] text-neutral-400 font-sans mt-1">
                  Server database hard cap limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: HOMEPAGE WARNING & BULLETIN ANNOUNCEMENTS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-amber-500/25 bg-gradient-to-b from-[#14120c] to-[#0f0e0a] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <MegaphoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    HOMEPAGE WARNING &amp; BULLETIN POPUP
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Broadcasts a modal and top ticker bar to every visitor on the homepage.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  announcementEnabled
                    ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {announcementEnabled ? '● BROADCASTING LIVE' : '○ POPUP DISABLED'}
              </button>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300">
                ALERT SEVERITY / COLOR THEME
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'warning', label: 'Warning (Amber)', color: 'border-amber-400 bg-amber-500/10 text-amber-300' },
                  { id: 'urgent', label: 'Urgent Alert (Red)', color: 'border-red-500 bg-red-500/10 text-red-300' },
                  { id: 'info', label: 'Official Info (Lime)', color: 'border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]' },
                  { id: 'update', label: 'Event Update (Blue)', color: 'border-sky-400 bg-sky-500/10 text-sky-300' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAnnouncementType(t.id as 'warning' | 'urgent' | 'info' | 'update')}
                    className={`py-3 px-3 rounded-xl border font-sans text-xs font-bold transition-all cursor-pointer text-center ${
                      announcementType === t.id
                        ? `${t.color} ring-2 ring-white/20 shadow-md`
                        : 'border-white/10 bg-[#141414] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Message */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  POPUP HEADLINE TITLE
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. REGISTRATION ANNOUNCEMENT"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  ANNOUNCEMENT MESSAGE BODY
                </label>
                <textarea
                  rows={4}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Type the message that will pop up on the homepage..."
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-[#161616] border-white/10 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    CTA BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={announcementLinkText}
                    onChange={(e) => setAnnouncementLinkText(e.target.value)}
                    placeholder="e.g. REGISTER NOW"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                    CTA LINK DESTINATION (URL)
                  </label>
                  <input
                    type="text"
                    value={announcementLinkUrl}
                    onChange={(e) => setAnnouncementLinkUrl(e.target.value)}
                    placeholder="e.g. /register"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-2">
              <span className="font-sans text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                VISITOR PREVIEW LOOK
              </span>
              <div className="p-4 rounded-xl border border-amber-500/40 bg-[#18150f] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-sans text-xs font-bold text-amber-300 uppercase">
                    {announcementTitle || 'Announcement Title'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {announcementMessage || 'Your announcement message will display here...'}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-lg bg-amber-400 text-black font-sans text-xs font-bold uppercase tracking-wider">
                    {announcementLinkText || 'CLICK HERE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: VIP TIER PRICING & PAYMENT GATEWAYS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'vip' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    VIP TIER ACCESS PRICING &amp; BANK ACCOUNTS
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Configure pass pricing, Telebirr mobile wallet, and Awash Bank details.
                  </p>
                </div>
              </div>

              {/* VIP Toggle */}
              <button
                type="button"
                onClick={() => setVipEnabled(!vipEnabled)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  vipEnabled
                    ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-white/10 text-neutral-400'
                }`}
              >
                {vipEnabled ? '● VIP TIER ACTIVE' : '○ VIP DISABLED'}
              </button>
            </div>

            {/* Price Config */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-sans text-sm font-bold text-white uppercase tracking-wider block">
                  VIP PASS TICKET PRICE
                </span>
                <span className="text-xs text-neutral-400 font-sans">
                  The amount displayed to applicants during VIP registration.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={vipPrice}
                  onChange={(e) => setVipPrice(Number(e.target.value))}
                  min={0}
                  className="w-32 px-4 py-2.5 rounded-xl border text-base font-sans font-bold text-amber-400 bg-[#161616] border-white/10 outline-none text-right"
                />
                <span className="font-sans text-sm font-bold text-neutral-300">ETB</span>
              </div>
            </div>

            {/* Bank Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Telebirr Account */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#161616] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-sans text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    TELEBIRR WALLET DETAILS
                  </span>
                  <span className="font-sans text-[10px] text-neutral-400 font-semibold">MOBILE MONEY</span>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={telebirrNumber}
                    onChange={(e) => setTelebirrNumber(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-black/40 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    ACCOUNT HOLDER NAME
                  </label>
                  <input
                    type="text"
                    value={telebirrName}
                    onChange={(e) => setTelebirrName(e.target.value)}
                    placeholder="Full Receiver Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-black/40 border-white/10"
                  />
                </div>
              </div>

              {/* Awash Bank Account */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#161616] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-sans text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    AWASH BANK DETAILS
                  </span>
                  <span className="font-sans text-[10px] text-neutral-400 font-semibold">COMMERCIAL BANK</span>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    ACCOUNT NUMBER
                  </label>
                  <input
                    type="text"
                    value={awashAccount}
                    onChange={(e) => setAwashAccount(e.target.value)}
                    placeholder="01320..."
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-blue-400 bg-black/40 border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    ACCOUNT HOLDER NAME
                  </label>
                  <input
                    type="text"
                    value={awashName}
                    onChange={(e) => setAwashName(e.target.value)}
                    placeholder="Full Receiver Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-blue-400 bg-black/40 border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: SPONSORS & BRAND PARTNERS (RIGHT-TO-LEFT MARQUEE)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6">
          {/* Main Controls Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <TrophyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    OFFICIAL SPONSORS &amp; BRAND PARTNERS
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Manage sponsor logos, tiers, and clickable links for the right-to-left marquee ticker on the homepage.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setSponsorsEnabled(!sponsorsEnabled)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  sponsorsEnabled
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.35)]'
                    : 'bg-white/10 text-neutral-400'
                }`}
              >
                {sponsorsEnabled ? '● MARQUEE ACTIVE' : '○ MARQUEE HIDDEN'}
              </button>
            </div>

            {/* Marquee Title & Subtitle Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  MARQUEE SECTION TITLE (HEADLINE)
                </label>
                <input
                  type="text"
                  value={sponsorsTitle}
                  onChange={(e) => setSponsorsTitle(e.target.value)}
                  placeholder="OFFICIAL SPONSORS & PARTNERS"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  SUPPORTING SUBTITLE
                </label>
                <input
                  type="text"
                  value={sponsorsSubtitle}
                  onChange={(e) => setSponsorsSubtitle(e.target.value)}
                  placeholder="POWERING THE PUBG MOBILE COMMUNITY ASSEMBLY ETHIOPIA"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Add / Edit Sponsor Form */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  {editingSponsorId ? 'EDIT SPONSOR PARTNER' : 'ADD NEW SPONSOR OR PARTNER'}
                </h3>
              </div>
              {editingSponsorId && (
                <button
                  type="button"
                  onClick={handleCancelEditSponsor}
                  className="text-xs text-neutral-400 hover:text-white underline uppercase cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {sponsorFormError && (
              <div className="p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                <span>{sponsorFormError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  BRAND / COMPANY NAME *
                </label>
                <input
                  type="text"
                  value={sponsorNameInput}
                  onChange={(e) => setSponsorNameInput(e.target.value)}
                  placeholder="e.g. Telebirr, Level Infinite"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  PARTNERSHIP TIER / BADGE
                </label>
                <input
                  type="text"
                  value={sponsorTierInput}
                  onChange={(e) => setSponsorTierInput(e.target.value)}
                  placeholder="e.g. Official Title Sponsor, Banking Partner"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  WEBSITE / SOCIAL LINK
                </label>
                <input
                  type="text"
                  value={sponsorUrlInput}
                  onChange={(e) => setSponsorUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>
            </div>

            {/* Logo Upload & URL Box */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
              <span className="font-sans text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                SPONSOR LOGO (FILE UPLOAD OR URL)
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Preview Square */}
                <div className="w-16 h-16 rounded-xl bg-[#141414] border border-white/15 flex items-center justify-center overflow-hidden shrink-0">
                  {sponsorLogoInput ? (
                    <img
                      src={sponsorLogoInput}
                      alt="Preview"
                      className="w-full h-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="font-heading font-black text-base text-[#CCFF00]">
                      {sponsorNameInput ? sponsorNameInput.slice(0, 2).toUpperCase() : 'LOGO'}
                    </span>
                  )}
                </div>

                {/* Upload or URL Inputs */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-sans text-xs font-bold uppercase tracking-wider cursor-pointer text-center transition-colors">
                      <span>CHOOSE LOGO FILE</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={sponsorLogoInput}
                      onChange={(e) => setSponsorLogoInput(e.target.value)}
                      placeholder="Or paste image URL (e.g. /images/pubg-mobile-logo.png or https://...)"
                      className="flex-1 px-4 py-2 rounded-xl border text-xs text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                    />

                    {sponsorLogoInput && (
                      <button
                        type="button"
                        onClick={() => setSponsorLogoInput('')}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-sans font-bold uppercase cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Supports PNG, JPG, SVG, WebP with transparent backgrounds. If no logo is provided, a tactical monogram is generated automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleAddOrUpdateSponsor()}
                className="px-6 py-2.5 rounded-xl bg-[#CCFF00] text-black font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#b8e600] transition-colors cursor-pointer shadow-md"
              >
                {editingSponsorId ? '✓ UPDATE SPONSOR' : '+ ADD SPONSOR TO MARQUEE'}
              </button>
            </div>
          </div>

          {/* Existing Sponsors List */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                CURRENT SPONSORS LIST ({sponsorsList.length})
              </h3>
              <span className="text-xs text-neutral-400 font-sans">
                {sponsorsList.length} partner{sponsorsList.length === 1 ? '' : 's'} configured
              </span>
            </div>

            {sponsorsList.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-white/10 rounded-xl bg-black/20">
                <p className="text-sm text-neutral-400 font-sans">No sponsors added yet.</p>
                <p className="text-xs text-neutral-500 font-sans">
                  Use the form above to add your first event partner or sponsor brand.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sponsorsList.map((sponsor, idx) => (
                  <div
                    key={sponsor.id}
                    className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#161616] hover:bg-[#1a1a1a] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="font-heading font-black text-sm text-[#CCFF00]">
                            {sponsor.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm text-white tracking-wide uppercase truncate">
                            {sponsor.name}
                          </h4>
                          {sponsor.tier && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 uppercase">
                              {sponsor.tier}
                            </span>
                          )}
                        </div>
                        {sponsor.url && (
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neutral-400 hover:text-[#CCFF00] truncate flex items-center gap-1 font-sans mt-0.5"
                          >
                            <LinkChainIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{sponsor.url}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Order & Management Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveSponsor(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSponsor(idx, 'down')}
                        disabled={idx === sponsorsList.length - 1}
                        title="Move Down"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEditSponsor(sponsor)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-sans font-semibold text-neutral-200 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSponsor(sponsor.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                        title="Delete Sponsor"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Marquee Preview Box */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  LIVE MARQUEE PREVIEW (RIGHT TO LEFT)
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-sans">
                Hover to pause ticker
              </span>
            </div>

            <div className="relative w-full overflow-hidden py-4 rounded-xl bg-black/60 border border-white/5">
              <div className="absolute top-0 bottom-0 left-0 w-16 z-10 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-16 z-10 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

              {sponsorsList.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500 font-sans">
                  Add sponsors above to see the live marquee ticker preview.
                </div>
              ) : (
                <div className="animate-marquee gap-3 py-1 px-4 cursor-default select-none">
                  {[...sponsorsList, ...sponsorsList, ...sponsorsList].map((sp, i) => (
                    <div
                      key={`preview-${sp.id}-${i}`}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 shrink-0 min-w-[200px]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {sp.logo ? (
                          <img src={sp.logo} alt={sp.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="font-heading font-black text-xs text-[#CCFF00]">
                            {sp.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 pr-1">
                        <span className="font-heading font-bold text-xs text-white uppercase truncate block">
                          {sp.name}
                        </span>
                        {sp.tier && (
                          <span className="font-sans text-[9px] text-[#CCFF00] uppercase truncate block">
                            {sp.tier}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: HEAD ADMIN ACCESS & SUB-ADMIN MANAGEMENT
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <AdminManagementSection />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: AI BIOMETRICS & COMMUNITY INTEGRATIONS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Gemini AI Biometrics Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <LightningBoltIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    GOOGLE GEMINI 1.5 FLASH VISION BIOMETRICS
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Anti-fraud face matching and anatomical comparison against National ID photos.
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-sans text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 self-start sm:self-auto ${
                  hasGeminiKey
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {hasGeminiKey ? (
                  <>
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>VISION AI CONNECTED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon className="w-3.5 h-3.5" />
                    <span>KEY NOT CONFIGURED</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Google Gemini Vision compares face anatomy, bone structure, ears, and jawlines to prevent applicants from submitting their family member&apos;s ID.
            </p>

            {geminiTestFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-sans border flex items-center gap-2 ${
                  geminiTestFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {geminiTestFeedback.success ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{geminiTestFeedback.message}</span>
              </div>
            )}

            <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300">
                GOOGLE GEMINI VISION API KEY
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  placeholder={hasGeminiKey ? '••••••••••••••••••••••••' : 'AIzaSy... (Paste Google Gemini API Key)'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
                />
                <button
                  type="button"
                  onClick={handleTestGemini}
                  disabled={isTestingGemini}
                  className="px-5 py-2.5 rounded-xl text-xs font-sans font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isTestingGemini ? (
                    'TESTING...'
                  ) : (
                    <>
                      <LightningBoltIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>TEST CONNECTION</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-sans text-neutral-400 pt-1">
                <span>Free Tier: 15 Requests / Minute at 0 ETB cost forever.</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#CCFF00] hover:underline flex items-center gap-1 font-semibold"
                >
                  Get Free Key at aistudio.google.com →
                </a>
              </div>
            </div>
          </div>

          {/* Socials Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
              COMMUNITY CHANNELS &amp; SOCIALS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  TELEGRAM CHANNEL / SUPPORT LINK
                </label>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/pubgmethiopia"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  DISCORD COMMUNITY SERVER LINK
                </label>
                <input
                  type="text"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Bottom Save Action */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 text-xs text-neutral-400 font-sans">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
          <span>All saved changes take effect immediately on public attendee pages.</span>
        </span>
        <button
          type="button"
          onClick={executeSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#CCFF00] text-black font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#b8e600] transition-colors cursor-pointer shadow-md disabled:opacity-50"
        >
          {saving ? 'SAVING...' : 'SAVE ALL SETTINGS NOW'}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center font-sans text-sm text-neutral-400">
          Loading Head Admin Settings...
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
