import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let total = 0, pending = 0, confirmed = 0, checkedIn = 0, rejected = 0, waitlisted = 0;
  let recent: { id: string; referenceId: string; fullName: string; inGameName: string; category: string; status: string; createdAt: Date }[] = [];

  try {
    total = await prisma.registration.count();
    pending = await prisma.registration.count({ where: { status: 'PENDING' } });
    confirmed = await prisma.registration.count({ where: { status: 'CONFIRMED' } });
    checkedIn = await prisma.registration.count({ where: { status: 'CHECKED_IN' } });
    rejected = await prisma.registration.count({ where: { status: 'REJECTED' } });
    waitlisted = await prisma.registration.count({ where: { status: 'WAITLISTED' } });
    recent = await prisma.registration.findMany({
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
    });
  } catch (err) {
    console.error('[ADMIN_DASHBOARD_DB_ERROR]', err);
  }

  const capacity = 300;
  const capacityPct = Math.round((total / capacity) * 100);

  const stats = [
    { label: 'Total Registered', value: total, color: '#CCFF00', icon: '📊' },
    { label: 'Pending Review', value: pending, color: '#f59e0b', icon: '⏳' },
    { label: 'Confirmed', value: confirmed, color: '#22c55e', icon: '✓' },
    { label: 'Checked In', value: checkedIn, color: '#CCFF00', icon: '📱' },
    { label: 'Rejected', value: rejected, color: '#ef4444', icon: '✗' },
    { label: 'Waitlisted', value: waitlisted, color: '#3b82f6', icon: '📋' },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#CCFF00' }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
            SYSTEM ACTIVE
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl tracking-wider uppercase"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          COMMAND CENTER
        </h1>
        <p className="text-sm mt-1" style={{ color: '#666666' }}>
          PUBG Mobile Community Assembly Ethiopia — Registration Overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border group hover:border-opacity-30 transition-all duration-300"
            style={{ backgroundColor: '#0a0a0a', borderColor: `${s.color}22` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
              <span
                className="text-3xl sm:text-4xl font-black"
                style={{ fontFamily: 'var(--font-heading)', color: s.color }}
              >
                {s.value}
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider leading-tight" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      <div
        className="rounded-xl border p-5 mb-8"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-sm uppercase tracking-wider" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              VENUE CAPACITY
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
              Maximum capacity: {capacity} attendees
            </p>
          </div>
          <div className="text-right">
            <span
              className="text-2xl font-black"
              style={{ fontFamily: 'var(--font-heading)', color: capacityPct > 90 ? '#ef4444' : '#CCFF00' }}
            >
              {capacityPct}%
            </span>
            <p className="text-xs" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
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
          <p className="mt-2 text-xs" style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
            ⚠ APPROACHING MAXIMUM CAPACITY
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Link
          href="/admin/registrations"
          className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xl">📋</span>
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Registrations</p>
            <p className="text-[10px]" style={{ color: '#666666' }}>View & manage</p>
          </div>
        </Link>
        <Link
          href="/admin/check-in"
          className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xl">📱</span>
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Check-In</p>
            <p className="text-[10px]" style={{ color: '#666666' }}>Scan passes</p>
          </div>
        </Link>
        <Link
          href="/admin/announcements"
          className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xl">📢</span>
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Announcements</p>
            <p className="text-[10px]" style={{ color: '#666666' }}>Post updates</p>
          </div>
        </Link>
        <Link
          href="/admin/export"
          className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 hover:border-[#CCFF00]/30 group"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-xl">📥</span>
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Export</p>
            <p className="text-[10px]" style={{ color: '#666666' }}>Download CSV</p>
          </div>
        </Link>
      </div>

      {/* Recent Registrations Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2
            className="text-base tracking-wider uppercase flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#CCFF00' }} />
            RECENT REGISTRATIONS
          </h2>
          <Link
            href="/admin/registrations"
            className="text-xs uppercase tracking-wider hover:opacity-80 transition-opacity"
            style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}
          >
            VIEW ALL →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#111111' }}>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  Reference
                </th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  Player
                </th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider hidden md:table-cell" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  IGN
                </th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  Category
                </th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  Status
                </th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-wider hidden sm:table-cell" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: '#666666' }}>
                    <div className="text-3xl mb-2">📭</div>
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
