'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface VipPaymentRecord {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  category: string;
  ticketTier: string;
  vipPrice: number | null;
  paymentMethod: string | null;
  paymentTxnCode: string | null;
  telegramUsername: string | null;
  paymentReceiptImage: string | null;
  paymentStatus: string;
  paymentApprovedAt: string | null;
  paymentApprovedBy: string | null;
  status: string;
  createdAt: string;
  faceMatchScore?: number | null;
  faceMatchStatus?: string | null;
  selfieImage?: string | null;
}

interface PaymentStats {
  totalVipCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenueCollected: number;
  pendingRevenue: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<VipPaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalVipCount: 0,
    pendingApprovalCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalRevenueCollected: 0,
    pendingRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.append('paymentStatus', activeTab);
      if (methodFilter !== 'ALL') params.append('paymentMethod', methodFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      setErrorMsg('Failed to load VIP payments');
    } finally {
      setLoading(false);
    }
  }, [activeTab, methodFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleUpdateStatus = async (id: string, newPaymentStatus: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    setErrorMsg(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (res.ok) {
        setActionSuccess(
          newPaymentStatus === 'APPROVED'
            ? 'VIP Ticket approved & confirmed successfully!'
            : 'VIP payment marked as rejected.'
        );
        setTimeout(() => setActionSuccess(null), 4000);
        await fetchPayments();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || 'Failed to update payment status');
      }
    } catch {
      setErrorMsg('Network error while updating payment status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
              FINANCIAL AUDIT &amp; CLEARING
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            VIP PAYMENTS &amp; RECEIPTS HUB
          </h1>
          <p className="text-sm text-[#999999] mt-0.5">
            Audit proof of transfer, verify Telebirr/Awash receipts, and issue VIP access passes.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>REFRESH</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-green-950/40 border border-green-500/40 text-green-300 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-mono">{actionSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-mono">{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            PENDING AUDIT
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-400 mt-1 flex items-baseline gap-2">
            <span>{stats.pendingApprovalCount}</span>
            <span className="text-xs font-mono text-amber-400/70 font-normal">
              ({stats.pendingRevenue.toLocaleString()} ETB)
            </span>
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            Awaiting manual receipt review
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(204,255,0,0.15)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#CCFF00] tracking-wider block">
            TOTAL VIP REVENUE
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-[#CCFF00] mt-1">
            {stats.totalRevenueCollected.toLocaleString()} ETB
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            From {stats.approvedCount} approved passes
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            APPROVED PASSES
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {stats.approvedCount}
          </div>
          <span className="text-[11px] text-green-400 font-mono mt-0.5 block">
            Active &amp; verified VIP tickets
          </span>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <span className="text-[10px] sm:text-xs font-mono uppercase text-[#999999] tracking-wider block">
            TOTAL VIP APPLICANTS
          </span>
          <div className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            {stats.totalVipCount}
          </div>
          <span className="text-[11px] text-[#777777] font-mono mt-0.5 block">
            {stats.rejectedCount} rejected / invalid
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border space-y-3"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('PENDING_APPROVAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PENDING_APPROVAL'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            <span>PENDING AUDIT</span>
            {stats.pendingApprovalCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'PENDING_APPROVAL' ? 'bg-black text-amber-400' : 'bg-amber-400 text-black font-bold'
              }`}>
                {stats.pendingApprovalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'APPROVED'
                ? 'bg-[#CCFF00] text-black font-bold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            APPROVED ({stats.approvedCount})
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'REJECTED'
                ? 'bg-red-500 text-white font-bold'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            REJECTED ({stats.rejectedCount})
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-black font-bold'
                : 'bg-white/5 text-[#999999] hover:text-white'
            }`}
          >
            ALL VIPS ({stats.totalVipCount})
          </button>
        </div>

        {/* Search & Provider Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Player Name, IGN, Phone, Txn Code, or Telegram..."
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

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              aria-label="Filter by payment method"
              className="px-3 py-2.5 rounded-xl border text-xs font-mono text-white outline-none focus:border-[#CCFF00]"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <option value="ALL">All Methods</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="AWASH_BANK">Awash Bank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 font-mono text-sm text-[#999999]">LOADING AUDIT DATA...</span>
        </div>
      ) : payments.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border"
          style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <svg className="w-12 h-12 mx-auto text-[#444444] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-heading text-lg text-white uppercase tracking-wider">
            No VIP payment records found
          </p>
          <p className="font-mono text-xs text-[#777777] mt-1">
            {activeTab === 'PENDING_APPROVAL'
              ? 'Great work! There are currently no pending VIP payments awaiting review.'
              : 'Try clearing the search query or switching filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {payments.map((p) => {
            const isPending = p.paymentStatus === 'PENDING_APPROVAL';
            const isApproved = p.paymentStatus === 'APPROVED';
            const isRejected = p.paymentStatus === 'REJECTED';
            const isProcessing = processingId === p.id;

            return (
              <div
                key={p.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'border-amber-500/30 bg-[#12110c] hover:border-amber-400/50'
                    : 'border-white/10 bg-[#111111] hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Attendee & Payment Meta */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-lg font-bold text-white tracking-wide">
                        {p.inGameName}
                      </span>
                      <span className="text-xs text-[#999999] font-mono">({p.fullName})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                        VIP PASS
                      </span>
                      {p.selfieImage ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30">
                          PHOTO ATTACHED
                        </span>
                      ) : null}

                      {/* Payment Status Pill */}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/40 animate-pulse">
                          AWAITING APPROVAL
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/15 text-green-300 border border-green-500/40">
                          APPROVED &amp; ACTIVE
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-300 border border-red-500/40">
                          REJECTED
                        </span>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                      <div>
                        <span className="text-[#666666] block text-[10px] uppercase">PUBG UID</span>
                        <span className="text-[#cccccc] font-semibold">{p.pubgUid}</span>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[10px] uppercase">PHONE</span>
                        <span className="text-[#cccccc]">{p.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[10px] uppercase">METHOD / TXN</span>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-amber-300 font-bold">
                            {p.paymentMethod || 'TELEBIRR'}
                          </span>
                          <span className="text-[#ffffff] font-bold truncate max-w-[110px]" title={p.paymentTxnCode || ''}>
                            {p.paymentTxnCode || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#666666] block text-[10px] uppercase">TELEGRAM</span>
                        {p.telegramUsername ? (
                          <a
                            href={`https://t.me/${p.telegramUsername.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <span>{p.telegramUsername}</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-[#666666]">None</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#777777] pt-1">
                      <span>REF: <strong className="text-[#999999]">{p.referenceId}</strong></span>
                      <span>FEE: <strong className="text-[#CCFF00]">{p.vipPrice || 500} ETB</strong></span>
                      <span>SUBMITTED: {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {p.paymentApprovedBy && (
                        <span>VERIFIED BY: <strong className="text-white">{p.paymentApprovedBy}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Middle / Right: Screenshot Thumbnail + Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-5">
                    {/* Receipt Screenshot Preview Thumbnail */}
                    {p.paymentReceiptImage ? (
                      <button
                        onClick={() =>
                          setPreviewImage({
                            url: p.paymentReceiptImage!,
                            title: `Receipt for ${p.inGameName} (${p.fullName}) - ${p.paymentTxnCode || p.referenceId}`,
                          })
                        }
                        className="group relative w-full sm:w-28 h-20 rounded-xl overflow-hidden border border-amber-400/40 bg-black flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:border-amber-300"
                        title="Click to view full payment receipt screenshot"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.paymentReceiptImage}
                          alt="Payment Receipt"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 flex flex-col items-center justify-center gap-1 transition-all">
                          <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                            VIEW RECEIPT
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full sm:w-28 h-20 rounded-xl border border-dashed border-white/20 bg-black/40 flex flex-col items-center justify-center p-2 text-center">
                        <svg className="w-5 h-5 text-[#555555] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[9px] font-mono text-[#777777]">NO IMAGE</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[150px]">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-heading font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(204,255,0,0.25)] cursor-pointer disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            <span>APPROVE VIP</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>REJECT</span>
                          </button>
                        </>
                      ) : (
                        <div className="space-y-1.5">
                          <Link
                            href={`/admin/registrations`}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-wider transition-all"
                          >
                            <span>VIEW IN ROSTER</span>
                          </Link>

                          {isApproved && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                              disabled={isProcessing}
                              className="w-full text-center text-[10px] font-mono text-red-400 hover:underline cursor-pointer"
                            >
                              REVOKE PASS
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                              disabled={isProcessing}
                              className="w-full text-center text-[10px] font-mono text-[#CCFF00] hover:underline cursor-pointer"
                            >
                              RE-APPROVE
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Screenshot Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-[#111111] border border-amber-400/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <span className="font-mono text-xs font-bold text-amber-300 truncate max-w-lg">
                {previewImage.title}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  download="vip-payment-receipt.png"
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider"
                >
                  DOWNLOAD
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded text-[#999999] hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body / Image */}
            <div className="p-4 overflow-auto flex items-center justify-center bg-black/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.url}
                alt="Enlarged Payment Receipt"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg border border-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
