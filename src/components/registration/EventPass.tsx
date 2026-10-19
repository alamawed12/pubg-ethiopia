'use client';

import React, { useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
import { Badge, BadgeStatus } from '@/components/ui/Badge';
import { CATEGORY_LABELS, ParticipationCategory } from '@/lib/validation';

export interface EventPassProps {
  referenceId: string;
  fullName: string;
  inGameName: string;
  category: string;
  status: string;
  ticketTier?: string;
  qrDataUrl?: string;
  className?: string;
}

export function EventPass({
  referenceId,
  fullName,
  inGameName,
  category,
  status,
  ticketTier,
  qrDataUrl,
  className,
}: EventPassProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format category display label
  const categoryLabel =
    CATEGORY_LABELS[category as ParticipationCategory] || category.replace(/_/g, ' ').toUpperCase();

  // Handle high-resolution digital pass download using Canvas API
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // Helper: draw a rounded rect on a fresh path (with fallback)
      const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };

      // Background - Void dark
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 600, 960);

      // Graphite inner card area
      ctx.fillStyle = '#141414';
      drawRoundRect(24, 24, 552, 912, 20);
      ctx.fill();

      // Border outline (stroke on same card path)
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#262626';
      ctx.stroke();

      // Top lime accent bar
      ctx.fillStyle = '#CCFF00';
      ctx.shadowColor = '#CCFF00';
      ctx.shadowBlur = 15;
      ctx.fillRect(24, 24, 552, 6);
      ctx.shadowBlur = 0; // Reset shadow

      // Tactical corner markers
      ctx.strokeStyle = '#CCFF00';
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(34, 54);
      ctx.lineTo(34, 34);
      ctx.lineTo(54, 34);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(566, 54);
      ctx.lineTo(566, 34);
      ctx.lineTo(546, 34);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(34, 906);
      ctx.lineTo(34, 926);
      ctx.lineTo(54, 926);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(566, 906);
      ctx.lineTo(566, 926);
      ctx.lineTo(546, 926);
      ctx.stroke();

      // Header Branding
      ctx.textAlign = 'center';

      // "PUBG MOBILE"
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#888888';
      ctx.fillText('PUBG MOBILE', 300, 80);

      // "COMMUNITY ASSEMBLY"
      ctx.font = '800 24px Oswald, Impact, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('COMMUNITY ASSEMBLY', 300, 115);

      // "ETHIOPIA"
      ctx.font = '900 36px Oswald, Impact, sans-serif';
      ctx.fillStyle = '#CCFF00';
      ctx.fillText('ETHIOPIA', 300, 160);

      // Header Divider Line
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 185);
      ctx.lineTo(540, 185);
      ctx.stroke();

      // Reference ID Container Box
      ctx.fillStyle = '#0a0a0a';
      drawRoundRect(150, 205, 300, 38, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 255, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#CCFF00';
      ctx.fillText(referenceId, 300, 230);

      // QR Code Rendering
      if (qrDataUrl) {
        const qrImage = new window.Image();
        qrImage.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          qrImage.onload = () => resolve();
          qrImage.onerror = () => reject(new Error('Failed to load QR code image'));
          qrImage.src = qrDataUrl;
        });

        // QR Background box (crisp white for 100% optical camera detection)
        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(170, 265, 260, 260, 16);
        ctx.fill();
        ctx.strokeStyle = '#CCFF00';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the QR image on top of the background box
        ctx.drawImage(qrImage, 180, 275, 240, 240);
      }

      // Attendee Info Section
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px Oswald, Impact, sans-serif';
      ctx.fillText(fullName.toUpperCase(), 300, 570);

      // In-Game Name (IGN)
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#CCFF00';
      ctx.fillText(`IGN: ${inGameName}`, 300, 605);

      // Category & Status
      ctx.font = '600 15px Inter, sans-serif';
      ctx.fillStyle = '#999999';
      ctx.fillText(categoryLabel, 300, 638);

      // Status pill
      ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#0d2818' : '#2d1e02';
      drawRoundRect(220, 660, 160, 28, 14);
      ctx.fill();
      ctx.strokeStyle = status.toUpperCase() === 'CONFIRMED' ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#34d399' : '#fbbf24';
      ctx.fillText(status.toUpperCase(), 300, 678);

      // Security watermark / Footer info
      ctx.strokeStyle = '#222222';
      ctx.beginPath();
      ctx.moveTo(60, 720);
      ctx.lineTo(540, 720);
      ctx.stroke();

      ctx.font = '500 12px Inter, sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('ADDIS ABABA, ETHIOPIA • ADMISSION TICKET', 300, 755);
      ctx.fillText('Present this pass & valid ID at the assembly entrance.', 300, 775);

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#CCFF00';
      ctx.fillText('SECURE CHECK-IN SYSTEM // PUBG MOBILE ET', 300, 830);

      // Trigger automatic file download
      const dataUri = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUri;
      downloadLink.download = `PUBG-PASS-${referenceId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Failed to generate high-resolution pass:', err);
      // Fallback: download QR directly if canvas fails
      if (qrDataUrl) {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `PUBG-QR-${referenceId}.png`;
        link.click();
      }
    } finally {
      setIsDownloading(false);
    }
  }, [categoryLabel, fullName, inGameName, qrDataUrl, referenceId, status]);

  return (
    <div className={clsx('relative w-full max-w-sm mx-auto', className)}>
      {/* Outer Tactical Frame */}
      <div
        ref={cardRef}
        className={clsx(
          'relative overflow-hidden rounded-xl bg-[var(--color-graphite,#1a1a1a)] text-white shadow-2xl',
          'border border-white/10 hover:border-[var(--color-lime,#CCFF00)]/40 transition-all duration-300',
          'shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(204,255,0,0.06)]'
        )}
      >
        {/* Top radioactive lime highlight line */}
        <div className="h-1.5 w-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_12px_rgba(204,255,0,0.6)]" />

        {/* Tactical Corner Brackets */}
        <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-[var(--color-lime,#CCFF00)]/60" />
        <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-[var(--color-lime,#CCFF00)]/60" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[var(--color-lime,#CCFF00)]/60" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[var(--color-lime,#CCFF00)]/60" />

        {/* Card Body */}
        <div className="p-6 text-center">
          {/* Event Branding Header */}
          <div className="space-y-0.5">
            <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--color-silver,#999999)]">
              PUBG MOBILE
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              COMMUNITY ASSEMBLY
            </h3>
            <div className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-widest text-[var(--color-lime,#CCFF00)] drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]">
              ETHIOPIA
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* VIP Pass Badge */}
          {ticketTier === 'VIP' && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 font-heading font-black text-xs tracking-widest uppercase shadow-[0_0_12px_rgba(245,158,11,0.4)]">
              <span>⭐</span> VIP ALL-ACCESS PASS
            </div>
          )}

          {/* Reference ID Pill */}
          <div className="mb-5 inline-flex items-center gap-2 rounded bg-black/50 px-3.5 py-1.5 border border-white/10">
            <span className="font-mono text-[10px] text-[var(--color-silver,#999999)] uppercase">
              PASS REF:
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[var(--color-lime,#CCFF00)]">
              {referenceId}
            </span>
          </div>

          {/* QR Code Container (Crisp white background for instant optical detection) */}
          <div className="relative mx-auto mb-5 flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 border-2 border-[var(--color-lime,#CCFF00)] shadow-[0_0_25px_rgba(204,255,0,0.25)]">
            {qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt={`Check-in QR Code for ${referenceId}`}
                width={172}
                height={172}
                className="h-full w-full object-contain rounded select-none"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-neutral-500">
                QR Code Loading...
              </div>
            )}

            {/* Scanning radar indicator dot */}
            <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-[var(--color-lime,#CCFF00)] animate-ping" />
            <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-[var(--color-lime,#CCFF00)]" />
          </div>

          {/* Attendee Details */}
          <div className="space-y-1">
            <div className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-white truncate px-2">
              {fullName}
            </div>
            <div className="font-mono text-xs sm:text-sm font-semibold text-[var(--color-lime,#CCFF00)]">
              IGN: {inGameName}
            </div>
            <div className="font-body text-xs text-[var(--color-silver,#999999)]">
              {categoryLabel}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex justify-center">
            <Badge status={status as BadgeStatus} />
          </div>

          {/* Holographic Shimmer Footer Bar */}
          <div className="relative mt-6 overflow-hidden rounded py-2 bg-white/5 border border-white/5 holo-shimmer">
            <div className="font-mono text-[10px] tracking-wider text-[var(--color-silver,#999999)] uppercase">
              OFFICIAL ENTRY PASS • SCAN AT SECURITY CHECKPOINT
            </div>
          </div>
        </div>
      </div>

      {/* Direct Pass Download Trigger (Optional triggerable by button or programmatic ref) */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--color-silver,#999999)] hover:text-[var(--color-lime,#CCFF00)] transition-colors cursor-pointer"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isDownloading ? 'GENERATING HIGH-RES PASS...' : 'SAVE DIGITAL PASS IMAGE'}</span>
        </button>
      </div>
    </div>
  );
}

export default EventPass;
