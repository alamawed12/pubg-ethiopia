'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CheckMarkIcon,
  XMarkIcon,
  StarVipIcon,
  ClockPendingIcon,
  AlertTriangleIcon,
} from '@/components/ui/TacticalIcons';
import { TacticalCheckbox } from '@/components/ui/TacticalCheckbox';

export interface RegistrationRow {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  ticketTier: string;
  paymentMethod: string | null;
  paymentTxnCode: string | null;
  telegramUsername: string | null;
  paymentStatus: string;
  category: string;
  status: string;
  createdAt: string | Date;
  faceMatchScore?: number | null;
  faceMatchStatus?: string | null;
}

interface RegistrationsTableClientProps {
  registrations: RegistrationRow[];
  statusColors: Record<string, { bg: string; text: string }>;
  totalCount: number;
}

export function RegistrationsTableClient({
  registrations,
  statusColors,
  totalCount,
}: RegistrationsTableClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isScanner = session?.user?.role === 'scanner';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const allVisibleSelected =
    registrations.length > 0 && registrations.every((r) => selectedIds.includes(r.id));
  const someSelected = selectedIds.length > 0;

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registrations.map((r) => r.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchAction = async (action: 'ACCEPT' | 'DECLINE') => {
    if (selectedIds.length === 0 || isBatchLoading) return;

    const actionText = action === 'ACCEPT' ? 'ACCEPT & CONFIRM' : 'DECLINE & REJECT';
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedIds.length} selected registration(s)?`)) {
      return;
    }

    setIsBatchLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ids: selectedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch action failed');
      }

      setFeedback({
        type: 'success',
        message: `Successfully ${action === 'ACCEPT' ? 'accepted' : 'declined'} ${data.count} registration(s).`,
      });
      setSelectedIds([]);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({
        type: 'error',
        message: error.message || 'Error executing batch action',
      });
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to clear registrations');
      }

      setFeedback({
        type: 'success',
        message: data.message || 'All registrations have been cleared.',
      });
      setSelectedIds([]);
      setIsClearModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({
        type: 'error',
        message: error.message || 'Error clearing registrations',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (Clear All button + Feedback Toast) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Master Select All Toggle Button */}
          <div
            onClick={registrations.length > 0 ? handleToggleSelectAll : undefined}
            className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer bg-[#141414] hover:bg-[#1a1a1a] text-white ${
              registrations.length === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <TacticalCheckbox
              checked={allVisibleSelected}
              onChange={handleToggleSelectAll}
              ariaLabel="Select all visible registrations"
              size="md"
            />
            <span>{allVisibleSelected ? 'Deselect All' : 'Select All'}</span>
          </div>

          {someSelected && (
            <span className="font-mono text-xs text-[#CCFF00] font-bold">
              [{selectedIds.length}] selected
            </span>
          )}
        </div>

        {/* Clear All Registrations Button (Protected from Scanners) */}
        {!isScanner && (
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>CLEAR ALL REGISTRATIONS</span>
          </button>
        )}
      </div>

      {/* Floating Batch Actions Bar (Visible when 1+ rows selected) */}
      {someSelected && (
        <div
          className="sticky top-4 z-30 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'rgba(15, 15, 15, 0.95)',
            borderColor: '#CCFF00',
            boxShadow: '0 0 25px rgba(204,255,0,0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#CCFF00] text-black font-mono font-black text-xs">
              {selectedIds.length}
            </span>
            <span className="font-heading font-black text-sm uppercase tracking-wider text-white">
              Selected Registration{selectedIds.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Accept Selected Button */}
            <button
              type="button"
              disabled={isBatchLoading || isScanner}
              onClick={() => handleBatchAction('ACCEPT')}
              className="px-4 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider bg-[#CCFF00] hover:bg-[#b8e600] text-black cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.3)] disabled:opacity-50"
            >
              {isBatchLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
              )}
              <span>ACCEPT SELECTED ({selectedIds.length})</span>
            </button>

            {/* Decline Selected Button */}
            <button
              type="button"
              disabled={isBatchLoading || isScanner}
              onClick={() => handleBatchAction('DECLINE')}
              className="px-4 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.3)] disabled:opacity-50"
            >
              {isBatchLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <XMarkIcon className="w-3.5 h-3.5 stroke-[3]" />
              )}
              <span>DECLINE SELECTED ({selectedIds.length})</span>
            </button>

            {/* Deselect Button */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-lg border text-xs font-mono uppercase text-[#999999] hover:text-white border-white/10 hover:bg-white/5 cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Action Feedback Message */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white p-1 ml-2 cursor-pointer"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Registrations Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Checkbox column */}
                <th className="px-3 py-3 w-10 text-center">
                  <div className="flex items-center justify-center">
                    <TacticalCheckbox
                      checked={allVisibleSelected}
                      onChange={handleToggleSelectAll}
                      ariaLabel="Select all registrations"
                      size="md"
                    />
                  </div>
                </th>
                {['Ref', 'Player', 'IGN & UID', 'Tier', 'VIP Payment / Txn', 'Category', 'Status', 'Date', 'Action'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-sans font-bold uppercase tracking-wider text-neutral-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center" style={{ color: '#666666' }}>
                    No registrations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  const sc = statusColors[r.status] || statusColors.PENDING;
                  const isVip = r.ticketTier === 'VIP';
                  const isPendingApproval =
                    isVip && (r.paymentStatus === 'PENDING_APPROVAL' || r.status === 'PENDING');

                  return (
                    <tr
                      key={r.id}
                      className={`border-b transition-colors ${
                        isSelected
                          ? 'bg-[#CCFF00]/[0.08]'
                          : isPendingApproval
                          ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                      style={{ borderColor: 'rgba(255,255,255,0.03)' }}
                    >
                      {/* Row Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <TacticalCheckbox
                            checked={isSelected}
                            onChange={() => handleToggleRow(r.id)}
                            ariaLabel={`Select registration ${r.referenceId}`}
                            size="md"
                          />
                        </div>
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3" style={{ fontFamily: 'var(--font-mono)', color: '#CCFF00' }}>
                        <Link href={`/admin/registrations/${r.id}`} className="hover:underline font-bold">
                          {r.referenceId}
                        </Link>
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{r.fullName}</div>
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
                            <StarVipIcon className="w-3 h-3" />
                            <span>VIP</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#666666]">STD</span>
                        )}
                      </td>

                      {/* VIP Payment Details Column */}
                      <td className="px-4 py-3">
                        {isVip ? (
                          <div className="space-y-1">
                            {r.paymentStatus === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                <CheckMarkIcon className="w-3 h-3 stroke-[2.5]" />
                                <span>PAID &amp; APPROVED</span>
                              </span>
                            ) : r.paymentStatus === 'REJECTED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                                <XMarkIcon className="w-3 h-3 stroke-[2.5]" />
                                <span>PAYMENT REJECTED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/50">
                                <ClockPendingIcon className="w-3 h-3" />
                                <span>APPROVAL REQUIRED</span>
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

      {/* Confirmation Modal: Clear All Registrations */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 rounded-2xl border text-white shadow-2xl relative"
            style={{ backgroundColor: '#111111', borderColor: 'rgba(239,68,68,0.5)' }}
          >
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-black text-xl uppercase tracking-wider text-red-400">
                  CLEAR ALL REGISTRATIONS?
                </h3>
                <p className="font-mono text-xs text-[#999999]">IRREVERSIBLE ACTION</p>
              </div>
            </div>

            <p className="font-mono text-xs text-[#cccccc] leading-relaxed mb-6">
              This action will permanently delete <strong className="text-white">ALL {totalCount}</strong>{' '}
              registration records, VIP transaction histories, and ticket QR passes from the database.
              This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isClearing}
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 font-heading text-xs uppercase tracking-wider text-white hover:bg-white/5 cursor-pointer disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAll}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-heading font-black text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
              >
                {isClearing ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertTriangleIcon className="w-3.5 h-3.5" />
                )}
                <span>YES, PURGE EVERYTHING</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationsTableClient;
