'use client';

import React, { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [maxCapacity, setMaxCapacity] = useState(300);
  const [heroAttendeesDisplay, setHeroAttendeesDisplay] = useState('100-1000');
  const [vipPrice, setVipPrice] = useState(500);
  const [vipEnabled, setVipEnabled] = useState(true);
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
          if (d.stats) setStats(d.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
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
          EVENT &amp; VIP PASS SETTINGS
        </h1>
        <p className="text-sm" style={{ color: '#999999' }}>
          Configure pass pricing, VIP tier benefits, and registration rules for the assembly.
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
          <span className="font-mono text-xs uppercase text-[#999999]">ESTIMATED VIP REVENUE</span>
          <div className="text-2xl font-black font-heading text-[#22c55e] mt-1">
            {(stats.vipCount * vipPrice).toLocaleString()} ETB
          </div>
          <span className="text-[11px] text-[#666666] font-mono">Total generated</span>
        </div>
      </div>

      {/* Settings Form */}
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
            <span>✓</span> Settings saved successfully! Capacity quota and VIP pricing are updated live on the website.
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
              Controls the exact headline number/range shown on the homepage hero (e.g. <strong className="text-white">100-1000</strong>, <strong className="text-white">1000</strong>, or <strong className="text-white">200-300</strong>).
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
              Sets the attendee limit for the event. Once total registrations reach this number, future registrants are automatically placed on the waitlist.
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
