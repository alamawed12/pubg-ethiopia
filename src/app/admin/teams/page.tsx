'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface SquadPlayer {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  category: string;
  ticketTier: string;
  status: string;
  squadDetails: string | null;
  createdAt: string;
}

interface TeamGroup {
  teamName: string;
  memberCount: number;
  isFull: boolean;
  members: SquadPlayer[];
}

interface TeamStats {
  totalTeams: number;
  fullSquadsCount: number;
  partialSquadsCount: number;
  soloPlayersCount: number;
  totalTournamentPlayers: number;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamGroup[]>([]);
  const [soloPlayers, setSoloPlayers] = useState<SquadPlayer[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    totalTeams: 0,
    fullSquadsCount: 0,
    partialSquadsCount: 0,
    soloPlayersCount: 0,
    totalTournamentPlayers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'FULL' | 'PARTIAL' | 'SOLO'>('ALL');
  const [search, setSearch] = useState('');
  const [copiedTeam, setCopiedTeam] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/teams?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams || []);
        setSoloPlayers(data.soloPlayers || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load teams', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const copyRoster = (team: TeamGroup) => {
    const lines = [
      `PUBG MOBILE ETHIOPIA - SQUAD ROSTER`,
      `TEAM: ${team.teamName.toUpperCase()}`,
      `PLAYERS (${team.memberCount}/4):`,
      ...team.members.map((m, idx) => `  ${idx + 1}. ${m.inGameName} (UID: ${m.pubgUid}) - ${m.ticketTier}`),
      `CONTACT: ${team.members[0]?.phoneNumber || 'N/A'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedTeam(team.teamName);
    setTimeout(() => setCopiedTeam(null), 3000);
  };

  const filteredTeams = teams.filter((t) => {
    if (filter === 'FULL') return t.isFull;
    if (filter === 'PARTIAL') return !t.isFull;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#CCFF00]">
              ESPORTS TOURNAMENT COMMAND
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            SQUADS &amp; TOURNAMENT TEAMS
          </h1>
          <p className="text-sm text-[#999999] mt-0.5">
            Manage registered rosters, track complete vs partial 4-man squads, and inspect solo free agents.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>REFRESH</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            REGISTERED SQUADS
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {stats.totalTeams}
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Across all regions
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(204,255,0,0.2)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#CCFF00] tracking-wider block">
            READY SQUADS (4/4)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-[#CCFF00] mt-1">
            {stats.fullSquadsCount}
          </div>
          <span className="text-[11px] text-[#888888] font-mono mt-0.5 block">
            Eligible for bracket seeding
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-amber-400 tracking-wider block">
            INCOMPLETE SQUADS (&lt;4)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-400 mt-1">
            {stats.partialSquadsCount}
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Missing 1-3 teammates
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-sky-400 tracking-wider block">
            SOLO FREE AGENTS
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-sky-400 mt-1">
            {stats.soloPlayersCount}
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Looking for squad placement
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border space-y-3"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-black font-bold'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            ALL SQUADS ({stats.totalTeams})
          </button>

          <button
            onClick={() => setFilter('FULL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'FULL'
                ? 'bg-[#CCFF00] text-black font-bold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            READY (4/4) ({stats.fullSquadsCount})
          </button>

          <button
            onClick={() => setFilter('PARTIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'PARTIAL'
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            INCOMPLETE ({stats.partialSquadsCount})
          </button>

          <button
            onClick={() => setFilter('SOLO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              filter === 'SOLO'
                ? 'bg-sky-400 text-black font-bold'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            SOLO AGENTS ({stats.soloPlayersCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by Team Name, Player IGN, or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm text-white placeholder-[#666666] outline-none focus:border-[#CCFF00] font-mono"
            style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-[#999999] hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Content Display */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 font-mono text-sm text-[#999999]">LOADING SQUADS &amp; ROSTERS...</span>
        </div>
      ) : filter === 'SOLO' ? (
        /* Solo / Free Agents View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg text-white uppercase tracking-wider">
              SOLO PLAYERS / FREE AGENTS ({soloPlayers.length})
            </h2>
            <span className="text-xs font-mono text-[#888888]">
              Players seeking a squad to join
            </span>
          </div>

          {soloPlayers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#111111]">
              <p className="text-sm font-mono text-[#777777]">No solo free agents registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {soloPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-4 rounded-xl border border-white/10 bg-[#111111] hover:border-sky-400/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-base font-bold text-white">
                      {player.inGameName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/30">
                      FREE AGENT
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#888888] space-y-0.5">
                    <div>UID: <span className="text-white font-bold">{player.pubgUid}</span></div>
                    <div>NAME: <span className="text-[#cccccc]">{player.fullName}</span></div>
                    <div>PHONE: <span className="text-[#cccccc]">{player.phoneNumber}</span></div>
                    <div>TIER: <span className="text-[#CCFF00]">{player.ticketTier}</span></div>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#666666]">
                    <span>{player.referenceId}</span>
                    <Link href={`/admin/registrations`} className="text-[#CCFF00] hover:underline">
                      VIEW PROFILE →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="font-heading text-lg text-white uppercase tracking-wider">
            No squads match this filter
          </p>
          <p className="font-mono text-xs text-[#777777] mt-1">
            Try switching to another tab or clearing search keywords.
          </p>
        </div>
      ) : (
        /* Squads Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTeams.map((team) => {
            const isFull = team.isFull;
            const isCopied = copiedTeam === team.teamName;

            return (
              <div
                key={team.teamName}
                className={`p-5 rounded-2xl border transition-all ${
                  isFull
                    ? 'border-[#CCFF00]/30 bg-[#0f140f] hover:border-[#CCFF00]/50'
                    : 'border-white/10 bg-[#111111] hover:border-white/20'
                }`}
              >
                {/* Team Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide">
                        {team.teamName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isFull
                            ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/40'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        }`}
                      >
                        {team.memberCount}/4 {isFull ? 'COMPLETE SQUAD' : 'PARTIAL SQUAD'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#888888] mt-0.5">
                      Leader / Contact: <strong className="text-white">{team.members[0]?.fullName}</strong> ({team.members[0]?.phoneNumber})
                    </p>
                  </div>

                  <button
                    onClick={() => copyRoster(team)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-[#CCFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{isCopied ? 'COPIED!' : 'COPY ROSTER'}</span>
                  </button>
                </div>

                {/* Team Players Roster */}
                <div className="divide-y divide-white/5 pt-2">
                  {team.members.map((member, idx) => (
                    <div key={member.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-[#999999] font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-heading text-sm">
                              {member.inGameName}
                            </span>
                            <span className="text-[#777777] text-[11px]">({member.fullName})</span>
                          </div>
                          <span className="text-[10px] text-[#888888]">UID: {member.pubgUid}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            member.ticketTier === 'VIP'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-white/5 text-[#888888]'
                          }`}
                        >
                          {member.ticketTier}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                            member.status === 'CONFIRMED'
                              ? 'text-green-400 bg-green-500/10'
                              : member.status === 'CHECKED_IN'
                              ? 'text-[#CCFF00] bg-[#CCFF00]/10'
                              : 'text-amber-400 bg-amber-400/10'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Empty Squad Slots Placeholder */}
                  {team.memberCount < 4 &&
                    Array.from({ length: 4 - team.memberCount }).map((_, emptyIdx) => (
                      <div
                        key={`empty-${emptyIdx}`}
                        className="py-2 flex items-center gap-2.5 text-xs font-mono text-[#555555] opacity-60"
                      >
                        <span className="w-5 h-5 rounded-full border border-dashed border-white/20 flex items-center justify-center text-[10px]">
                          {team.memberCount + emptyIdx + 1}
                        </span>
                        <span className="italic">Slot open — awaiting squad member registration</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
