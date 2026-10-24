import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { RegistrationsTableClient } from '@/components/admin/RegistrationsTableClient';
import { StarVipIcon } from '@/components/ui/TacticalIcons';

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
            <StarVipIcon className="w-4 h-4 text-amber-400 shrink-0" />
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
          <option value="VIP">VIP Passes Only</option>
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

      {/* Interactive Table with Select All, Batch Actions & Clear All */}
      <RegistrationsTableClient
        registrations={registrations.map((r) => ({
          id: r.id,
          referenceId: r.referenceId,
          fullName: r.fullName,
          inGameName: r.inGameName,
          pubgUid: r.pubgUid,
          ticketTier: r.ticketTier,
          paymentMethod: r.paymentMethod,
          paymentTxnCode: r.paymentTxnCode,
          telegramUsername: r.telegramUsername,
          paymentStatus: r.paymentStatus,
          category: r.category,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
        statusColors={statusColors}
        totalCount={total}
      />

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
