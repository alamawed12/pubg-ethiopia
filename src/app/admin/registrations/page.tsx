import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
    tier?: string;
    paymentStatus?: string;
  }>;
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.tier) where.ticketTier = params.tier;
  if (params.paymentStatus) where.paymentStatus = params.paymentStatus;

  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search } },
      { inGameName: { contains: params.search } },
      { referenceId: { contains: params.search } },
      { pubgUid: { contains: params.search } },
      { paymentTxnCode: { contains: params.search } },
      { telegramUsername: { contains: params.search } },
    ];
  }

  type RegistrationItem = Awaited<ReturnType<typeof prisma.registration.findMany>>[number];
  let registrations: RegistrationItem[] = [];
  let total = 0;
  let pendingVipCount = 0;

  try {
    const result = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.registration.count({ where }),
      prisma.registration.count({
        where: {
          ticketTier: 'VIP',
          OR: [
            { paymentStatus: 'PENDING_APPROVAL' },
            { paymentStatus: 'UNPAID', status: 'PENDING' },
          ],
        },
      }),
    ]);
    registrations = result[0];
    total = result[1];
    pendingVipCount = result[2];
  } catch (err) {
    console.error('[REGISTRATIONS_PAGE_DB_ERROR]', err);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    WAITLISTED: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    CHECKED_IN: { bg: 'rgba(204,255,0,0.15)', text: '#CCFF00' },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-3xl tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
          >
            REGISTRATIONS ({total})
          </h1>
          <p className="text-xs font-mono text-[#999999] mt-0.5">
            Manage registrations, audit ID documents, and verify Telebirr / Awash VIP payments.
          </p>
        </div>

        {/* Quick Pending VIP Alert Pill */}
        {pendingVipCount > 0 && (
          <Link
            href="/admin/registrations?tier=VIP&status=PENDING"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-heading font-black text-xs uppercase tracking-wider hover:bg-amber-500/30 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
          >
            <span>⭐</span>
            <span>{pendingVipCount} VIP PAYMENT{pendingVipCount > 1 ? 'S' : ''} AWAITING APPROVAL</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-8">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search name, IGN, UID, Ref, Txn, Telegram..."
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none flex-1 min-w-[220px]"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        />

        {/* Ticket Tier Filter */}
        <select
          name="tier"
          defaultValue={params.tier}
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <option value="">All Tiers</option>
          <option value="VIP">★ VIP Passes Only</option>
          <option value="STANDARD">Standard Passes Only</option>
        </select>

        {/* Status Filter */}
        <select
          name="status"
          defaultValue={params.status}
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Approval</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CHECKED_IN">Checked In</option>
        </select>

        {/* Category Filter */}
        <select
          name="category"
          defaultValue={params.category}
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <option value="">All Categories</option>
          <option value="attendee">Attendee</option>
          <option value="tournament_player">Tournament Player</option>
          <option value="team_rep">Team Representative</option>
          <option value="content_creator">Content Creator</option>
          <option value="volunteer">Volunteer</option>
        </select>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-semibold tracking-wider uppercase cursor-pointer"
          style={{ backgroundColor: '#CCFF00', color: '#050505', fontFamily: 'var(--font-heading)' }}
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Ref', 'Player', 'IGN & UID', 'Tier', 'VIP Payment / Txn', 'Category', 'Status', 'Date', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs uppercase tracking-wider"
                    style={{ color: '#999999' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#666666' }}>
                    No registrations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const sc = statusColors[r.status] || statusColors.PENDING;
                  const isVip = r.ticketTier === 'VIP';
                  const isPendingApproval = isVip && (r.paymentStatus === 'PENDING_APPROVAL' || r.status === 'PENDING');

                  return (
                    <tr
                      key={r.id}
                      className={`border-b transition-colors ${
                        isPendingApproval ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]' : 'hover:bg-white/[0.02]'
                      }`}
                      style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                    >
                      {/* Reference */}
                      <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', color: '#CCFF00' }}>
                        <Link href={`/admin/registrations/${r.id}`} className="hover:underline font-bold">
                          {r.referenceId}
                        </Link>
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3 font-semibold text-white">
                        {r.fullName}
                      </td>

                      {/* IGN & UID */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-white text-xs">{r.inGameName}</div>
                        <div className="font-mono text-[11px] text-[#888888]">UID: {r.pubgUid}</div>
                      </td>

                      {/* Tier */}
                      <td className="px-4 py-3">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            ★ VIP
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#666666]">
                            STD
                          </span>
                        )}
                      </td>

                      {/* VIP Payment Details Column */}
                      <td className="px-4 py-3">
                        {isVip ? (
                          <div className="space-y-1">
                            {r.paymentStatus === 'APPROVED' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                ✓ PAID & APPROVED
                              </span>
                            ) : r.paymentStatus === 'REJECTED' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                                ✗ PAYMENT REJECTED
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/50">
                                ⏳ APPROVAL REQUIRED
                              </span>
                            )}

                            {/* Txn Code and Method */}
                            <div className="font-mono text-[11px] text-white">
                              {r.paymentTxnCode ? (
                                <span className="text-amber-300 font-bold">TXN: {r.paymentTxnCode}</span>
                              ) : (
                                <span className="text-[#888888]">No Txn code</span>
                              )}
                            </div>

                            {/* Telegram Contact */}
                            {r.telegramUsername && (
                              <div className="font-mono text-[10px] text-sky-400">
                                TG: {r.telegramUsername}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-[#666666]">Free Registration</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 capitalize text-xs" style={{ color: '#999999' }}>
                        {r.category.replace('_', ' ')}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs uppercase tracking-wider font-bold"
                          style={{ backgroundColor: sc.bg, color: sc.text, fontFamily: 'var(--font-mono)' }}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: '#666666' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/registrations/${r.id}`}
                          className={`inline-block px-3 py-1.5 rounded text-xs font-heading font-black uppercase tracking-wider transition-all ${
                            isPendingApproval
                              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                        >
                          {isPendingApproval ? 'APPROVE VIP →' : 'DETAILS →'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/admin/registrations?page=${page - 1}&status=${params.status || ''}&category=${params.category || ''}&search=${params.search || ''}&tier=${params.tier || ''}`}
              className="px-4 py-2 rounded-lg text-sm border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#999999' }}
            >
              ← Prev
            </Link>
          )}
          <span className="px-4 py-2 text-sm" style={{ color: '#999999' }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/registrations?page=${page + 1}&status=${params.status || ''}&category=${params.category || ''}&search=${params.search || ''}&tier=${params.tier || ''}`}
              className="px-4 py-2 rounded-lg text-sm border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#999999' }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
