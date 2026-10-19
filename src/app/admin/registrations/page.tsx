import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string; search?: string; page?: string }>;
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.search) {
    where.OR = [
      { fullName: { contains: params.search } },
      { inGameName: { contains: params.search } },
      { referenceId: { contains: params.search } },
      { pubgUid: { contains: params.search } },
    ];
  }

  type RegistrationItem = Awaited<ReturnType<typeof prisma.registration.findMany>>[number];
  let registrations: RegistrationItem[] = [];
  let total = 0;

  try {
    const result = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.registration.count({ where }),
    ]);
    registrations = result[0];
    total = result[1];
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
      <h1
        className="text-3xl tracking-wider uppercase mb-8"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        REGISTRATIONS ({total})
      </h1>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-4 mb-8">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search name, IGN, UID, ref..."
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none flex-1 min-w-[200px]"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        />
        <select
          name="status"
          defaultValue={params.status}
          className="px-4 py-2 rounded-lg border text-sm text-white outline-none"
          style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CHECKED_IN">Checked In</option>
        </select>
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
                {['Ref', 'Name', 'IGN', 'UID', 'Tier', 'Category', 'Status', 'Date'].map((h) => (
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
                  <td colSpan={8} className="px-4 py-8 text-center" style={{ color: '#666666' }}>
                    No registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const sc = statusColors[r.status] || statusColors.PENDING;
                  return (
                    <tr
                      key={r.id}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                    >
                      <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', color: '#CCFF00' }}>
                        <Link href={`/admin/registrations/${r.id}`} className="hover:underline">
                          {r.referenceId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-white">{r.fullName}</td>
                      <td className="px-4 py-3" style={{ color: '#cccccc' }}>{r.inGameName}</td>
                      <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', color: '#999999' }}>
                        {r.pubgUid}
                      </td>
                      <td className="px-4 py-3">
                        {r.ticketTier === 'VIP' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            ★ VIP
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#666666]">
                            STD
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize" style={{ color: '#999999' }}>
                        {r.category.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs uppercase tracking-wider"
                          style={{ backgroundColor: sc.bg, color: sc.text, fontFamily: 'var(--font-mono)' }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#666666' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
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
              href={`/admin/registrations?page=${page - 1}&status=${params.status || ''}&category=${params.category || ''}&search=${params.search || ''}`}
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
              href={`/admin/registrations?page=${page + 1}&status=${params.status || ''}&category=${params.category || ''}&search=${params.search || ''}`}
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
