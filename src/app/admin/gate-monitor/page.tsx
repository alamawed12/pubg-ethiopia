'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  StarVipIcon,
  ShieldSecurityIcon,
  UsersIcon,
} from '@/components/ui/TacticalIcons';

interface GateMetrics {
  maxCapacity: number;
  totalRegistered: number;
  totalCheckedIn: number;
  vipCheckedIn: number;
  standardCheckedIn: number;
  totalVipRegistered: number;
  totalStandardRegistered: number;
  capacityPercentage: number;
  velocity15m: number;
  velocity60m: number;
  remainingCapacity: number;
}

interface RecentCheckIn {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  ticketTier: string;
  category: string;
  checkedInAt: string;
  checkedInBy: string | null;
  phoneNumber: string;
  selfieImage?: string | null;
  idFrontImage?: string | null;
  faceMatchStatus?: string | null;
  faceMatchScore?: number | null;
}

function getInitials(name: string): string {
  if (!name) return 'PG';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    attendee: 'Attendee',
    tournament_player: 'Tournament Player',
    team_rep: 'Team Rep',
    content_creator: 'Content Creator',
    volunteer: 'Crew / Volunteer',
  };
  return map[cat] || cat.replace(/_/g, ' ');
}

export default function AdminGateMonitorPage() {
  const [metrics, setMetrics] = useState<GateMetrics | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(10);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<RecentCheckIn | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      params.append('_t', Date.now().toString());

      const res = await fetch(`/api/admin/gate-monitor?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRecentEntries(data.recentCheckIns || []);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to load gate telemetry', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling effect
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      fetchData();
    }, refreshIntervalSec * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, refreshIntervalSec, fetchData]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEntry(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const capacityPct = metrics?.capacityPercentage || 0;
  const isHighCapacity = capacityPct >= 85;
  const isNearCapacity = capacityPct >= 70 && capacityPct < 85;
  const latestEntry = recentEntries.length > 0 ? recentEntries[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-[#CCFF00] animate-ping' : 'bg-white/40'}`} />
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
              LIVE VENUE GATE TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-black uppercase tracking-tight text-white mt-1">
            GATE COMMAND &amp; VENUE MONITOR
          </h1>
          <p className="text-sm font-sans text-neutral-400 mt-0.5">
            Real-time venue check-ins, attendee access verification, and admission telemetry (Privacy Protected).
          </p>
        </div>

        {/* Live Status & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-neutral-400">REFRESH:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all cursor-pointer ${
                autoRefresh ? 'bg-[#CCFF00] text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]' : 'bg-white/10 text-white'
              }`}
            >
              {autoRefresh ? `${refreshIntervalSec}S LIVE` : 'PAUSED'}
            </button>
            {autoRefresh && (
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                aria-label="Refresh interval in seconds"
                className="bg-black/60 text-[#CCFF00] border border-white/20 rounded px-1.5 py-0.5 text-[11px] outline-none cursor-pointer"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </select>
            )}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono uppercase bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">SYNC</span>
          </button>
        </div>
      </div>

      {/* ─── Main Venue Capacity Gauge Banner ─── */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isHighCapacity
            ? 'border-red-500/50 bg-[#1c0d0d]'
            : isNearCapacity
            ? 'border-amber-500/40 bg-[#17130a]'
            : 'border-[#CCFF00]/30 bg-[#0c120c]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                VENUE OCCUPANCY STATUS
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isHighCapacity
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : isNearCapacity
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40'
                }`}
              >
                {isHighCapacity ? 'APPROACHING QUOTA LIMIT' : isNearCapacity ? 'HIGH DENSITY' : 'NORMAL INFLOW'}
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-heading text-white mt-1">
              {metrics?.totalCheckedIn || 0}{' '}
              <span className="text-xl sm:text-2xl text-neutral-400 font-normal font-mono">
                / {metrics?.maxCapacity || 300} MAX CAPACITY
              </span>
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-4xl sm:text-5xl font-black font-heading text-[#CCFF00]">
              {capacityPct}%
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {metrics?.remainingCapacity || 0} SLOTS REMAINING
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-4 rounded-full bg-black/60 overflow-hidden border border-white/10 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHighCapacity
                ? 'bg-gradient-to-r from-amber-400 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                : isNearCapacity
                ? 'bg-gradient-to-r from-[#CCFF00] to-amber-400'
                : 'bg-gradient-to-r from-[#88bb00] to-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, capacityPct))}%` }}
          />
        </div>
      </div>

      {/* ─── Breakdown Metrics ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-400 tracking-wider block">
            VIP GUESTS INSIDE
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-300 mt-1">
            {metrics?.vipCheckedIn || 0}{' '}
            <span className="text-xs font-mono text-neutral-500 font-normal">
              / {metrics?.totalVipRegistered || 0} VIPs
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
            {metrics?.totalVipRegistered
              ? `${Math.round(((metrics.vipCheckedIn || 0) / metrics.totalVipRegistered) * 100)}% attendance`
              : '0% attendance'}
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-400 tracking-wider block">
            STANDARD PASSES
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {metrics?.standardCheckedIn || 0}{' '}
            <span className="text-xs font-mono text-neutral-500 font-normal">
              / {metrics?.totalStandardRegistered || 0}
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
            Standard audience check-ins
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(204,255,0,0.15)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#CCFF00] tracking-wider block">
            CHECK-IN VELOCITY (15M)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-[#CCFF00] mt-1">
            +{metrics?.velocity15m || 0}
          </div>
          <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
            Entries in the last 15 mins
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-neutral-400 tracking-wider block">
            HOURLY RATE (60M)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {metrics?.velocity60m || 0} / hr
          </div>
          <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
            Last sync: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ─── SPOTLIGHT: LATEST ADMITTED ATTENDEE (PRO VENUE HUD) ─── */}
      {latestEntry && !search && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[#CCFF00]/40 bg-gradient-to-r from-[#0d170d] via-[#121212] to-[#141414] shadow-[0_0_25px_rgba(204,255,0,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Large Spotlight Tactical Avatar */}
              <div
                onClick={() => setSelectedEntry(latestEntry)}
                className="relative group shrink-0 cursor-pointer"
                title="Click to inspect attendee credentials"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 transition-all duration-300 group-hover:scale-105 ${
                    latestEntry.ticketTier === 'VIP'
                      ? 'bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'bg-gradient-to-br from-[#CCFF00] via-[#88bb00] to-emerald-500 shadow-[0_0_20px_rgba(204,255,0,0.35)]'
                  }`}
                >
                  <div className="w-full h-full bg-[#111111] rounded-[14px] overflow-hidden flex flex-col items-center justify-center relative p-2">
                    <span className="font-heading font-black text-xl tracking-wider text-white">
                      {getInitials(latestEntry.fullName || latestEntry.inGameName)}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-widest mt-0.5 ${
                        latestEntry.ticketTier === 'VIP' ? 'text-amber-400' : 'text-[#CCFF00]'
                      }`}
                    >
                      {latestEntry.ticketTier === 'VIP' ? 'VIP' : 'PUBG·M'}
                    </span>

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Corner Status Indicator Badge */}
                <div className="absolute -bottom-1 -right-1">
                  {latestEntry.ticketTier === 'VIP' ? (
                    <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-[#111111] flex items-center justify-center shadow-lg">
                      <StarVipIcon className="w-3.5 h-3.5 text-black" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#CCFF00] border-2 border-[#111111] flex items-center justify-center shadow-lg">
                      <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Spotlight Details */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#CCFF00]">
                    LATEST GATE ADMISSION SPOTLIGHT
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-white uppercase tracking-wide">
                    {latestEntry.inGameName}
                  </h3>
                  <span className="text-neutral-400 text-sm font-sans font-medium">
                    ({latestEntry.fullName})
                  </span>
                  {latestEntry.ticketTier === 'VIP' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-heading font-black text-xs tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                      <StarVipIcon className="w-3.5 h-3.5 text-amber-400" />
                      VIP ALL-ACCESS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-heading font-bold text-xs tracking-wider uppercase bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/40">
                      STANDARD PASS
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase bg-white/5 border border-white/10 text-neutral-300">
                    {formatCategory(latestEntry.category)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-neutral-400 mt-1.5">
                  <span>
                    UID: <strong className="text-white font-semibold">{latestEntry.pubgUid}</strong>
                  </span>
                  <span className="text-white/20">•</span>
                  <span>
                    REF: <strong className="text-[#CCFF00]">{latestEntry.referenceId}</strong>
                  </span>
                  <span className="text-white/20">•</span>
                  <span>PHONE: {latestEntry.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Right: Inspection CTA & Timestamp */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                  ADMITTED AT GATE
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-white">
                  {new Date(latestEntry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {latestEntry.checkedInBy && (
                  <span className="text-[11px] font-mono text-neutral-400 block">
                    Officer: {latestEntry.checkedInBy.split('@')[0]}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(latestEntry)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase font-sans bg-[#CCFF00] text-black hover:bg-[#b8e600] transition-colors cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.25)]"
              >
                Inspect Gate Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Live Check-in Feed Section ─── */}
      <div
        className="p-4 sm:p-6 rounded-2xl border space-y-4"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
              LIVE ADMISSION LOG STREAM
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              ({recentEntries.length} Records)
            </span>
          </div>

          {/* Quick Lookup Bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Filter by Name, IGN, UID or Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border text-xs text-white placeholder-neutral-500 outline-none focus:border-[#CCFF00] font-mono transition-colors"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Clear filter"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Admission Table / Feed */}
        {recentEntries.length === 0 ? (
          <div className="p-12 text-center text-sm font-mono text-neutral-500 space-y-2">
            <UsersIcon className="w-10 h-10 mx-auto text-neutral-600" />
            <p>{search ? 'No check-in records matching the search query.' : 'No attendees checked in yet today.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono hover:bg-white/[0.03] px-3 rounded-xl transition-colors group"
              >
                {/* Left: Face Thumbnail + Attendee Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Pro Gamer Emblem Beside Name */}
                  <div
                    onClick={() => setSelectedEntry(entry)}
                    className="relative group/face shrink-0 cursor-pointer"
                    title="Click to inspect attendee credentials"
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 transition-all duration-200 group-hover/face:scale-105 ${
                        entry.ticketTier === 'VIP'
                          ? 'bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-500 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                          : 'bg-gradient-to-br from-[#CCFF00] via-[#88bb00] to-emerald-500 shadow-[0_0_10px_rgba(204,255,0,0.25)]'
                      }`}
                    >
                      <div className="w-full h-full bg-[#111111] rounded-[14px] overflow-hidden flex flex-col items-center justify-center relative p-1.5">
                        <span className="font-heading font-black text-sm sm:text-base tracking-wider text-white">
                          {getInitials(entry.fullName || entry.inGameName)}
                        </span>
                        <span
                          className={`text-[7px] font-mono font-bold uppercase tracking-widest mt-0.5 ${
                            entry.ticketTier === 'VIP' ? 'text-amber-400' : 'text-[#CCFF00]'
                          }`}
                        >
                          {entry.ticketTier === 'VIP' ? 'VIP' : 'PUBG·M'}
                        </span>

                        {/* Hover Overlay Zoom Icon */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/face:opacity-100 transition-opacity flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Corner Status Badge */}
                    <div className="absolute -bottom-1 -right-1">
                      {entry.ticketTier === 'VIP' ? (
                        <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-[#111111] flex items-center justify-center shadow-md">
                          <StarVipIcon className="w-3 h-3 text-black" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#CCFF00] border-2 border-[#111111] flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Credentials Beside Avatar */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => setSelectedEntry(entry)}
                        className="font-heading text-base sm:text-lg font-black text-white tracking-wide truncate cursor-pointer hover:text-[#CCFF00] transition-colors"
                      >
                        {entry.inGameName}
                      </span>
                      <span className="text-neutral-400 text-xs font-sans truncate">
                        ({entry.fullName})
                      </span>

                      {/* Ticket Tier Badge */}
                      {entry.ticketTier === 'VIP' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-heading font-black text-[10px] tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.25)]">
                          <StarVipIcon className="w-3 h-3 text-amber-400" />
                          <span>VIP PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-heading font-bold text-[10px] tracking-wider uppercase bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                          <span>STANDARD</span>
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase bg-white/5 border border-white/10 text-neutral-300">
                        {formatCategory(entry.category)}
                      </span>
                    </div>

                    {/* Metadata Sub-row */}
                    <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span>
                        UID: <strong className="text-neutral-200">{entry.pubgUid}</strong>
                      </span>
                      <span className="text-white/20">•</span>
                      <span>
                        REF: <strong className="text-[#CCFF00]">{entry.referenceId}</strong>
                      </span>
                      <span className="text-white/20">•</span>
                      <span>PHONE: {entry.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp, Staff & Inspect Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 text-right shrink-0 border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                  <div>
                    <span className="text-white font-bold block text-sm">
                      {new Date(entry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      {new Date(entry.checkedInAt).toLocaleDateString()}
                    </span>
                  </div>

                  {entry.checkedInBy && (
                    <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-mono">
                      Staff: {entry.checkedInBy.split('@')[0]}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-[#CCFF00] hover:text-black text-neutral-300 border border-white/10 transition-colors cursor-pointer"
                    title="Inspect Attendee Gate Dossier"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── BIOMETRIC FACE & ATTENDEE DOSSIER MODAL ─── */}
      {selectedEntry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#111111] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
                    GATE ADMISSION SECURITY DOSSIER
                  </span>
                </div>
                <h3 className="text-2xl font-black font-heading text-white uppercase mt-1">
                  {selectedEntry.inGameName}
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Legal Name: <strong className="text-white">{selectedEntry.fullName}</strong> • Ref: {selectedEntry.referenceId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                aria-label="Close dossier"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy & ID Document Verification Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  {selectedEntry.idFrontImage ? 'NATIONAL ID DOCUMENT (GATE VERIFICATION)' : 'IDENTITY PRIVACY VERIFICATION'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PRIVACY SECURED
                </span>
              </div>

              {/* ID Document or Privacy Banner */}
              <div
                className={`relative rounded-2xl overflow-hidden border p-3 bg-black flex items-center justify-center min-h-[160px] max-h-[300px] ${
                  selectedEntry.ticketTier === 'VIP' ? 'border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : 'border-[#CCFF00]/40'
                }`}
              >
                {selectedEntry.idFrontImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedEntry.idFrontImage}
                    alt="National ID Card"
                    className="max-h-[280px] w-auto max-w-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="py-8 text-center text-neutral-400 font-mono text-xs space-y-2 max-w-md mx-auto">
                    <ShieldSecurityIcon className="w-10 h-10 mx-auto text-[#CCFF00]" />
                    <p className="font-bold text-white uppercase text-sm font-heading">
                      FACIAL BIOMETRICS EXEMPT (PRIVACY MODE)
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      In accordance with player privacy policies, no facial photos or camera selfies are collected from VIP or standard attendees.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendee Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-xs">
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">PUBG UID</span>
                <span className="text-white font-bold text-sm">{selectedEntry.pubgUid}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">TICKET TIER</span>
                <span className={selectedEntry.ticketTier === 'VIP' ? 'text-amber-400 font-black text-sm' : 'text-[#CCFF00] font-black text-sm'}>
                  {selectedEntry.ticketTier} PASS
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">CATEGORY</span>
                <span className="text-neutral-200 font-medium text-xs">
                  {formatCategory(selectedEntry.category)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase text-[10px] block">PHONE</span>
                <span className="text-neutral-200 font-medium text-xs">{selectedEntry.phoneNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 uppercase text-[10px] block">CHECK-IN TIMESTAMP</span>
                <span className="text-neutral-200 font-medium text-xs">
                  {new Date(selectedEntry.checkedInAt).toLocaleString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 uppercase text-[10px] block">GATE SCANNER OFFICER</span>
                <span className="text-neutral-200 font-medium text-xs">
                  {selectedEntry.checkedInBy || 'Main Admission Terminal'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                href={`/admin/registrations/${selectedEntry.id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider bg-[#CCFF00] text-black hover:bg-[#b8e600] transition-colors text-center shadow-[0_0_15px_rgba(204,255,0,0.25)]"
              >
                Open Full Player Profile
              </Link>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-sans text-xs font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors cursor-pointer text-center"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
