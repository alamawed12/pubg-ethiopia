'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminExportPage() {
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [downloading, setDownloading] = useState(false);
  const [lastExportTime, setLastExportTime] = useState<string | null>(null);

  const handleDownloadCsv = async () => {
    setDownloading(true);

    try {
      const params = new URLSearchParams();
      if (status !== 'ALL') params.set('status', status);
      if (category !== 'ALL') params.set('category', category);

      const url = `/api/admin/export?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to generate CSV export file');
      }

      // Extract filename from header or fallback
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'pubg-ethiopia-registrations.csv';
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setLastExportTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Download CSV error:', err);
      alert('Could not export registrations. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-lime,#CCFF00)]">
            DATA EXTRACTION PIPELINE
          </span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-white">
          EXPORT REGISTRATIONS
        </h1>
        <p className="font-mono text-xs text-[var(--color-silver,#999999)] mt-0.5">
          Generate sanitized, RFC-4180 compliant CSV archives of attendee and tournament participant records.
        </p>
      </div>

      {/* Main Export Configuration Card */}
      <Card glowBorder padding="lg" className="bg-[var(--color-charcoal,#111111)] border-white/10">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white mb-6">
          FILTER PARAMETERS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Filter */}
          <div>
            <label className="block font-mono text-xs text-[var(--color-silver,#999999)] uppercase mb-2">
              FILTER BY PASS STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] font-mono text-xs text-white p-3.5 rounded-sm outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses (Full Registry)</option>
              <option value="CONFIRMED">Confirmed Only (Approved Passes)</option>
              <option value="CHECKED_IN">Checked-In Only (Gate Admitted)</option>
              <option value="PENDING">Pending Only (Awaiting Action)</option>
              <option value="WAITLISTED">Waitlisted Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-mono text-xs text-[var(--color-silver,#999999)] uppercase mb-2">
              FILTER BY PARTICIPANT CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] font-mono text-xs text-white p-3.5 rounded-sm outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="attendee">General Attendee</option>
              <option value="tournament_player">Tournament Player</option>
              <option value="team_rep">Team Representative / Manager</option>
              <option value="content_creator">Content Creator / Streamer</option>
              <option value="volunteer">Volunteer / Staff</option>
            </select>
          </div>
        </div>

        {/* Export Button & Action status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div>
            {lastExportTime && (
              <p className="font-mono text-xs text-emerald-400">
                &check; File generated and downloaded at {lastExportTime}
              </p>
            )}
            <p className="font-mono text-[11px] text-[var(--color-silver,#999999)]">
              Output format: CSV (UTF-8 encoding, comma-delimited)
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            loading={downloading}
            onClick={handleDownloadCsv}
            className="font-heading uppercase tracking-wider text-sm font-bold bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            GENERATE & DOWNLOAD CSV
          </Button>
        </div>
      </Card>

      {/* Specification of Data Fields Included */}
      <div className="p-6 rounded-sm bg-black/30 border border-white/10">
        <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white mb-3">
          EXPORT DATA SCHEMA SPECIFICATION
        </h3>
        <p className="font-body text-xs text-[var(--color-silver,#999999)] leading-relaxed mb-4">
          The generated CSV payload contains the following standardized columns for roster imports, bracket management, and event accreditation:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-[var(--color-silver-light,#cccccc)]">
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Reference ID</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Full Legal Name</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; In-Game Name (IGN)</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; PUBG Character UID</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Country Code</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Phone Number</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; City / Region</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Category</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Team Name</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Tournament Interest</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Squad Details</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Pass Status</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Phone Verified</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Checked In At</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Checked In By</div>
          <div className="p-2 rounded bg-white/5 border border-white/5">&bull; Registered At</div>
        </div>
      </div>
    </div>
  );
}
