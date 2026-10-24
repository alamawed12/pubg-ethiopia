import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  UsersIcon,
  ClockPendingIcon,
  CheckCircleIcon,
  CheckedInDeviceIcon,
  XCircleIcon,
  ClipboardListIcon,
  CreditCardIcon,
  TrophyIcon,
  ShieldSecurityIcon,
  QrScannerIcon,
  SettingsCogIcon,
  EmptyInboxIcon,
  StarVipIcon,
  AlertTriangleIcon,
} from '@/components/ui/TacticalIcons';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let total = 0, pending = 0, confirmed = 0, checkedIn = 0, rejected = 0, waitlisted = 0, pendingVip = 0, capacity = 300;
  let recent: { id: string; referenceId: string; fullName: string; inGameName: string; category: string; status: string; createdAt: Date }[] = [];

  try {
    const [
      totalCount,
      pendingCount,
      confirmedCount,
      checkedInCount,
      rejectedCount,
      waitlistedCount,
      pendingVipCount,
      recentList,
      capacitySetting,
    ] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'PENDING' } }),
      prisma.registration.count({ where: { status: 'CONFIRMED' } }),
      prisma.registration.count({ where: { status: 'CHECKED_IN' } }),
      prisma.registration.count({ where: { status: 'REJECTED' } }),
      prisma.registration.count({ where: { status: 'WAITLISTED' } }),
      prisma.registration.count({
        where: {
          ticketTier: 'VIP',
          OR: [
            { paymentStatus: 'PENDING_APPROVAL' },
            { paymentStatus: 'UNPAID', status: 'PENDING' },
          ],
        },
      }),
      prisma.registration.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          referenceId: true,
          fullName: true,
          inGameName: true,
          category: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.systemSetting.findUnique({ where: { key: 'max_capacity' } }),
    ]);

    total = totalCount;
    pending = pendingCount;
    confirmed = confirmedCount;
    checkedIn = checkedInCount;
    rejected = rejectedCount;
    waitlisted = waitlistedCount;
    pendingVip = pendingVipCount;
    recent = recentList;

    if (capacitySetting && capacitySetting.value) {
      const parsed = parseInt(capacitySetting.value, 10);
      if (!isNaN(parsed) && parsed > 0) {
        capacity = parsed;
      }
    }
  } catch (err) {
    console.error('[ADMIN_DASHBOARD_DB_ERROR]', err);
  }

  const capacityPct = Math.round((total / capacity) * 100);

  const stats = [
    { label: 'Total Registered', value: total, color: '#CCFF00', Icon: UsersIcon },
    { label: 'Pending Review', value: pending, color: '#f59e0b', Icon: ClockPendingIcon },
    { label: 'Confirmed', value: confirmed, color: '#22c55e', Icon: CheckCircleIcon },
    { label: 'Checked In', value: checkedIn, color: '#CCFF00', Icon: CheckedInDeviceIcon },
    { label: 'Rejected', value: rejected, color: '#ef4444', Icon: XCircleIcon },
    { label: 'Waitlisted', value: waitlisted, color: '#3b82f6', Icon: ClipboardListIcon },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#CCFF00]">
            COMMAND SYSTEM ACTIVE
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-sans font-bold tracking-tight text-white uppercase">
          COMMAND CENTER
        </h1>
        <p className="text-sm font-sans text-neutral-400 font-medium mt-1">
          PUBG Mobile Community Assembly Ethiopia — Live Operations &amp; Verification Overview
        </p>
      </div>

      {/* Priority VIP Payment Approval Alert */}
      {pendingVip > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <StarVipIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg text-white uppercase tracking-wider">
                  {pendingVip} VIP PAYMENT{pendingVip > 1 ? 'S' : ''} AWAITING VERIFICATION
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[10px] uppercase font-mono animate-pulse">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs font-mono text-amber-200/90 mt-0.5">
                Attendees have provided Telebirr / Awash Bank transaction codes. Confirm funds and dispatch their passes.
              </p>
            </div>
          </div>

          <Link
            href="/admin/payments"
            className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-heading font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap cursor-pointer shrink-0"
          >
            AUDIT VIP PAYMENTS →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border group hover:border-opacity-30 transition-all duration-300"
            style={{ backgroundColor: '#0a0a0a', borderColor: `${s.color}22` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${s.color}15`,
                  borderColor: `${s.color}35`,
                  color: s.color,
                }}
              >
                <s.Icon className="w-4 h-4" />
              </div>
              <span
                className="text-3xl sm:text-4xl font-black font-heading"
                style={{ color: s.color }}
              >
                {s.value}
              </span>
            </div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Command Hubs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <Link
          href="/admin/payments"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-amber-400/50 bg-[#14120a] group"
          style={{ borderColor: 'rgba(251,191,36,0.25)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0 group-hover:scale-105 transition-transform">
            <CreditCardIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-amber-300">VIP Payments</p>
            <p className="text-[11px] font-sans text-neutral-400">Receipt clearing</p>
          </div>
        </Link>
        <Link
          href="/admin/registrations"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#CCFF00]/10 border border-[#CCFF00]/25 text-[#CCFF00] shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardListIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-white">Registrations</p>
            <p className="text-[11px] font-sans text-neutral-400">Players &amp; passes</p>
          </div>
        </Link>
        <Link
          href="/admin/teams"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-400/10 border border-amber-400/25 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <TrophyIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-white">Squads &amp; Teams</p>
            <p className="text-[11px] font-sans text-neutral-400">Esports rosters</p>
          </div>
        </Link>
        <Link
          href="/admin/gate-monitor"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-400/10 border border-cyan-400/25 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
            <ShieldSecurityIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-white">Gate Monitor</p>
            <p className="text-[11px] font-sans text-neutral-400">Live check-ins</p>
          </div>
        </Link>
        <Link
          href="/admin/check-in"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#CCFF00]/10 border border-[#CCFF00]/25 text-[#CCFF00] shrink-0 group-hover:scale-105 transition-transform">
            <QrScannerIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-white">Scanner</p>
            <p className="text-[11px] font-sans text-neutral-400">Scan QR tickets</p>
          </div>
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-400/10 border border-neutral-400/25 text-neutral-300 shrink-0 group-hover:scale-105 transition-transform">
            <SettingsCogIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-sans font-bold uppercase text-white">Settings</p>
            <p className="text-[11px] font-sans text-neutral-400">Quotas &amp; VIP</p>
          </div>
        </Link>
      </div>

      {/* Capacity Bar */}
      <div
        className="rounded-xl border p-5 mb-8"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-white">
              VENUE CAPACITY
            </h3>
            <p className="text-xs font-sans text-neutral-400 mt-0.5">
              Maximum capacity quota: {capacity} attendees
            </p>
          </div>
          <div className="text-right">
            <span
              className="text-2xl font-black font-heading"
              style={{ color: capacityPct > 90 ? '#ef4444' : '#CCFF00' }}
            >
              {capacityPct}%
            </span>
            <p className="text-xs font-sans text-neutral-400 font-semibold">
              {total} / {capacity}
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
          <div
            className="h-full rounded-full transition-all duration-700 relative"
            style={{
              width: `${Math.min(capacityPct, 100)}%`,
              backgroundColor: capacityPct > 90 ? '#ef4444' : '#CCFF00',
              boxShadow: `0 0 12px ${capacityPct > 90 ? '#ef4444' : '#CCFF00'}40`,
            }}
          />
        </div>
        {capacityPct > 90 && (
          <p className="mt-2 text-xs flex items-center gap-1.5 font-sans font-bold text-red-400">
            <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>APPROACHING MAXIMUM CAPACITY</span>
          </p>
        )}
      </div>

      {/* Recent Registrations Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-sans font-bold tracking-wider uppercase text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
            RECENT REGISTRATIONS
          </h2>
          <Link
            href="/admin/registrations"
            className="text-xs font-sans font-bold uppercase tracking-wider text-[#CCFF00] hover:underline"
          >
            VIEW ALL →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#111111' }}>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                  Reference
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                  Player
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 hidden md:table-cell">
                  IGN
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 hidden lg:table-cell">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 hidden sm:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: '#666666' }}>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mx-auto mb-3">
                      <EmptyInboxIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>No registrations yet</p>
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b transition-colors duration-200 hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/registrations/${r.id}`}
                        className="hover:underline font-bold"
                        style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                      >
                        {r.referenceId}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-white font-medium">{r.fullName}</td>
                    <td className="px-6 py-3 hidden md:table-cell" style={{ color: '#cccccc', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {r.inGameName}
                    </td>
                    <td className="px-6 py-3 capitalize hidden lg:table-cell" style={{ color: '#999999', fontSize: '12px' }}>
                      {r.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell" style={{ color: '#666666', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    WAITLISTED: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    CHECKED_IN: { bg: 'rgba(204,255,0,0.15)', text: '#CCFF00' },
  };
  const c = colors[status] || colors.PENDING;

  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold"
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: 'var(--font-mono)' }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
