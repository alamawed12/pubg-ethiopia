'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EventPass } from '@/components/registration/EventPass';

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
  selfieImage?: string | null;
  faceMatchScore?: number | null;
  faceMatchStatus?: string | null;
  faceMatchDetails?: string | null;
  ticketTier?: string;
  vipPrice?: number;
  paymentMethod?: string | null;
  paymentTxnCode?: string | null;
  telegramUsername?: string | null;
  paymentReceiptImage?: string | null;
  paymentStatus?: string | null;
  paymentApprovedAt?: string | null;
  paymentApprovedBy?: string | null;
  qrDataUrl?: string;
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
  const [copiedTxn, setCopiedTxn] = useState(false);
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
    if (!confirm(`Set attendee status to ${status}?`)) return;
    setActionLoading(status);
    try {
      const res = await fetch(`/api/admin/registrations/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const d = await res.json();
        setReg((prev) => (prev ? { ...prev, ...d, status } : prev));
      }
    } catch {
      // ignore
    }
    setActionLoading('');
  };

  const updatePaymentStatus = async (paymentStatus: 'APPROVED' | 'REJECTED') => {
    const actionLabel =
      paymentStatus === 'APPROVED'
        ? 'APPROVE VIP payment and issue official ticket'
        : 'REJECT VIP payment';
    if (!confirm(`Are you sure you want to ${actionLabel}?`)) return;

    setActionLoading(paymentStatus);
    try {
      const res = await fetch(`/api/admin/registrations/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        const d = await res.json();
        setReg((prev) =>
          prev
            ? {
                ...prev,
                ...d,
                paymentStatus,
                status: paymentStatus === 'APPROVED' ? 'CONFIRMED' : 'REJECTED',
              }
            : prev
        );
      }
    } catch {
      // ignore
    }
    setActionLoading('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          <span style={{ color: '#999999', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            LOADING REGISTRATION & PAYMENT AUDIT...
          </span>
        </div>
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">⚠️</div>
        <p style={{ color: '#ef4444', fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
          Registration not found
        </p>
        <button onClick={() => router.back()} className="mt-4 text-sm cursor-pointer" style={{ color: '#CCFF00' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  const isVip = reg.ticketTier === 'VIP';
  const statusConfig = STATUS_CONFIG[reg.status] || STATUS_CONFIG.PENDING;
  const telegramClean = reg.telegramUsername?.replace(/^@/, '') || '';
  const telegramUrl = telegramClean ? `https://t.me/${telegramClean}` : null;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO REGISTRATIONS
        </button>
        <span className="text-xs" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
          REF: {reg.referenceId}
        </span>
      </div>

      {/* Header Card */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: '#0a0a0a', borderColor: isVip ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
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
              {isVip && (
                <span className="px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-black bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                  ★ VIP ALL-ACCESS ({reg.vipPrice || 500} ETB)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-bold" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
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
            <div>Registration Received</div>
            <div style={{ color: '#999999' }}>{new Date(reg.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ─── SPECIAL VIP PAYMENT AUDIT & APPROVAL PANEL (IF VIP) ─── */}
      {isVip && (
        <div className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-[#1c1810] via-[#12100d] to-[#0a0805] p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h2 className="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                  VIP PAYMENT VERIFICATION & DISPATCH
                </h2>
              </div>
              <p className="font-mono text-xs text-amber-300/80 mt-0.5">
                Verify funds received via Telebirr or Awash Bank before issuing official VIP pass.
              </p>
            </div>

            {/* Payment Status Pill */}
            <div>
              {reg.paymentStatus === 'APPROVED' ? (
                <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-heading font-black text-xs uppercase tracking-wider">
                  ✓ PAYMENT VERIFIED & APPROVED
                </span>
              ) : reg.paymentStatus === 'REJECTED' ? (
                <span className="px-3.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 font-heading font-black text-xs uppercase tracking-wider">
                  ✗ PAYMENT REJECTED
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/60 font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  AWAITING HEAD ADMIN APPROVAL
                </span>
              )}
            </div>
          </div>

          {/* Payment Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-black/50 p-4 rounded-xl border border-amber-500/20 font-mono text-xs">
            {/* Payment Method */}
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">PAYMENT DESTINATION</span>
              <span className="text-white font-bold text-sm">
                {reg.paymentMethod === 'AWASH_BANK' ? 'Awash Bank' : 'Telebirr'}
              </span>
              <span className="text-amber-400 text-[11px] block mt-0.5">
                {reg.paymentMethod === 'AWASH_BANK'
                  ? '013201378990300 (Tsige Dagne)'
                  : '+251950986841 (Alamawed Begashawe)'}
              </span>
            </div>

            {/* Amount */}
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">REQUIRED FEE</span>
              <span className="text-amber-400 font-black text-lg">
                {reg.vipPrice || 500} ETB
              </span>
              <span className="text-neutral-400 text-[11px] block">Full Admission</span>
            </div>

            {/* Transaction Reference Code */}
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">TRANSACTION REFERENCE</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-amber-300 font-bold text-sm bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                  {reg.paymentTxnCode || 'NONE ENTERED'}
                </span>
                {reg.paymentTxnCode && (
                  <button
                    type="button"
                    onClick={() => handleCopy(reg.paymentTxnCode || '')}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-xs text-white"
                    title="Copy Transaction Code"
                  >
                    {copiedTxn ? '✓' : '📋'}
                  </button>
                )}
              </div>
            </div>

            {/* Telegram Username */}
            <div>
              <span className="text-neutral-400 uppercase text-[10px] block">DELIVERY TELEGRAM</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sky-300 font-bold text-sm">
                  {reg.telegramUsername || 'No Telegram'}
                </span>
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] uppercase font-bold hover:bg-sky-500/30"
                  >
                    CHAT ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Payment Receipt Screenshot */}
          <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-amber-300 uppercase text-xs font-mono font-bold tracking-wider flex items-center gap-2">
                <span>📸</span> PAYMENT RECEIPT SCREENSHOT (UPLOADED BY ATTENDEE)
              </span>
              {reg.paymentReceiptImage && (
                <button
                  type="button"
                  onClick={() => setIdModalImage(reg.paymentReceiptImage!)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase font-bold hover:bg-amber-500/30"
                >
                  CLICK TO ENLARGE 🔍
                </button>
              )}
            </div>

            {reg.paymentReceiptImage ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div
                  onClick={() => setIdModalImage(reg.paymentReceiptImage!)}
                  className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-amber-500/40 hover:border-amber-400 transition-all shadow-md bg-black max-w-[280px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reg.paymentReceiptImage}
                    alt="Payment Receipt Screenshot"
                    className="max-h-48 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white font-bold">
                    Click to View Full Size
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-300 space-y-1">
                  <div className="text-emerald-400 font-bold">✓ Screenshot successfully submitted</div>
                  <div className="text-neutral-400">Match the amount ({reg.vipPrice || 500} ETB) &amp; timestamp with your Telebirr / Awash statement.</div>
                  <div className="text-neutral-400">Transaction Code: <strong className="text-amber-400">{reg.paymentTxnCode || 'Not specified'}</strong></div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-neutral-900 border border-white/10 text-xs font-mono text-neutral-400">
                No payment screenshot uploaded (manual entry only).
              </div>
            )}
          </div>

          {/* Action Approval Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {reg.paymentStatus !== 'APPROVED' && (
              <button
                type="button"
                onClick={() => updatePaymentStatus('APPROVED')}
                disabled={!!actionLoading}
                className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-heading font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading === 'APPROVED' ? 'APPROVING...' : '✓ APPROVE PAYMENT & ISSUE VIP TICKET'}
              </button>
            )}

            {reg.paymentStatus !== 'REJECTED' && (
              <button
                type="button"
                onClick={() => updatePaymentStatus('REJECTED')}
                disabled={!!actionLoading}
                className="px-6 py-3 rounded-lg bg-red-950/70 border border-red-500/40 hover:bg-red-900 text-red-300 font-heading font-black text-sm uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading === 'REJECTED' ? 'REJECTING...' : '✗ REJECT TRANSACTION (INVALID CODE)'}
              </button>
            )}

            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-sky-600/30 border border-sky-400/50 hover:bg-sky-600/50 text-sky-200 font-heading font-black text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span>OPEN ATTENDEE TELEGRAM</span>
              </a>
            )}
          </div>

          {/* Official Pass Preview & Forwarding (Available once approved) */}
          {(reg.paymentStatus === 'APPROVED' || reg.status === 'CONFIRMED') && (
            <div className="mt-6 pt-6 border-t border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  VERIFIED HORIZONTAL VIP PASS IMAGE (FOR TELEGRAM DISPATCH)
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Ready to Download & Send
                </span>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-amber-500/30">
                <EventPass
                  referenceId={reg.referenceId}
                  fullName={reg.fullName}
                  inGameName={reg.inGameName}
                  category={reg.category}
                  status={reg.status}
                  ticketTier={reg.ticketTier}
                  qrDataUrl={reg.qrDataUrl}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MAIN DETAILS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player, Participation & ID */}
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
              <Field label="Portal Login Info" value={`Name: ${reg.fullName} | Phone: ${reg.phoneNumber}`} color="#CCFF00" mono />
              <Field label="City / Region" value={reg.cityRegion} />
              <Field label="Ticket Tier" value={reg.ticketTier === 'VIP' ? '★ VIP All-Access' : 'Standard'} color={reg.ticketTier === 'VIP' ? '#f59e0b' : '#CCFF00'} />
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
              NATIONAL ID DOCUMENTS
            </h2>

            {!reg.idFrontImage && !reg.idBackImage ? (
              <div className="text-center py-8 rounded-lg border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
                  NO ID DOCUMENTS UPLOADED
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2 font-mono text-[#999999]">
                    FRONT OF ID
                  </p>
                  {reg.idFrontImage ? (
                    <div
                      className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors bg-black/40"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => setIdModalImage(reg.idFrontImage)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reg.idFrontImage} alt="Front of ID" className="w-full h-40 object-contain p-2" />
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-xs text-[#666666]">
                      Not uploaded
                    </div>
                  )}
                </div>

                {/* Back */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2 font-mono text-[#999999]">
                    BACK OF ID
                  </p>
                  {reg.idBackImage ? (
                    <div
                      className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors bg-black/40"
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => setIdModalImage(reg.idBackImage)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reg.idBackImage} alt="Back of ID" className="w-full h-40 object-contain p-2" />
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-xs text-[#666666]">
                      Not uploaded
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Biometric Face Match (Bybit-grade KYC) */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                AI BIOMETRIC FACE MATCH (KYC)
              </h2>

              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  reg.faceMatchStatus === 'PASSED' || (reg.faceMatchScore && reg.faceMatchScore >= 70)
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                    : reg.faceMatchStatus === 'FAILED'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {reg.faceMatchStatus === 'PASSED' || (reg.faceMatchScore && reg.faceMatchScore >= 70)
                  ? `✓ ${reg.faceMatchScore || 90}% MATCH CONFIRMED`
                  : reg.faceMatchStatus === 'FAILED'
                  ? `✗ ${reg.faceMatchScore || 45}% LOW CONFIDENCE`
                  : 'PENDING VERIFICATION'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selfie */}
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-2 font-mono text-[#999999]">
                  LIVE CAPTURED SELFIE
                </p>
                {reg.selfieImage ? (
                  <div
                    className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors bg-black/40"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => setIdModalImage(reg.selfieImage || null)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reg.selfieImage} alt="Live Selfie" className="w-full h-40 object-contain p-2" />
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-xs text-[#666666]">
                    No live selfie captured
                  </div>
                )}
              </div>

              {/* ID Front Comparison */}
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-2 font-mono text-[#999999]">
                  MATCHED NATIONAL ID PHOTO
                </p>
                {reg.idFrontImage ? (
                  <div
                    className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#CCFF00]/50 transition-colors bg-black/40"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => setIdModalImage(reg.idFrontImage)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={reg.idFrontImage} alt="ID Front Portrait" className="w-full h-40 object-contain p-2" />
                  </div>
                ) : (
                  <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-xs text-[#666666]">
                    No ID photo uploaded
                  </div>
                )}
              </div>
            </div>

            {reg.faceMatchDetails && (
              <p className="mt-3 text-xs font-mono text-neutral-400 bg-black/40 p-2.5 rounded border border-white/5">
                {reg.faceMatchDetails}
              </p>
            )}
          </div>

          {/* Audit Logs */}
          {auditLogs.length > 0 && (
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <h2 className="flex items-center gap-2 text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
                AUDIT TRAIL
              </h2>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#CCFF00]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase text-[#cccccc]">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-[#666666]">by {log.adminEmail}</span>
                      </div>
                      <span className="text-[10px] text-[#666666] font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {/* General Actions */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#CCFF00', fontFamily: 'var(--font-heading)' }}>
              OVERALL STATUS
            </h2>
            <div className="space-y-2">
              {reg.status !== 'CONFIRMED' && (
                <button
                  onClick={() => updateStatus('CONFIRMED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 bg-emerald-500 text-black font-heading"
                >
                  {actionLoading === 'CONFIRMED' ? 'Processing...' : '✓ Set Confirmed'}
                </button>
              )}
              {reg.status !== 'REJECTED' && (
                <button
                  onClick={() => updateStatus('REJECTED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 bg-red-600 text-white font-heading"
                >
                  {actionLoading === 'REJECTED' ? 'Processing...' : '✗ Set Rejected'}
                </button>
              )}
              {reg.status !== 'WAITLISTED' && (
                <button
                  onClick={() => updateStatus('WAITLISTED')}
                  disabled={!!actionLoading}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-bold tracking-wider uppercase border cursor-pointer disabled:opacity-50 transition-all hover:opacity-90 border-blue-500 text-blue-400 font-heading"
                >
                  {actionLoading === 'WAITLISTED' ? 'Processing...' : '⏳ Set Waitlisted'}
                </button>
              )}
            </div>
          </div>

          {/* Check-in Info */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <h2 className="text-sm uppercase tracking-wider mb-3 font-heading text-[#CCFF00]">
              GATE CHECK-IN
            </h2>
            {reg.checkedInAt ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                  <span className="text-sm font-bold text-[#CCFF00]">CHECKED IN</span>
                </div>
                <p className="text-xs font-mono text-[#999999]">
                  {new Date(reg.checkedInAt).toLocaleString()}
                </p>
                {reg.checkedInBy && (
                  <p className="text-xs mt-1 text-[#666666]">
                    By: {reg.checkedInBy}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#666666]" />
                <span className="text-sm text-[#666666]">Not checked in</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ID Full-Screen Modal */}
      {idModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setIdModalImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white cursor-pointer"
            onClick={() => setIdModalImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={idModalImage} alt="National ID Enlarged" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono = false, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-wider text-[#999999] font-mono">
        {label}
      </span>
      <span
        className={`font-semibold text-sm ${mono ? 'font-mono' : ''}`}
        style={{ color: color || '#ffffff' }}
      >
        {value}
      </span>
    </div>
  );
}
