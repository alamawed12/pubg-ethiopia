'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Registration {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  countryCode: string;
  cityRegion: string;
  category: string;
  teamName: string | null;
  tournamentInterest: boolean;
  squadDetails: string | null;
  idFrontImage: string | null;
  idBackImage: string | null;
  ticketTier?: string;
  vipPrice?: number;
  status: string;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  adminEmail: string;
  details: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: 'PENDING' },
  CONFIRMED: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'CONFIRMED' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'REJECTED' },
  WAITLISTED: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'WAITLISTED' },
  CHECKED_IN: { bg: 'rgba(204,255,0,0.15)', text: '#CCFF00', label: 'CHECKED IN' },
};

const CATEGORY_LABELS: Record<string, string> = {
  attendee: 'General Attendee',
  tournament_player: 'Tournament Competitor',
  team_rep: 'Team Representative',
  content_creator: 'Content Creator / Media',
  volunteer: 'Event Crew / Volunteer',
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reg, setReg] = useState<Registration | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [idModalImage, setIdModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/registrations/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setReg(d.registration || d.data);
        setAuditLogs(d.auditLogs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    if (!confirm(`Set status to ${status}?`)) return;
    setActionLoading(status);
    try {
      const res = await fetch(`/api/admin/registrations/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const d = await res.json();
        setReg(prev => prev ? { ...prev, ...d, status } : prev);
      }
    } catch { /* ignore */ }
    setActionLoading('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          <span style={{ color: '#999999', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>LOADING REGISTRATION...</span>
        </div>
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">⚠️</div>
        <p style={{ color: '#ef4444', fontFamily: 'var(--font-heading)', fontSize: '18px' }}>Registration not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm cursor-pointer" style={{ color: '#CCFF00' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[reg.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </button>
        <span className="text-xs" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
          ID: {reg.id.slice(0, 8)}...
        </span>
      </div>

      {/* Header Card */}
      <div
        className="rounded-xl border p-6 mb-6"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-2xl sm:text-3xl tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
              >
                {reg.fullName}
              </h1>
              <span
                className="px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold"
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.text, fontFamily: 'var(--font-mono)' }}
              >
                {statusConfig.label}
              </span>
              {reg.ticketTier === 'VIP' && (
                <span className="px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-black bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  ★ VIP PASS ({reg.vipPrice || 500} ETB)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                {reg.referenceId}
              </span>
              <span className="text-xs" style={{ color: '#666666' }}>•</span>
              <span className="text-sm" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
                IGN: {reg.inGameName}
              </span>
              <span className="text-xs" style={{ color: '#666666' }}>•</span>
              <span className="text-sm" style={{ color: '#999999' }}>
                {CATEGORY_LABELS[reg.category] || reg.category}
              </span>
            </div>
          </div>
          <div className="text-right text-xs" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
            <div>Registered</div>
            <div style={{ color: '#999999' }}>{new Date(reg.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player Details */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              PLAYER DETAILS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={reg.fullName} />
              <Field label="In-Game Name" value={reg.inGameName} mono />
              <Field label="PUBG UID" value={reg.pubgUid} mono />
              <Field label="Phone" value={`${reg.countryCode} ${reg.phoneNumber}`} mono />
              <Field label="City / Region" value={reg.cityRegion} />
              <Field label="Phone Verified" value={reg.phoneVerified ? '✓ Verified' : '✗ Not Verified'} color={reg.phoneVerified ? '#22c55e' : '#f59e0b'} />
            </div>
          </div>

          {/* Participation */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              PARTICIPATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" value={CATEGORY_LABELS[reg.category] || reg.category} />
              <Field label="Tournament Interest" value={reg.tournamentInterest ? '✓ Yes' : '✗ No'} color={reg.tournamentInterest ? '#CCFF00' : '#999999'} />
              <Field label="Team Name" value={reg.teamName || '—'} />
              {reg.squadDetails && (
                <div className="sm:col-span-2">
                  <Field label="Squad Details" value={reg.squadDetails} />
                </div>
              )}
            </div>
          </div>

          {/* ID Documents */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
              </svg>
              ID DOCUMENTS
            </h2>

            {!reg.idFrontImage && !reg.idBackImage ? (
              <div className="text-center py-8 rounded-lg border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <svg className="w-10 h-10 mx-auto mb-2" style={{ color: '#666666' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  NO ID DOCUMENTS UPLOADED
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front of ID */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
                    FRONT OF ID
                  </p>
                  {reg.idFrontImage ? (
                    <div
                      className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a' }}
                      onClick={() => setIdModalImage(reg.idFrontImage)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reg.idFrontImage} alt="Front of ID" className="w-full h-48 object-contain p-2" />
                      <div className="px-3 py-2 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                          CLICK TO ENLARGE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed h-48 flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="text-xs" style={{ color: '#666666' }}>Not uploaded</span>
                    </div>
                  )}
                </div>

                {/* Back of ID */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
                    BACK OF ID
                  </p>
                  {reg.idBackImage ? (
                    <div
                      className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0a0a0a' }}
                      onClick={() => setIdModalImage(reg.idBackImage)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reg.idBackImage} alt="Back of ID" className="w-full h-48 object-contain p-2" />
                      <div className="px-3 py-2 text-center border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                          CLICK TO ENLARGE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed h-48 flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span className="text-xs" style={{ color: '#666666' }}>Not uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Audit Log */}
          {auditLogs.length > 0 && (
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                AUDIT LOG
              </h2>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#CCFF00' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase" style={{ color: '#cccccc' }}>{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px]" style={{ color: '#666666' }}>by {log.adminEmail}</span>
                      </div>
                      <span className="text-[10px]" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Quick Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              ACTIONS
            </h2>
            <div className="space-y-2">
              {reg.status !== 'CONFIRMED' && (
                <button
                  onClick={() => updateStatus('CONFIRMED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#22c55e', color: '#050505', fontFamily: 'var(--font-heading)' }}
                >
                  {actionLoading === 'CONFIRMED' ? 'Processing...' : '✓ Approve'}
                </button>
              )}
              {reg.status !== 'REJECTED' && (
                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff', fontFamily: 'var(--font-heading)' }}
                >
                  {actionLoading === 'REJECTED' ? 'Processing...' : '✗ Reject'}
                </button>
              )}
              {reg.status !== 'WAITLISTED' && (
                <button
                  onClick={() => updateStatus('WAITLISTED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase border cursor-pointer disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ borderColor: '#3b82f6', color: '#3b82f6', fontFamily: 'var(--font-heading)' }}
                >
                  {actionLoading === 'WAITLISTED' ? 'Processing...' : '⏳ Waitlist'}
                </button>
              )}
            </div>
          </div>

          {/* Check-in Status */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              CHECK-IN
            </h2>
            {reg.checkedInAt ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CCFF00' }} />
                  <span className="text-sm font-bold" style={{ color: '#CCFF00' }}>CHECKED IN</span>
                </div>
                <p className="text-xs" style={{ color: '#999999', fontFamily: 'var(--font-mono)' }}>
                  {new Date(reg.checkedInAt).toLocaleString()}
                </p>
                {reg.checkedInBy && (
                  <p className="text-xs mt-1" style={{ color: '#666666' }}>
                    By: {reg.checkedInBy}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#666666' }} />
                <span className="text-sm" style={{ color: '#666666' }}>Not checked in</span>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              TIMESTAMPS
            </h2>
            <div className="space-y-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: '#666666' }}>Created: </span>
                <span style={{ color: '#999999' }}>{new Date(reg.createdAt).toLocaleString()}</span>
              </div>
              {reg.updatedAt && (
                <div>
                  <span style={{ color: '#666666' }}>Updated: </span>
                  <span style={{ color: '#999999' }}>{new Date(reg.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ID Image Full-Screen Modal */}
      {idModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setIdModalImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white cursor-pointer transition-colors"
            onClick={() => setIdModalImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={idModalImage}
            alt="ID Document"
            className="max-w-full max-h-[85vh] object-contain rounded-lg border"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
        {label}
      </p>
      <p
        className="text-sm"
        style={{
          color: color || '#cccccc',
          fontFamily: mono ? 'var(--font-mono)' : undefined,
        }}
      >
        {value}
      </p>
    </div>
  );
}
