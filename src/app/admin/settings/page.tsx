'use client';

import React, { useState, useEffect } from 'react';
import {
  SettingsCogIcon,
  ShieldSecurityIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  LightningBoltIcon,
  MegaphoneIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  LinkChainIcon,
} from '@/components/ui/TacticalIcons';

export default function AdminSettingsPage() {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
          // Announcement
          announcementEnabled,
          announcementType,
          announcementTitle: announcementTitle.trim(),
          announcementMessage: announcementMessage.trim(),
          announcementLinkText: announcementLinkText.trim(),
          announcementLinkUrl: announcementLinkUrl.trim(),
          // Event
          eventDate: eventDate.trim(),
          eventVenue: eventVenue.trim(),
          registrationOpen,
          // Accounts
          telebirrNumber: telebirrNumber.trim(),
          telebirrName: telebirrName.trim(),
          awashAccount: awashAccount.trim(),
          awashName: awashName.trim(),
          // Socials
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
        setTimeout(() => setSaveSuccess(false), 5000);
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
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 font-mono text-sm text-[#999999]">LOADING SETTINGS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase font-bold">
            MASTER CONTROL CENTER
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl tracking-wider uppercase mb-2 font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          HEAD ADMIN WEBSITE SETTINGS
        </h1>
        <p className="text-sm text-[#999999] leading-relaxed">
          Manage homepage warning popups, live announcements, event date &amp; venue details, registration open/closed status, official payment bank accounts, and Gemini AI biometric verification.
        </p>
      </div>

      {/* Top Quick Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#888888]">REGISTRATIONS</span>
          <div className="text-2xl font-black font-heading text-white mt-1">
            {stats.totalRegistrations || 0} / {maxCapacity}
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {Math.round(((stats.totalRegistrations || 0) / (maxCapacity || 1)) * 100)}% capacity
          </span>
        </div>

        <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#888888]">REGISTRATION GATE</span>
          <div
            className={`text-xl font-black font-heading mt-1 flex items-center gap-1.5 ${
              registrationOpen ? 'text-[#CCFF00]' : 'text-red-400'
            }`}
          >
            <span>{registrationOpen ? '● OPEN' : '○ PAUSED'}</span>
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {registrationOpen ? 'Accepting attendees' : 'Temporarily closed'}
          </span>
        </div>

        <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#888888]">HOMEPAGE POPUP</span>
          <div
            className={`text-xl font-black font-heading mt-1 flex items-center gap-1.5 ${
              announcementEnabled ? 'text-amber-400' : 'text-neutral-500'
            }`}
          >
            <span>{announcementEnabled ? '● BROADCASTING' : '○ DISABLED'}</span>
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {announcementEnabled ? `${announcementType.toUpperCase()} modal live` : 'Hidden from visitors'}
          </span>
        </div>

        <div className="p-4 rounded-xl border bg-[#111111] border-white/5">
          <span className="font-mono text-[11px] uppercase text-[#888888]">VIP TIER PRICING</span>
          <div className="text-2xl font-black font-heading text-[#CCFF00] mt-1">
            {vipPrice.toLocaleString()} ETB
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {stats.vipCount || 0} VIP claims ({stats.estimatedVipRevenue.toLocaleString()} ETB)
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl text-sm border flex items-center gap-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">
            All settings saved successfully! Homepage announcement, event schedule, payment accounts, and quotas are updated live across the entire website.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm border bg-red-500/10 border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: HOMEPAGE WARNING & BULLETIN ANNOUNCEMENT POPUP
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#14120c] to-[#0f0e0a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <MegaphoneIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                  HOMEPAGE WARNING &amp; ANNOUNCEMENT POPUP
                </h2>
                <p className="text-xs text-[#999999] font-mono">
                  Display an Apple-style announcement modal and top ticker bar on the homepage for all visitors.
                </p>
              </div>
            </div>

            {/* Live Enable Switch */}
            <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto bg-black/60 px-4 py-2.5 rounded-xl border border-white/10 hover:border-amber-400/50 transition-colors">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#CCFF00] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {announcementEnabled ? 'ANNOUNCEMENT ACTIVE' : 'ANNOUNCEMENT OFF'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
            {/* Form Inputs for Announcement */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  ANNOUNCEMENT URGENCY TYPE
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'warning', label: 'WARNING', color: 'border-amber-400 text-amber-400 bg-amber-400/10' },
                      { id: 'urgent', label: 'URGENT', color: 'border-red-400 text-red-400 bg-red-400/10' },
                      { id: 'info', label: 'INFO', color: 'border-blue-400 text-blue-400 bg-blue-400/10' },
                      { id: 'update', label: 'UPDATE', color: 'border-emerald-400 text-emerald-400 bg-emerald-400/10' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAnnouncementType(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        announcementType === t.id
                          ? `${t.color} shadow-sm ring-1 ring-white/20`
                          : 'border-white/10 bg-[#161616] text-[#888888] hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  ANNOUNCEMENT HEADLINE
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. OFFICIAL EVENT VENUE & SECURITY PROTOCOL"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-medium outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  MESSAGE BODY
                </label>
                <textarea
                  rows={3}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Detailed announcement or instructions for attendees..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-medium outline-none focus:border-amber-400 bg-[#161616] border-white/10 leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                    BUTTON TEXT
                  </label>
                  <input
                    type="text"
                    value={announcementLinkText}
                    onChange={(e) => setAnnouncementLinkText(e.target.value)}
                    placeholder="e.g. REGISTER NOW"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                    DESTINATION LINK URL
                  </label>
                  <input
                    type="text"
                    value={announcementLinkUrl}
                    onChange={(e) => setAnnouncementLinkUrl(e.target.value)}
                    placeholder="e.g. /register or https://..."
                    className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-amber-400 bg-[#161616] border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="flex flex-col justify-between p-5 rounded-xl border border-white/10 bg-black/50">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <span className="text-[11px] font-mono uppercase text-[#888888] font-bold">
                    VISITOR MODAL PREVIEW
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      announcementEnabled
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {announcementEnabled ? 'LIVE ON HOMEPAGE' : 'CURRENTLY OFF'}
                  </span>
                </div>

                {/* Simulated Announcement Box */}
                <div
                  className={`p-4 rounded-xl border text-left ${
                    announcementType === 'warning'
                      ? 'border-amber-500/40 bg-[#181308]'
                      : announcementType === 'urgent'
                      ? 'border-red-500/40 bg-[#180a0a]'
                      : announcementType === 'info'
                      ? 'border-blue-500/40 bg-[#08121a]'
                      : 'border-emerald-500/40 bg-[#0a180a]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        announcementType === 'warning'
                          ? 'bg-amber-400/20 text-amber-300'
                          : announcementType === 'urgent'
                          ? 'bg-red-400/20 text-red-300'
                          : announcementType === 'info'
                          ? 'bg-blue-400/20 text-blue-300'
                          : 'bg-emerald-400/20 text-emerald-300'
                      }`}
                    >
                      {announcementType === 'warning'
                        ? 'OFFICIAL WARNING'
                        : announcementType === 'urgent'
                        ? 'URGENT BULLETIN'
                        : announcementType === 'info'
                        ? 'COMMUNITY NOTICE'
                        : 'SYSTEM UPDATE'}
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-lg text-white uppercase tracking-wider mb-1.5">
                    {announcementTitle || 'Announcement Title'}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-3">
                    {announcementMessage || 'Announcement message content will appear here...'}
                  </p>

                  {announcementLinkText && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#888888]">
                        Link: {announcementLinkUrl}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#CCFF00] text-black">
                        {announcementLinkText}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#777777] mt-4">
                Visitors will see this popup once per session with an &apos;ACKNOWLEDGE &amp; PROCEED&apos; button, plus a persistent top ticker banner.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: EVENT SCHEDULE, VENUE & REGISTRATION GATE
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#111111]">
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                EVENT SCHEDULE &amp; VENUE METADATA
              </h2>
              <p className="text-xs text-[#999999] font-mono">
                Updates the event date, tournament hall location, and hero statistics displayed on the homepage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Event Date */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>OFFICIAL EVENT DATE</span>
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="e.g. SATURDAY, NOVEMBER 28, 2026 or DATE: TO BE ANNOUNCED"
                className="w-full px-4 py-3 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
              />
              <span className="text-[11px] text-[#777777] font-mono mt-1 block">
                Shown in the hero metadata and digital event passes.
              </span>
            </div>

            {/* Event Venue */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2 flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>OFFICIAL VENUE / LOCATION</span>
              </label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="e.g. MILLENNIUM HALL, ADDIS ABABA, ETHIOPIA"
                className="w-full px-4 py-3 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
              />
              <span className="text-[11px] text-[#777777] font-mono mt-1 block">
                Physical arena where checked-in players assemble.
              </span>
            </div>

            {/* Hero Attendees Display Text */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2">
                HERO STATISTIC DISPLAY (EXPECTED ATTENDEES TEXT)
              </label>
              <input
                type="text"
                value={heroAttendeesDisplay}
                onChange={(e) => setHeroAttendeesDisplay(e.target.value)}
                placeholder="e.g. 100-1000 or 500+ or 200-300"
                className="w-full px-4 py-3 rounded-xl border text-base font-bold text-[#CCFF00] font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-[#CCFF00]/30"
              />
              <span className="text-[11px] text-[#777777] font-mono mt-1 block">
                Controls the large headline number on the homepage hero banner.
              </span>
            </div>

            {/* Registration Open/Closed Gate Switch */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-white/10 bg-black/40">
              <span className="text-xs font-mono uppercase text-[#cccccc] font-bold">
                REGISTRATION GATE STATUS
              </span>
              <div className="flex items-center gap-3 my-2">
                <input
                  type="checkbox"
                  id="regGate"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="w-5 h-5 accent-[#CCFF00] cursor-pointer rounded"
                />
                <label htmlFor="regGate" className="text-sm font-bold text-white cursor-pointer font-sans">
                  {registrationOpen ? 'REGISTRATIONS OPEN TO THE PUBLIC' : 'REGISTRATIONS TEMPORARILY CLOSED / PAUSED'}
                </label>
              </div>
              <span className="text-[11px] font-mono text-[#888888]">
                When paused, new visitors will be notified that registration is temporarily on hold.
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: QUOTA & VIP TICKET CONFIGURATION
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#111111]">
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
              <SettingsCogIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                ATTENDEE QUOTA &amp; VIP PASS PRICING
              </h2>
              <p className="text-xs text-[#999999] font-mono">
                Set total attendance quota cap and custom VIP pass fee.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Max Capacity */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2">
                MAXIMUM ATTENDEE CAPACITY (SEATS / PASSES)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  step="10"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl border text-lg font-bold text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
                />
                <span className="text-xs font-mono font-bold text-[#CCFF00] whitespace-nowrap">
                  PLAYERS
                </span>
              </div>
              <p className="text-[11px] text-[#777777] font-mono mt-1.5">
                Once registrations reach {maxCapacity}, future applicants are queued onto the waitlist.
              </p>
            </div>

            {/* VIP Price */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2">
                VIP ALL-ACCESS TICKET PRICE (ETB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={vipPrice}
                  onChange={(e) => setVipPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl border text-lg font-bold text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
                />
                <span className="text-xs font-mono font-bold text-[#CCFF00] whitespace-nowrap">
                  ETB
                </span>
              </div>
              <p className="text-[11px] text-[#777777] font-mono mt-1.5">
                Applicants choosing VIP will be instructed to pay this exact amount.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-white/10 mt-6">
            <input
              type="checkbox"
              id="vipEnabledCheck"
              checked={vipEnabled}
              onChange={(e) => setVipEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#CCFF00] cursor-pointer rounded"
            />
            <label htmlFor="vipEnabledCheck" className="text-sm text-white font-medium cursor-pointer">
              Enable VIP Pass tier option on the public registration form
            </label>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: OFFICIAL PAYMENT ACCOUNTS (TELEBIRR & AWASH BANK)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#111111]">
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                OFFICIAL PAYMENT ACCOUNTS (TELEBIRR &amp; AWASH BANK)
              </h2>
              <p className="text-xs text-[#999999] font-mono">
                These numbers and recipient names are shown directly to VIP registrants with one-click copy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Telebirr Settings */}
            <div className="p-5 rounded-xl border border-amber-500/30 bg-[#161208] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-white text-base uppercase tracking-wider">
                  TELEBIRR ACCOUNT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400">
                  INSTANT TRANSFER
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  TELEBIRR PHONE NUMBER
                </label>
                <input
                  type="text"
                  value={telebirrNumber}
                  onChange={(e) => setTelebirrNumber(e.target.value)}
                  placeholder="+251950986841"
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-bold text-amber-400 font-mono outline-none focus:border-amber-400 bg-black/60 border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  ACCOUNT HOLDER / RECEIVER NAME
                </label>
                <input
                  type="text"
                  value={telebirrName}
                  onChange={(e) => setTelebirrName(e.target.value)}
                  placeholder="Tsige Dagne or Alamawed Begashawe"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-medium outline-none focus:border-amber-400 bg-black/60 border-white/10"
                />
              </div>
            </div>

            {/* Awash Bank Settings */}
            <div className="p-5 rounded-xl border border-orange-500/30 bg-[#161008] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-white text-base uppercase tracking-wider">
                  AWASH BANK ACCOUNT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400">
                  BANK TRANSFER
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  AWASH ACCOUNT NUMBER
                </label>
                <input
                  type="text"
                  value={awashAccount}
                  onChange={(e) => setAwashAccount(e.target.value)}
                  placeholder="013201378990300"
                  className="w-full px-4 py-2.5 rounded-xl border text-base font-bold text-amber-400 font-mono outline-none focus:border-amber-400 bg-black/60 border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
                  ACCOUNT HOLDER / RECEIVER NAME
                </label>
                <input
                  type="text"
                  value={awashName}
                  onChange={(e) => setAwashName(e.target.value)}
                  placeholder="Tsige Dagne"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-medium outline-none focus:border-amber-400 bg-black/60 border-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: COMMUNITY & SOCIAL PLATFORMS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#111111]">
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <LinkChainIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                COMMUNITY CHANNELS &amp; SOCIAL HUBS
              </h2>
              <p className="text-xs text-[#999999] font-mono">
                Official Telegram and Discord links for attendee inquiries and support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2">
                OFFICIAL TELEGRAM CHANNEL / SUPPORT LINK
              </label>
              <input
                type="url"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="https://t.me/pubgmethiopia"
                className="w-full px-4 py-3 rounded-xl border text-sm text-white font-mono outline-none focus:border-blue-400 bg-[#1a1a1a] border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-2">
                OFFICIAL DISCORD SERVER LINK
              </label>
              <input
                type="url"
                value={discordLink}
                onChange={(e) => setDiscordLink(e.target.value)}
                placeholder="https://discord.gg/pubgethiopia"
                className="w-full px-4 py-3 rounded-xl border text-sm text-white font-mono outline-none focus:border-blue-400 bg-[#1a1a1a] border-white/10"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: AI BIOMETRIC KYC FACIAL ENGINE
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="p-6 sm:p-8 rounded-2xl border relative overflow-hidden"
          style={{
            backgroundColor: '#111111',
            borderColor: hasGeminiKey ? 'rgba(204,255,0,0.25)' : 'rgba(245,158,11,0.3)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <ShieldSecurityIcon className="w-6 h-6 text-[#CCFF00] shrink-0" />
              <div>
                <h2
                  className="text-xl uppercase tracking-wider text-white font-bold"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  AI BIOMETRIC FACIAL VERIFICATION ENGINE (KYC)
                </h2>
                <span className="text-xs font-mono text-[#888888]">
                  Multimodal Neural Vision Model · Anti-Brother / Anti-Lookalike Protection
                </span>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-auto flex items-center gap-1.5 ${
                hasGeminiKey
                  ? 'bg-green-500/20 text-green-300 border-green-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {hasGeminiKey ? (
                <>
                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-400" />
                  <span>ACTIVE (GEMINI VISION CONNECTED)</span>
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>API KEY NOT CONFIGURED</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-[#cccccc] leading-relaxed mb-4">
            To prevent applicants from registering with their brother&apos;s or family member&apos;s National ID card, our system uses <strong className="text-white">Google Gemini 1.5 Flash Vision</strong>. Gemini conducts an anatomical bone structure, ear, nose, and jawline comparison, ensuring lookalikes and brothers are rejected.
          </p>

          {geminiTestFeedback && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2 ${
                geminiTestFeedback.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {geminiTestFeedback.success ? (
                <CheckCircleIcon className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{geminiTestFeedback.message}</span>
            </div>
          )}

          <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc]">
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
                className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isTestingGemini ? (
                  'TESTING...'
                ) : (
                  <>
                    <LightningBoltIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>TEST KEY</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#888888] pt-1">
              <span>Free Tier: 15 Requests / Minute at 0 ETB cost forever.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#CCFF00] hover:underline flex items-center gap-1"
              >
                Get Free Google Gemini Key at aistudio.google.com →
              </a>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#CCFF00]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="font-heading font-bold text-sm text-white uppercase tracking-wider block">
              READY TO PUBLISH CHANGES?
            </span>
            <span className="text-xs font-mono text-[#999999]">
              Updates apply instantly to all live website visitors and registration steps.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2 bg-[#CCFF00] text-[#050505]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>SAVING CHANGES...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-black" />
                  <span>SAVE WEBSITE SETTINGS</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
