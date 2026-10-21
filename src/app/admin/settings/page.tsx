'use client';

import React, { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [heroAttendeesDisplay, setHeroAttendeesDisplay] = useState('100-1000');
  const [vipPrice, setVipPrice] = useState(500);
  const [vipEnabled, setVipEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestFeedback, setGeminiTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

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
          setVipPrice(d.vipPrice);
          setVipEnabled(d.vipEnabled);
          setHasGeminiKey(Boolean(d.hasGeminiKey));
          if (d.geminiApiKey) setGeminiApiKey(d.geminiApiKey);
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
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (geminiApiKey && !geminiApiKey.includes('••••')) {
          setHasGeminiKey(true);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
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
    <div className="max-w-4xl space-y-8">
      <div>
        <h1
          className="text-3xl tracking-wider uppercase mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          EVENT, AI KYC &amp; VIP SETTINGS
        </h1>
        <p className="text-sm" style={{ color: '#999999' }}>
          Configure Google Gemini Vision AI biometric facial matching, attendee capacity quota, and VIP pass pricing.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-xs uppercase text-[#999999]">MAX CAPACITY QUOTA</span>
          <div className="text-2xl font-black font-heading text-[#CCFF00] mt-1">
            {maxCapacity} PLAYERS
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {stats.totalRegistrations || 0} registered ({Math.round(((stats.totalRegistrations || 0) / (maxCapacity || 1)) * 100)}%)
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-xs uppercase text-[#999999]">CURRENT VIP PRICE</span>
          <div className="text-2xl font-black font-heading text-[#CCFF00] mt-1">
            {vipPrice.toLocaleString()} ETB
          </div>
          <span className="text-[11px] text-[#666666] font-mono">Per VIP attendee</span>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-xs uppercase text-[#999999]">VIP TICKETS CLAIMED</span>
          <div className="text-2xl font-black font-heading text-white mt-1">
            {stats.vipCount}
          </div>
          <span className="text-[11px] text-[#666666] font-mono">
            {stats.standardCount} Standard Passes
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-xs uppercase text-[#999999]">AI KYC STATUS</span>
          <div className="text-xl font-black font-heading text-[#22c55e] mt-1 flex items-center gap-1.5">
            <span className={hasGeminiKey ? 'text-[#CCFF00]' : 'text-amber-400'}>
              {hasGeminiKey ? '● GEMINI AI ACTIVE' : '○ KEY REQUIRED'}
            </span>
          </div>
          <span className="text-[11px] text-[#888888] font-mono">
            {hasGeminiKey ? 'Brother anti-fraud enabled' : 'Configure key below'}
          </span>
        </div>
      </div>

      {/* AI Biometric Facial Verification Card */}
      <div
        className="p-6 sm:p-8 rounded-2xl border relative overflow-hidden"
        style={{ backgroundColor: '#111111', borderColor: hasGeminiKey ? 'rgba(204,255,0,0.25)' : 'rgba(245,158,11,0.3)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤖</span>
            <div>
              <h2
                className="text-xl uppercase tracking-wider text-white"
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
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
              hasGeminiKey
                ? 'bg-green-500/20 text-green-300 border-green-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {hasGeminiKey ? '✓ ACTIVE (GEMINI VISION CONNECTED)' : '⚠️ API KEY NOT CONFIGURED'}
          </span>
        </div>

        <p className="text-xs text-[#cccccc] leading-relaxed mb-4">
          To prevent applicants from registering with their brother&apos;s or family member&apos;s National ID card, our system uses <strong className="text-white">Google Gemini 1.5 Flash Vision</strong>. Gemini conducts an anatomical bone structure, ear, nose, and jawline comparison, ensuring different people (including brothers) are rejected.
        </p>

        {geminiTestFeedback && (
          <div
            className={`mb-4 p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2 ${
              geminiTestFeedback.success
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>{geminiTestFeedback.success ? '✓' : '✗'}</span>
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
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00]"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
            />
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={isTestingGemini}
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors disabled:opacity-50"
            >
              {isTestingGemini ? 'TESTING...' : '⚡ TEST KEY'}
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

      {/* Main Settings Form */}
      <div
        className="p-6 sm:p-8 rounded-2xl border"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <h2
          className="text-xl uppercase tracking-wider mb-6 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
        >
          <span>⚙️</span> ATTENDEE QUOTA &amp; VIP PASS CONFIGURATION
        </h2>

        {saveSuccess && (
          <div
            className="mb-6 p-4 rounded-xl text-sm border flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(34,197,94,0.1)',
              borderColor: 'rgba(34,197,94,0.3)',
              color: '#22c55e',
            }}
          >
            <span>✓</span> Settings saved successfully! Capacity quota, VIP pricing, and Gemini AI key are updated live.
          </div>
        )}

        {error && (
          <div
            className="mb-6 p-4 rounded-xl text-sm border"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Section Display Text (Range or Number) */}
          <div className="pb-6 border-b border-white/10">
            <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-amber-300 font-bold">
              HERO STATISTIC DISPLAY (EXPECTED ATTENDEES TEXT)
            </label>
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="text"
                placeholder="e.g. 100-1000 or 1000+ or 200-300"
                value={heroAttendeesDisplay}
                onChange={(e) => setHeroAttendeesDisplay(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-lg font-bold text-[#CCFF00] outline-none focus:border-[#CCFF00] font-mono tracking-wider"
                style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(204,255,0,0.3)' }}
              />
              <span className="text-xs font-mono text-[#999999] whitespace-nowrap">
                EXPECTED ATTENDEES
              </span>
            </div>
            <p className="text-xs text-[#999999] mt-2">
              Controls the headline number/range shown on the homepage hero (e.g. <strong className="text-white">100-1000</strong> or <strong className="text-white">200-300</strong>).
            </p>
          </div>

          {/* Max Capacity Section */}
          <div className="pb-6 border-b border-white/10">
            <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-[#cccccc]">
              MAXIMUM ATTENDEE CAPACITY (NUMBER OF PEOPLE)
            </label>
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-xl border text-lg font-bold text-white outline-none focus:border-[#CCFF00] font-mono"
                style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <span className="text-sm font-mono font-bold text-[#CCFF00] whitespace-nowrap">
                PLAYERS
              </span>
            </div>
            <p className="text-xs text-[#999999] mt-2">
              Sets the attendee limit for the event. Once total registrations reach this number, future registrants are placed on the waitlist.
            </p>
          </div>

          {/* VIP Price Section */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider mb-2 text-[#cccccc]">
              VIP PASS TICKET PRICE (ETHIOPIAN BIRR - ETB)
            </label>
            <div className="flex items-center gap-3 max-w-md">
              <input
                type="number"
                min="0"
                step="50"
                value={vipPrice}
                onChange={(e) => setVipPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 rounded-xl border text-lg font-bold text-white outline-none focus:border-[#CCFF00] font-mono"
                style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
              />
              <span className="text-sm font-mono font-bold text-[#CCFF00] whitespace-nowrap">
                ETB
              </span>
            </div>
            <p className="text-xs text-[#999999] mt-2">
              Attendees choosing VIP Pass during registration will see this exact amount.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="vipEnabled"
              checked={vipEnabled}
              onChange={(e) => setVipEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#CCFF00] cursor-pointer rounded"
            />
            <label htmlFor="vipEnabled" className="text-sm text-white font-medium cursor-pointer">
              Enable VIP Pass tier on registration form
            </label>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              style={{
                backgroundColor: '#CCFF00',
                color: '#050505',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {saving ? 'SAVING CHANGES...' : 'SAVE SETTINGS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
