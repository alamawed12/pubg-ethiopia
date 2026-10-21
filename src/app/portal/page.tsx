'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EventPass } from '@/components/registration/EventPass';

interface AttendeeData {
  id: string;
  referenceId: string;
  fullName: string;
  inGameName: string;
  pubgUid: string;
  phoneNumber: string;
  countryCode: string;
  cityRegion: string;
  category: string;
  ticketTier: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  qrDataUrl?: string | null;
}

export default function AttendeePortalPage() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);

  // Check local session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pmca_attendee_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.referenceId) {
          fetchTicket(parsed.referenceId);
        }
      }
    } catch {}
  }, []);

  const fetchTicket = async (ref: string) => {
    try {
      const res = await fetch(`/api/portal/ticket/${ref}`);
      const d = await res.json();
      if (d.success && d.data) {
        setAttendee(d.data);
        localStorage.setItem('pmca_attendee_session', JSON.stringify(d.data));
      }
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber }),
      });

      const d = await res.json();
      if (!res.ok || !d.success) {
        setError(d.error || 'Login failed. Please check your details.');
        setLoading(false);
        return;
      }

      // Fetch the full ticket details with QR state
      await fetchTicket(d.data.referenceId);
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pmca_attendee_session');
    setAttendee(null);
    setFullName('');
    setPhoneNumber('');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-[#CCFF00] selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 tactical-grid opacity-25 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,#0d1a0d_0%,transparent_65%)] pointer-events-none opacity-40" />

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pubg-mobile-logo.png"
            alt="PUBG Mobile"
            className="h-8 w-auto object-contain"
          />
          <span className="font-heading font-black text-lg text-[#CCFF00] tracking-wider uppercase hidden sm:inline">
            ATTENDEE PORTAL
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {attendee ? (
            <button
              onClick={handleLogout}
              className="font-mono text-xs text-[#999999] hover:text-[#CCFF00] transition-colors uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#CCFF00]/40"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/register"
              className="font-mono text-xs text-[#CCFF00] hover:underline uppercase tracking-wider"
            >
              Need to Register? →
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {!attendee ? (
            /* ─── 1. ATTENDEE LOGIN FORM ─── */
            <motion.div
              key="login-screen"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-[#CCFF00] font-mono text-xs uppercase tracking-widest mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                  ATTENDEE TICKET PORTAL
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
                  ACCESS YOUR <span className="text-[#CCFF00]">EVENT PASS</span>
                </h1>
                <p className="mt-2 text-sm text-[#999999] font-body">
                  Log in with your registered Name and Phone Number to check your application status and unlock your digital pass.
                </p>
              </div>

              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                {error && (
                  <div className="mb-6 p-4 rounded-xl text-xs font-mono border border-red-500/40 bg-red-950/40 text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                      Your Full Name or In-Game Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abebe Bikila or HabeshaSniper"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white outline-none focus:border-[#CCFF00] font-body text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#999999] mb-1.5">
                      Registered Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0911234567 or +251911234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-white outline-none focus:border-[#CCFF00] font-mono text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#050505] font-heading font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? 'VERIFYING DETAILS...' : 'CHECK MY TICKET →'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                  <p className="text-xs text-[#666666] font-mono">
                    Free passes require admin verification before the QR code activates.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ─── 2. ATTENDEE DASHBOARD / TICKET STATUS ─── */
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-8"
            >
              {/* Status Header Banner */}
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#999999]">
                      WELCOME BACK,
                    </span>
                    <span className="font-heading font-black text-lg text-white uppercase">
                      {attendee.fullName}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#999999]">
                    REF: <strong className="text-[#CCFF00]">{attendee.referenceId}</strong> • IGN: <strong>{attendee.inGameName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {attendee.status === 'CONFIRMED' || attendee.status === 'CHECKED_IN' ? (
                    <div className="px-4 py-2 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/50 text-[#22c55e] font-mono font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      ✓ APPLICATION ACCEPTED
                    </div>
                  ) : attendee.status === 'REJECTED' ? (
                    <div className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-mono font-bold text-xs uppercase tracking-widest">
                      ✗ APPLICATION DECLINED
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono font-bold text-xs uppercase tracking-widest animate-pulse">
                      ⏳ UNDER ADMIN REVIEW
                    </div>
                  )}
                </div>
              </div>

              {/* Conditional Ticket Display */}
              {attendee.status === 'CONFIRMED' || attendee.status === 'CHECKED_IN' ? (
                /* APPROVED STATE: Show full Event Pass with QR */
                <div className="space-y-6 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono mb-6">
                      ✓ You have been approved by the PUBG Mobile Ethiopia Committee! Present this QR code at the check-in gate.
                    </div>

                    <EventPass
                      referenceId={attendee.referenceId}
                      fullName={attendee.fullName}
                      inGameName={attendee.inGameName}
                      category={attendee.category}
                      status={attendee.status}
                      ticketTier={attendee.ticketTier}
                      qrDataUrl={attendee.qrDataUrl || undefined}
                    />
                  </div>
                </div>
              ) : attendee.status === 'REJECTED' ? (
                /* REJECTED STATE */
                <div className="p-8 rounded-2xl bg-[#111111] border border-red-500/30 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-2xl text-red-400">
                    ✕
                  </div>
                  <h3 className="font-heading text-2xl font-bold uppercase text-white">
                    Registration Not Approved
                  </h3>
                  <p className="text-sm text-[#999999] leading-relaxed">
                    Your registration application could not be approved at this time. This is commonly due to duplicate player credentials or unverified ID images. Please contact event staff for assistance.
                  </p>
                </div>
              ) : (
                /* PENDING / UNDER REVIEW STATE */
                <div className="p-8 sm:p-12 rounded-2xl bg-[#111111] border border-amber-500/30 text-center max-w-lg mx-auto space-y-5">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl text-amber-400 animate-pulse">
                    ⏳
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white tracking-wider">
                    Application Under Review
                  </h3>
                  <p className="text-sm text-[#cccccc] leading-relaxed">
                    Your free registration has been recorded into the queue. The head admin team is currently auditing player slots and verifying registrations.
                  </p>
                  <div className="p-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-xs font-mono text-[#999999] text-left space-y-1">
                    <div>• <strong>QR Ticket Activation:</strong> Unlocks automatically once accepted.</div>
                    <div>• <strong>How to return:</strong> Bookmark this page or come back anytime and log in with your Name and Phone Number.</div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
