'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

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
}

export default function AdminGateMonitorPage() {
  const [metrics, setMetrics] = useState<GateMetrics | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(10);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/gate-monitor?${params.toString()}`);
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

  const capacityPct = metrics?.capacityPercentage || 0;
  const isHighCapacity = capacityPct >= 85;
  const isNearCapacity = capacityPct >= 70 && capacityPct < 85;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-[#CCFF00] animate-ping' : 'bg-white/40'}`} />
            <span className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
              LIVE VENUE TELEMETRY
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            GATE COMMAND &amp; CAPACITY MONITOR
          </h1>
          <p className="text-sm text-[#999999] mt-0.5">
            Real-time gate check-in throughput, venue occupancy quota, and live admission log stream.
          </p>
        </div>

        {/* Live Status & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-[#888888]">REFRESH:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all cursor-pointer ${
                autoRefresh ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white'
              }`}
            >
              {autoRefresh ? `${refreshIntervalSec}S LIVE` : 'PAUSED'}
            </button>
            {autoRefresh && (
              <select
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                aria-label="Refresh interval in seconds"
                className="bg-black/50 text-[#CCFF00] border border-white/20 rounded px-1.5 py-0.5 text-[11px] outline-none"
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

      {/* Main Venue Capacity Gauge Banner */}
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
              <span className="font-mono text-xs uppercase tracking-wider text-[#999999]">
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
              <span className="text-xl sm:text-2xl text-[#888888] font-normal font-mono">
                / {metrics?.maxCapacity || 300} MAX CAPACITY
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-black font-heading text-[#CCFF00]">
              {capacityPct}%
            </div>
            <span className="text-xs font-mono text-[#888888]">
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

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            VIP GUESTS INSIDE
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-300 mt-1">
            {metrics?.vipCheckedIn || 0}{' '}
            <span className="text-xs font-mono text-[#777777] font-normal">
              / {metrics?.totalVipRegistered || 0} VIPs
            </span>
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            {metrics?.totalVipRegistered
              ? `${Math.round(((metrics.vipCheckedIn || 0) / metrics.totalVipRegistered) * 100)}% attendance`
              : '0% attendance'}
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            STANDARD PASSES
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {metrics?.standardCheckedIn || 0}{' '}
            <span className="text-xs font-mono text-[#777777] font-normal">
              / {metrics?.totalStandardRegistered || 0}
            </span>
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
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
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Entries in the last 15 mins
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            HOURLY RATE (60M)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {metrics?.velocity60m || 0} / hr
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Live Check-in Feed Section */}
      <div
        className="p-4 sm:p-5 rounded-2xl border space-y-4"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <h2 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
              LIVE ADMISSION LOG STREAM
            </h2>
          </div>

          {/* Quick Lookup Bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Filter by Name, IGN, UID or Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border text-xs text-white placeholder-[#666666] outline-none focus:border-[#CCFF00] font-mono"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1.5 text-[10px] text-[#999999] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Live Admission Table / Feed */}
        {recentEntries.length === 0 ? (
          <div className="p-8 text-center text-sm font-mono text-[#777777]">
            {search ? 'No check-in records matching the search.' : 'No attendees checked in yet today.'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-bold text-white tracking-wide">
                        {entry.inGameName}
                      </span>
                      <span className="text-[#888888]">({entry.fullName})</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          entry.ticketTier === 'VIP'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : 'bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30'
                        }`}
                      >
                        {entry.ticketTier}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#777777] flex items-center gap-3">
                      <span>UID: <strong className="text-[#aaaaaa]">{entry.pubgUid}</strong></span>
                      <span>REF: {entry.referenceId}</span>
                      <span>PHONE: {entry.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                  <div>
                    <span className="text-white font-bold block">
                      {new Date(entry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-[#777777]">
                      {new Date(entry.checkedInAt).toLocaleDateString()}
                    </span>
                  </div>
                  {entry.checkedInBy && (
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-[#999999]">
                      Staff: {entry.checkedInBy.split('@')[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
