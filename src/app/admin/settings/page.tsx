'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  SearchIcon,
  ChatBubbleLeftRightIcon,
  EmergencySirenIcon,
  CheckedInDeviceIcon,
  StarVipIcon,
} from '@/components/ui/TacticalIcons';

type TabKey =
  | 'event'
  | 'announcements'
  | 'vip'
  | 'sponsors'
  | 'lookup'
  | 'security'
  | 'socials'
  | 'ai'
  | 'admins';

interface TabItem {
  id: TabKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'event', label: 'Event & Gate', Icon: CalendarIcon },
  { id: 'announcements', label: 'Announce', Icon: MegaphoneIcon },
  { id: 'vip', label: 'VIP & Banks', Icon: CreditCardIcon },
  { id: 'sponsors', label: 'Sponsors', Icon: TrophyIcon },
  { id: 'lookup', label: 'Quick Lookup', Icon: SearchIcon },
  { id: 'security', label: 'Gate Security', Icon: EmergencySirenIcon },
  { id: 'socials', label: 'Socials', Icon: ChatBubbleLeftRightIcon },
  { id: 'ai', label: 'AI Vision', Icon: LightningBoltIcon },
  { id: 'admins', label: 'Admin Team', Icon: ShieldSecurityIcon },
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
  const [telegramLink, setTelegramLink] = useState('https://t.me/pubgm_eth');
  const [telegramSupport, setTelegramSupport] = useState('https://t.me/pubgmethsupport');
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
          if (d.telegramSupport) setTelegramSupport(d.telegramSupport);
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

  // ─── QUICK LOOKUP & GATE SECURITY STATE & HANDLERS ───
  type LookupFilterKey = 'ALL' | 'VIP' | 'STANDARD' | 'PENDING' | 'CHECKED_IN';

  interface LookupAttendee {
    id: string;
    referenceId: string;
    fullName: string;
    inGameName: string;
    pubgUid: string;
    phoneNumber: string;
    ticketTier?: string;
    status: string;
    paymentStatus?: string | null;
    teamName?: string | null;
    telegramUsername?: string | null;
    checkedInAt?: string | null;
    checkedInBy?: string | null;
  }

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupFilter, setLookupFilter] = useState<LookupFilterKey>('ALL');
  const [lookupResults, setLookupResults] = useState<LookupAttendee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [lookupActionToast, setLookupActionToast] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedPassRef, setCopiedPassRef] = useState<string | null>(null);

  // Gate Security Protocol State
  const [securityNotice, setSecurityNotice] = useState(
    'ADMISSION TEMPORARILY ON HOLD — VENUE REACHED OPERATIONAL CAPACITY'
  );

  const performLookup = async (
    filterOverride?: LookupFilterKey,
    customQuery?: string
  ) => {
    const activeFilter = filterOverride !== undefined ? filterOverride : lookupFilter;
    const activeQ = (customQuery !== undefined ? customQuery : lookupQuery).trim();
    setIsSearching(true);
    setLookupSearched(true);
    setLookupActionToast(null);

    try {
      const params = new URLSearchParams();
      if (activeQ) params.set('search', activeQ);
      if (activeFilter === 'VIP') params.set('ticketTier', 'VIP');
      if (activeFilter === 'STANDARD') params.set('ticketTier', 'STANDARD');
      if (activeFilter === 'PENDING') params.set('status', 'PENDING');
      if (activeFilter === 'CHECKED_IN') params.set('status', 'CHECKED_IN');
      params.set('limit', '30');

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.registrations)) {
        setLookupResults(data.registrations);
      } else {
        setLookupResults([]);
      }
    } catch {
      setLookupResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickApprove = async (id: string, ign: string) => {
    setActionLoadingId(id);
    setLookupActionToast(null);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONFIRM', ids: [id] }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLookupResults((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'CONFIRMED' } : item))
        );
        setLookupActionToast({
          success: true,
          message: `Player "${ign}" pass confirmed & active!`,
        });
      } else {
        setLookupActionToast({
          success: false,
          message: data.error || 'Failed to approve registration.',
        });
      }
    } catch {
      setLookupActionToast({
        success: false,
        message: 'Network error approving registration.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickCheckIn = async (ref: string, ign: string, id: string) => {
    setActionLoadingId(id);
    setLookupActionToast(null);
    try {
      const res = await fetch('/api/scanner/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-scanner-key': 'pubget_gate_2026_scanner',
        },
        body: JSON.stringify({
          ticket: ref,
          staffName: 'Admin HQ Quick Gate',
          secretKey: 'pubget_gate_2026_scanner',
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status === 'SUCCESS' || data.status === 'ALREADY_CHECKED_IN')) {
        setLookupResults((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'CHECKED_IN',
                  checkedInAt: new Date().toISOString(),
                  checkedInBy: 'Admin HQ',
                }
              : item
          )
        );
        setLookupActionToast({
          success: true,
          message: `Player "${ign}" checked in at gate successfully!`,
        });
      } else {
        setLookupActionToast({
          success: false,
          message: data.error || data.message || 'Check-in failed.',
        });
      }
    } catch {
      setLookupActionToast({
        success: false,
        message: 'Network error processing check-in.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyPassLink = (ref: string) => {
    const url = `${window.location.origin}/portal/ticket/${ref}`;
    navigator.clipboard.writeText(url);
    setCopiedPassRef(ref);
    setTimeout(() => setCopiedPassRef(null), 3000);
  };

  const engageEmergencyLockdown = () => {
    setRegistrationOpen(false);
    setAnnouncementEnabled(true);
    setAnnouncementType('urgent');
    setAnnouncementTitle('GATE ADMISSION TEMPORARILY ON HOLD');
    setAnnouncementMessage(securityNotice);
    setAnnouncementLinkText('CHECK TICKET STATUS');
    setAnnouncementLinkUrl('/portal');
  };

  const disengageEmergencyLockdown = () => {
    setRegistrationOpen(true);
    setAnnouncementEnabled(false);
  };

  const adjustCapacityQuota = (delta: number) => {
    setMaxCapacity((prev) => Math.max(10, prev + delta));
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
          telegramSupport: telegramSupport.trim(),
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
          APPLE-STYLE TAB NAVIGATION PILLS (ALL 9 TABS 100% VISIBLE)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#141414] border border-white/10 shadow-lg">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 sm:py-3 rounded-xl font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                isSelected
                  ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.35)] scale-[1.02]'
                  : 'text-neutral-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <TabIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-black' : 'text-[#CCFF00]'}`} />
              <span className="leading-tight text-center truncate max-w-full">{tab.label}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  SPONSOR / BRAND NAME *
                </label>
                <input
                  type="text"
                  value={sponsorNameInput}
                  onChange={(e) => setSponsorNameInput(e.target.value)}
                  placeholder="e.g. Telebirr, Level Infinite, Awash Bank"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  LOGO IMAGE URL / PATH
                </label>
                <input
                  type="text"
                  value={sponsorLogoInput}
                  onChange={(e) => setSponsorLogoInput(e.target.value)}
                  placeholder="e.g. /images/pubg-mobile-logo.png or https://..."
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                />
              </div>
            </div>

            {/* PNG Logo Upload & Preview Box */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
              <span className="font-sans text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                SPONSOR PNG LOGO (TRANSPARENT BACKGROUND)
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Logo Preview (Transparent, borderless logo) */}
                <div className="w-24 h-16 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                  {sponsorLogoInput ? (
                    <img
                      src={sponsorLogoInput}
                      alt="Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-heading font-black text-xs text-neutral-500 uppercase">
                      NO LOGO
                    </span>
                  )}
                </div>

                {/* Upload Action */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans text-xs font-bold uppercase tracking-wider cursor-pointer text-center transition-colors">
                      <span>CHOOSE PNG LOGO FILE</span>
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/webp,image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {sponsorLogoInput && (
                      <button
                        type="button"
                        onClick={() => setSponsorLogoInput('')}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-sans font-bold uppercase cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Recommended: Transparent PNG or SVG logos. The logo will loop seamlessly from right to left on the main homepage without borders or cards.
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
                {editingSponsorId ? '✓ UPDATE LOGO' : '+ ADD LOGO TO LOOP'}
              </button>
            </div>
          </div>

          {/* Existing Sponsors List */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                CURRENT SPONSOR LOGOS ({sponsorsList.length})
              </h3>
              <span className="text-xs text-neutral-400 font-sans">
                {sponsorsList.length} logo{sponsorsList.length === 1 ? '' : 's'} in loop
              </span>
            </div>

            {sponsorsList.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-white/10 rounded-xl bg-black/20">
                <p className="text-sm text-neutral-400 font-sans">No sponsor logos added yet.</p>
                <p className="text-xs text-neutral-500 font-sans">
                  Use the form above to add sponsor PNG logos to the continuous homepage loop.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sponsorsList.map((sponsor, idx) => (
                  <div
                    key={sponsor.id}
                    className="p-3 sm:p-4 rounded-xl border border-white/10 bg-[#161616] hover:bg-[#1a1a1a] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Left: Pure Logo Preview & Brand Name */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-12 rounded-lg bg-black/70 flex items-center justify-center p-1.5 shrink-0">
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="font-heading font-black text-xs text-neutral-500">
                            {sponsor.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-white tracking-wide uppercase truncate">
                          {sponsor.name}
                        </h4>
                        <span className="text-[11px] text-neutral-400 font-sans">
                          {sponsor.logo ? 'Custom PNG Logo' : 'Text Wordmark'}
                        </span>
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
                        title="Delete Logo"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Marquee Preview Box (Exact match to homepage: Pure PNGs looping without borders) */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  HOMEPAGE MARQUEE PREVIEW (PURE LOGOS, NO BORDERS)
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-sans">
                Infinite Right-to-Left Loop
              </span>
            </div>

            <div className="relative w-full overflow-hidden py-6 rounded-xl bg-black/60 border border-white/5">
              <div className="absolute top-0 bottom-0 left-0 w-16 z-10 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-16 z-10 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none" />

              {sponsorsList.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500 font-sans">
                  Add sponsor logos above to see the live marquee ticker preview.
                </div>
              ) : (
                <div className="animate-marquee items-center gap-12 py-3 px-6 cursor-default select-none border-none">
                  {[...sponsorsList, ...sponsorsList, ...sponsorsList].map((sp, i) => (
                    <div
                      key={`preview-${sp.id}-${i}`}
                      className="flex items-center justify-center shrink-0 border-none bg-transparent px-4"
                    >
                      {sp.logo ? (
                        <img
                          src={sp.logo}
                          alt={sp.name}
                          className="h-10 sm:h-12 w-auto max-w-[140px] object-contain filter brightness-95"
                        />
                      ) : (
                        <span className="font-heading font-black text-sm text-neutral-400 uppercase">
                          {sp.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 5: QUICK ATTENDEE & PASS LOOKUP (FAST VERIFICATION TOOL)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    QUICK ATTENDEE &amp; PASS LOOKUP
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Instantly verify any player by PUBG Mobile UID, Reference ID, Phone, IGN, or Squad name.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-sans text-xs font-bold uppercase tracking-wider">
                  REAL-TIME REGISTRY SEARCH
                </span>
              </div>
            </div>

            {/* Toast feedback */}
            {lookupActionToast && (
              <div
                className={`p-3.5 rounded-xl text-xs font-sans border flex items-center gap-2 ${
                  lookupActionToast.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {lookupActionToast.success ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{lookupActionToast.message}</span>
              </div>
            )}

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                performLookup();
              }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Enter PUBG UID (e.g. 5123456789), Ref (e.g. PUBG-VIP-...), Phone, IGN..."
                    className="w-full pl-10 pr-14 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                  />
                  {lookupQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setLookupQuery('');
                        performLookup(lookupFilter, '');
                      }}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>SEARCHING...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-4 h-4" />
                      <span>SEARCH REGISTRY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Filter Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  FILTERS:
                </span>
                {[
                  { id: 'ALL' as const, label: 'All Players' },
                  { id: 'VIP' as const, label: 'VIP Passes Only' },
                  { id: 'STANDARD' as const, label: 'Standard Passes' },
                  { id: 'PENDING' as const, label: 'Pending Approval' },
                  { id: 'CHECKED_IN' as const, label: 'Checked In at Gate' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setLookupFilter(f.id);
                      performLookup(f.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      lookupFilter === f.id
                        ? 'bg-[#CCFF00] text-black shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Results List */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                SEARCH RESULTS {lookupSearched && `(${lookupResults.length})`}
              </h3>
              {lookupSearched && (
                <span className="text-xs text-neutral-400 font-sans">
                  {lookupResults.length === 0 ? 'No matching attendees' : `${lookupResults.length} attendee(s) located`}
                </span>
              )}
            </div>

            {isSearching ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#CCFF00] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-sans text-neutral-400 uppercase tracking-wider">
                  Querying database registry...
                </p>
              </div>
            ) : !lookupSearched ? (
              <div className="py-12 text-center space-y-3 border border-dashed border-white/10 rounded-xl bg-black/20 p-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                  RAPID ATTENDEE VERIFICATION TOOL
                </h4>
                <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto leading-relaxed">
                  Enter any player&apos;s in-game name, PUBG UID, phone number, or ticket reference code above to instantly pull up their full status, payment proof, and gate check-in record.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLookupFilter('VIP');
                      performLookup('VIP');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans text-xs font-bold uppercase cursor-pointer"
                  >
                    View VIP Pass Holders →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLookupFilter('PENDING');
                      performLookup('PENDING');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/10 font-sans text-xs font-bold uppercase cursor-pointer"
                  >
                    View Pending Review →
                  </button>
                </div>
              </div>
            ) : lookupResults.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-white/10 rounded-xl bg-black/20">
                <p className="text-sm text-neutral-300 font-sans font-bold uppercase">NO PLAYERS FOUND</p>
                <p className="text-xs text-neutral-500 font-sans">
                  No registered attendees match &quot;{lookupQuery}&quot;. Please verify the spelling or UID.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lookupResults.map((r) => {
                  const isVip = r.ticketTier === 'VIP';
                  const isApproved = r.status === 'CONFIRMED' || r.status === 'CHECKED_IN';
                  const isCheckedIn = r.status === 'CHECKED_IN';
                  const isLoadingAction = actionLoadingId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="p-4 sm:p-5 rounded-xl border border-white/10 bg-[#161616] hover:bg-[#1a1a1a] transition-all space-y-3"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* VIP vs Standard Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-sans text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isVip
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                : 'bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00]'
                            }`}
                          >
                            {isVip && <StarVipIcon className="w-3 h-3 text-amber-400" />}
                            <span>{isVip ? 'VIP PASS' : 'STANDARD PASS'}</span>
                          </span>

                          {/* Admission Status */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-sans text-[11px] font-bold uppercase tracking-wider ${
                              isCheckedIn
                                ? 'bg-[#CCFF00]/20 border border-[#CCFF00]/50 text-[#CCFF00]'
                                : isApproved
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                                : r.status === 'PENDING'
                                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                                : 'bg-red-500/15 border border-red-500/40 text-red-400'
                            }`}
                          >
                            {isCheckedIn
                              ? '● CHECKED IN'
                              : isApproved
                              ? '✓ CONFIRMED'
                              : r.status === 'PENDING'
                              ? '⏳ PENDING REVIEW'
                              : '✕ REJECTED'}
                          </span>

                          {/* Payment Status for VIP */}
                          {isVip && (
                            <span
                              className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider ${
                                r.paymentStatus === 'APPROVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : r.paymentStatus === 'PENDING_APPROVAL'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              PAYMENT: {r.paymentStatus || 'UNPAID'}
                            </span>
                          )}
                        </div>

                        {/* Reference Code */}
                        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs text-neutral-400">
                          <span className="text-white font-bold">{r.referenceId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPassLink(r.referenceId)}
                            className="text-[11px] text-[#CCFF00] hover:underline cursor-pointer"
                          >
                            {copiedPassRef === r.referenceId ? '✓ Copied Link' : 'Copy Ticket Link'}
                          </button>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                            IN-GAME NAME (IGN)
                          </span>
                          <span className="font-bold text-white text-sm truncate block mt-0.5">
                            {r.inGameName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                            PUBG MOBILE UID
                          </span>
                          <span className="font-mono text-white text-sm tracking-wider block mt-0.5">
                            {r.pubgUid}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                            FULL NAME
                          </span>
                          <span className="text-neutral-300 truncate block mt-0.5 font-medium">
                            {r.fullName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">
                            PHONE NUMBER
                          </span>
                          <span className="font-mono text-neutral-300 block mt-0.5">
                            {r.phoneNumber}
                          </span>
                        </div>
                      </div>

                      {/* Additional Details (Team & Gate status) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] font-sans text-neutral-400">
                        <div className="flex items-center gap-3">
                          {r.teamName && (
                            <span>
                              Squad: <strong className="text-neutral-200">{r.teamName}</strong>
                            </span>
                          )}
                          {r.telegramUsername && (
                            <span>
                              Telegram: <strong className="text-[#CCFF00]">@{r.telegramUsername.replace('@', '')}</strong>
                            </span>
                          )}
                          {isCheckedIn && (
                            <span className="text-[#CCFF00] font-medium flex items-center gap-1">
                              <CheckedInDeviceIcon className="w-3.5 h-3.5" />
                              Checked in {r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : 'at Gate'}
                            </span>
                          )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/registrations/${r.id}`}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-sans text-xs font-bold uppercase transition-colors"
                          >
                            Full Dossier →
                          </Link>

                          {r.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(r.id, r.inGameName)}
                              disabled={isLoadingAction}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isLoadingAction ? 'Approving...' : '✓ Approve Pass'}
                            </button>
                          )}

                          {!isCheckedIn && isApproved && (
                            <button
                              type="button"
                              onClick={() => handleQuickCheckIn(r.referenceId, r.inGameName, r.id)}
                              disabled={isLoadingAction}
                              className="px-3 py-1.5 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-sans text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isLoadingAction ? 'Checking In...' : '● Check In at Gate'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 6: GATE SECURITY & EMERGENCY CONTROLS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Emergency Gate Lockdown Card */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-red-500/40 bg-gradient-to-b from-[#180d0d] to-[#120a0a] space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <EmergencySirenIcon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <span>EMERGENCY GATE PROTOCOL &amp; ADMISSION LOCKDOWN</span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Immediate 1-click crowd control to pause registrations and broadcast venue capacity alerts.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 self-start sm:self-auto ${
                  registrationOpen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${registrationOpen ? 'bg-emerald-400' : 'bg-red-400 animate-ping'}`} />
                <span>{registrationOpen ? 'ADMISSION: ACTIVE (OPEN)' : 'ADMISSION: LOCKDOWN (CLOSED)'}</span>
              </span>
            </div>

            {/* Emergency Action Box */}
            <div className="p-5 rounded-xl border border-white/10 bg-black/50 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    {registrationOpen ? 'ENGAGE IMMEDIATE GATE HOLD' : 'DISENGAGE GATE HOLD (RESUME REGISTRATIONS)'}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-xl">
                    {registrationOpen
                      ? 'Instantly locks public registrations, puts visitors on hold, and broadcasts an emergency alert banner across the site.'
                      : 'Unlocks the registration gate and restores the registration form for new attendee submissions.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={registrationOpen ? engageEmergencyLockdown : disengageEmergencyLockdown}
                  className={`px-6 py-3.5 rounded-xl font-sans text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 shrink-0 ${
                    registrationOpen
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
                      : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[#CCFF00]/40'
                  }`}
                >
                  {registrationOpen ? '🚨 ENGAGE EMERGENCY LOCKDOWN' : '✓ RE-OPEN REGISTRATION GATE'}
                </button>
              </div>

              {/* Emergency Notice Customizer */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300">
                  EMERGENCY BROADCAST MESSAGE (DISPLAYED TO VISITORS WHEN HOLD IS ACTIVE)
                </label>
                <input
                  type="text"
                  value={securityNotice}
                  onChange={(e) => setSecurityNotice(e.target.value)}
                  placeholder="e.g. ADMISSION TEMPORARILY ON HOLD — VENUE REACHED OPERATIONAL CAPACITY"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-red-400 bg-[#161616] border-white/10"
                />
              </div>
            </div>
          </div>

          {/* Real-time Capacity Gauge Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <CheckedInDeviceIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-sans font-bold text-white uppercase tracking-tight">
                    LIVE CAPACITY &amp; CROWD GAUGE
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans">
                    Monitors overall capacity threshold against server database quota.
                  </p>
                </div>
              </div>

              <span className="font-heading font-black text-2xl text-[#CCFF00]">
                {Math.min(100, Math.round(((stats.totalRegistrations || 0) / (maxCapacity || 1)) * 100))}%
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (stats.totalRegistrations || 0) >= maxCapacity
                      ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                      : (stats.totalRegistrations || 0) >= maxCapacity * 0.85
                      ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                      : 'bg-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.8)]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round(((stats.totalRegistrations || 0) / (maxCapacity || 1)) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs font-sans text-neutral-400 pt-1">
                <span>{stats.totalRegistrations || 0} Registered Attendees</span>
                <span>{Math.max(0, maxCapacity - (stats.totalRegistrations || 0))} Remaining Slots</span>
                <span>Hard Cap: {maxCapacity}</span>
              </div>
            </div>

            {/* Fast Quota Bumpers */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-300 block">
                FAST ATTENDANCE QUOTA BUMPERS (1-TAP CAPACITY EXPANSION)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: '+25 SLOTS', delta: 25 },
                  { label: '+50 SLOTS', delta: 50 },
                  { label: '+100 SLOTS', delta: 100 },
                  { label: '-50 SLOTS', delta: -50 },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => adjustCapacityQuota(b.delta)}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-sans text-xs font-bold uppercase tracking-wider cursor-pointer text-center transition-colors hover:border-[#CCFF00]/40"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VIP Bypass Switch */}
            <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-sans text-sm font-bold text-white uppercase tracking-wider block">
                  VIP PASS PRICING OVERRIDE (EMERGENCY 0 ETB FREE VIP)
                </span>
                <span className="text-xs text-neutral-400 font-sans">
                  Allows attendees to claim VIP passes without payment during special promotional waves.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setVipPrice(vipPrice === 0 ? 500 : 0)}
                className={`px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  vipPrice === 0
                    ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                    : 'bg-white/10 text-neutral-300 hover:text-white'
                }`}
              >
                {vipPrice === 0 ? '● FREE VIP PASS ACTIVE (0 ETB)' : '○ REGULAR VIP PRICE (500 ETB)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 7: OFFICIAL SOCIAL CHANNELS & COMMUNITY HUBS
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'socials' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121212] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-bold text-white uppercase tracking-tight">
                    COMMUNITY CHANNELS &amp; OFFICIAL SOCIALS
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Configure the tournament Telegram channel and Discord server. All public footer links route here.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-sans text-xs font-bold uppercase tracking-wider">
                COMMUNITY HUBS
              </span>
            </div>

            {/* Official Telegram Channel Card */}
            <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-500/[0.04] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="font-sans text-xs font-bold text-sky-300 uppercase tracking-wider">
                    PRIMARY TELEGRAM BROADCAST CHANNEL
                  </span>
                </div>
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-sans font-bold uppercase transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open @pubgm_eth Channel ↗</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  TELEGRAM CHANNEL DESTINATION URL
                </label>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="https://t.me/pubgm_eth"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-sky-400 bg-black/50 border-white/10"
                />
                <p className="text-[11px] text-neutral-400 font-sans mt-1.5 leading-relaxed">
                  Active across the site footer, registration confirmation screen, and attendee pass portal. This is the single official channel for PUBG Mobile Ethiopia.
                </p>
              </div>
            </div>

            {/* Official Telegram Support Team Card */}
            <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-500/[0.04] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-sans text-xs font-bold text-amber-300 uppercase tracking-wider">
                    TELEGRAM SUPPORT TEAM ACCOUNT
                  </span>
                </div>
                <a
                  href={telegramSupport}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-sans font-bold uppercase transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Support ↗</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  SUPPORT ACCOUNT LINK / HANDLE
                </label>
                <input
                  type="text"
                  value={telegramSupport}
                  onChange={(e) => setTelegramSupport(e.target.value)}
                  placeholder="https://t.me/pubgmethsupport"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-amber-400 bg-black/50 border-white/10"
                />
                <p className="text-[11px] text-neutral-400 font-sans mt-1.5 leading-relaxed">
                  Direct attendee support line for payment disputes, ticket recovery, and registration help. Displayed across the homepage contact section, FAQ, and footer.
                </p>
              </div>
            </div>

            {/* Official Discord Server Card */}
            <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span className="font-sans text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    DISCORD COMMUNITY SERVER
                  </span>
                </div>
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-sans font-bold uppercase transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Discord ↗</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  DISCORD INVITE URL
                </label>
                <input
                  type="text"
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  placeholder="https://discord.gg/pubgethiopia"
                  className="w-full px-4 py-3 rounded-xl border text-sm text-white font-sans outline-none focus:border-indigo-400 bg-black/50 border-white/10"
                />
                <p className="text-[11px] text-neutral-400 font-sans mt-1.5">
                  Primary voice communication and squad recruitment hub for attendees.
                </p>
              </div>
            </div>

            {/* Channel Policy Notice */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-sans font-bold uppercase tracking-wider">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OFFICIAL CHANNEL COMPLIANCE</span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Obsolete social links (TikTok, YouTube, and Instagram) have been permanently retired from the website layout. All community traffic and official announcements are consolidated into the verified Telegram channel (<strong>@pubgm_eth</strong>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 8: AI BIOMETRICS & VERIFICATION
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
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 9: HEAD ADMIN ACCESS & SUB-ADMIN MANAGEMENT
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <AdminManagementSection />
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
