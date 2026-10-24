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
} from '@/components/ui/TacticalIcons';

type TabKey = 'event' | 'announcements' | 'vip' | 'admins' | 'ai';

interface TabItem {
  id: TabKey;
  label: string;
  badge?: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'event', label: 'Event & Gate', badge: 'Live Controls', Icon: CalendarIcon },
  { id: 'announcements', label: 'Homepage Bulletin', badge: 'Alerts', Icon: MegaphoneIcon },
  { id: 'vip', label: 'VIP & Bank Accounts', badge: 'Pricing', Icon: CreditCardIcon },
  { id: 'admins', label: 'Admin Staff & Roles', badge: 'Head Admin', Icon: ShieldSecurityIcon },
  { id: 'ai', label: 'AI Biometrics & Socials', badge: 'Security', Icon: LightningBoltIcon },
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
          APPLE-STYLE TAB NAVIGATION PILLS (DIVIDED INTO CLEAN SUB-PAGES)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141414] border border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-[#CCFF00]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isSelected ? 'bg-black/15 text-black' : 'bg-white/5 text-neutral-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
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
          TAB 4: HEAD ADMIN ACCESS & SUB-ADMIN MANAGEMENT
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
