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

  const isVip = ticketTier?.toUpperCase() === 'VIP';

  // Format category display label
  const categoryLabel =
    CATEGORY_LABELS[category as ParticipationCategory] || category.replace(/_/g, ' ').toUpperCase();

  // Helper to load image as HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
      img.src = src;
    });
  };

  // Handle high-resolution digital pass download using Canvas API
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
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

      // Load PUBG Community Assembly Logo for embedding
      let pubgLogoImg: HTMLImageElement | null = null;
      try {
        pubgLogoImg = await loadImage('/images/community-assembly-logo.png');
      } catch {
        // Logo optional fallback
      }

      // Load QR Code Image
      let qrImg: HTMLImageElement | null = null;
      if (qrDataUrl) {
        try {
          qrImg = await loadImage(qrDataUrl);
        } catch {
          // QR code fallback
        }
      }

      if (isVip) {
        // ══════════════════════════════════════════════════════════════
        // ─── VIP HORIZONTAL / LANDSCAPE PASS (960 x 540) ──────────────
        // ══════════════════════════════════════════════════════════════
        canvas.width = 960;
        canvas.height = 540;

        // Background - Luxury Dark Carbon
        ctx.fillStyle = '#0c0a07';
        ctx.fillRect(0, 0, 960, 540);

        // Inner Card Panel with Gold Border
        ctx.fillStyle = '#14110c';
        drawRoundRect(20, 20, 920, 500, 18);
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#F59E0B';
        ctx.stroke();

        // Top Gold Gradient Highlight Bar
        const goldGrad = ctx.createLinearGradient(20, 20, 940, 20);
        goldGrad.addColorStop(0, '#B45309');
        goldGrad.addColorStop(0.5, '#FDE68A');
        goldGrad.addColorStop(1, '#B45309');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(20, 20, 920, 6);

        // Gold Corner Brackets
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(30, 50);
        ctx.lineTo(30, 30);
        ctx.lineTo(50, 30);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(930, 50);
        ctx.lineTo(930, 30);
        ctx.lineTo(910, 30);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(30, 490);
        ctx.lineTo(30, 510);
        ctx.lineTo(50, 510);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(930, 490);
        ctx.lineTo(930, 510);
        ctx.lineTo(910, 510);
        ctx.stroke();

        // ─── Top Header Section ───
        if (pubgLogoImg && pubgLogoImg.naturalWidth > 0) {
          ctx.drawImage(pubgLogoImg, 45, 40, 84, 42);
        }

        ctx.textAlign = 'left';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('OFFICIAL PUBG MOBILE TEAM • SPECIAL ADMISSION', 130, 52);

        ctx.font = '900 24px Oswald, Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('COMMUNITY ASSEMBLY — ETHIOPIA', 130, 78);

        // VIP Pass Pill (Top Right)
        ctx.fillStyle = '#2d1e02';
        drawRoundRect(710, 42, 210, 36, 8);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.font = '900 14px Oswald, Impact, sans-serif';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText('⭐ VIP ALL-ACCESS PASS', 815, 65);

        // Header Divider
        ctx.strokeStyle = '#2d2516';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(45, 105);
        ctx.lineTo(915, 105);
        ctx.stroke();

        // ─── Left Column: Attendee Information ───
        ctx.textAlign = 'left';

        // Pass Reference Pill
        ctx.fillStyle = '#050505';
        drawRoundRect(45, 125, 260, 32, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`PASS REF: ${referenceId}`, 60, 146);

        // Full Name
        ctx.font = '900 32px Oswald, Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(fullName.toUpperCase(), 45, 200);

        // IGN
        ctx.font = '700 18px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`IGN: ${inGameName}`, 45, 230);

        // Category & Status
        ctx.font = '600 15px Inter, sans-serif';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText(`CATEGORY: ${categoryLabel}`, 45, 260);

        // Status Pill
        ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#0d2818' : '#2d1e02';
        drawRoundRect(45, 278, 150, 26, 13);
        ctx.fill();
        ctx.strokeStyle = status.toUpperCase() === 'CONFIRMED' ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#34d399' : '#fbbf24';
        ctx.fillText(status.toUpperCase(), 120, 295);

        // VIP Privileges Box
        ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
        drawRoundRect(45, 325, 540, 115, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('EXCLUSIVE VIP PASS PRIVILEGES', 60, 350);

        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillStyle = '#DDDDDD';
        ctx.fillText('• Priority Front-Row Arena Seating & VIP Stage View', 60, 375);
        ctx.fillText('• Fast-Track Check-In & Dedicated VIP Gate Entrance', 60, 397);
        ctx.fillText('• Exclusive Assembly Networking Lounge & Gift Access', 60, 419);

        // Bottom Left Legal / Security Note
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillStyle = '#777777';
        ctx.fillText('Official admission ticket. Must be presented with valid ID at VIP check-in.', 45, 470);
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('OFFICIAL COMMUNITY ASSEMBLY • ADDIS ABABA, ETHIOPIA', 45, 492);

        // ─── Right Column: QR Code Container ───
        // Crisp white QR Box with Gold Border
        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(645, 125, 270, 270, 16);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (qrImg) {
          ctx.drawImage(qrImg, 660, 140, 240, 240);

          // Embedded PUBG Mobile Logo in center of QR
          if (pubgLogoImg && pubgLogoImg.naturalWidth > 0) {
            const logoW = 56;
            const logoH = 28;
            const logoX = 780 - logoW / 2;
            const logoY = 260 - logoH / 2;

            ctx.fillStyle = '#050505';
            drawRoundRect(logoX - 4, logoY - 4, logoW + 8, logoH + 8, 6);
            ctx.fill();
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.drawImage(pubgLogoImg, logoX, logoY, logoW, logoH);
          }
        }

        // Gate instructions below QR
        ctx.textAlign = 'center';
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#FBBF24';
        ctx.fillText('VIP GATE SCAN POINT', 780, 425);
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText('Optical Anti-Tamper Secured', 780, 445);

      } else {
        // ══════════════════════════════════════════════════════════════
        // ─── STANDARD VERTICAL TACTICAL PASS (600 x 960) ─────────────
        // ══════════════════════════════════════════════════════════════
        canvas.width = 600;
        canvas.height = 960;

        // Background - Void dark
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 600, 960);

        // Graphite inner card area
        ctx.fillStyle = '#141414';
        drawRoundRect(24, 24, 552, 912, 20);
        ctx.fill();

        // Border outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#262626';
        ctx.stroke();

        // Top lime accent bar
        ctx.fillStyle = '#CCFF00';
        ctx.shadowColor = '#CCFF00';
        ctx.shadowBlur = 15;
        ctx.fillRect(24, 24, 552, 6);
        ctx.shadowBlur = 0;

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

        // Top PUBG Mobile Logo
        if (pubgLogoImg && pubgLogoImg.naturalWidth > 0) {
          ctx.drawImage(pubgLogoImg, 258, 48, 84, 42);
        }

        // "PUBG MOBILE"
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('PUBG MOBILE', 300, 114);

        // "COMMUNITY ASSEMBLY"
        ctx.font = '800 24px Oswald, Impact, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('COMMUNITY ASSEMBLY', 300, 145);

        // "ETHIOPIA"
        ctx.font = '900 36px Oswald, Impact, sans-serif';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText('ETHIOPIA', 300, 185);

        // Header Divider Line
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 205);
        ctx.lineTo(540, 205);
        ctx.stroke();

        // Reference ID Container Box
        ctx.fillStyle = '#0a0a0a';
        drawRoundRect(150, 220, 300, 38, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(204, 255, 0, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(referenceId, 300, 245);

        // QR Code Rendering
        if (qrImg) {
          // QR Background box (crisp white for 100% optical camera detection)
          ctx.fillStyle = '#FFFFFF';
          drawRoundRect(170, 275, 260, 260, 16);
          ctx.fill();
          ctx.strokeStyle = '#CCFF00';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw the QR image on top of the background box
          ctx.drawImage(qrImg, 180, 285, 240, 240);

          // Draw centered PUBG Mobile logo in the QR code
          if (pubgLogoImg && pubgLogoImg.naturalWidth > 0) {
            const logoW = 56;
            const logoH = 28;
            const logoX = 300 - logoW / 2;
            const logoY = 405 - logoH / 2;

            ctx.fillStyle = '#050505';
            drawRoundRect(logoX - 4, logoY - 4, logoW + 8, logoH + 8, 6);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.drawImage(pubgLogoImg, logoX, logoY, logoW, logoH);
          }
        }

        // Attendee Info Section
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 28px Oswald, Impact, sans-serif';
        ctx.fillText(fullName.toUpperCase(), 300, 580);

        // In-Game Name (IGN)
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(`IGN: ${inGameName}`, 300, 615);

        // Category & Status
        ctx.font = '600 15px Inter, sans-serif';
        ctx.fillStyle = '#999999';
        ctx.fillText(categoryLabel, 300, 648);

        // Status pill
        ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#0d2818' : '#2d1e02';
        drawRoundRect(220, 670, 160, 28, 14);
        ctx.fill();
        ctx.strokeStyle = status.toUpperCase() === 'CONFIRMED' ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillStyle = status.toUpperCase() === 'CONFIRMED' ? '#34d399' : '#fbbf24';
        ctx.fillText(status.toUpperCase(), 300, 688);

        // Security watermark / Footer info
        ctx.strokeStyle = '#222222';
        ctx.beginPath();
        ctx.moveTo(60, 730);
        ctx.lineTo(540, 730);
        ctx.stroke();

        ctx.font = '500 12px Inter, sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText('OFFICIAL PUBG MOBILE TEAM • ADMISSION TICKET', 300, 765);
        ctx.fillText('Present this pass & valid ID at the assembly entrance.', 300, 785);

        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText('OFFICIAL COMMUNITY ASSEMBLY • PUBG MOBILE ET', 300, 840);
      }

      // Trigger automatic file download
      const dataUri = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUri;
      downloadLink.download = `PUBG-${isVip ? 'VIP-' : ''}PASS-${referenceId}.png`;
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
  }, [categoryLabel, fullName, inGameName, isVip, qrDataUrl, referenceId, status]);

  // ════════════════════════════════════════════════════════════════════════════
  // ─── RENDER: VIP HORIZONTAL PASS ──────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (isVip) {
    return (
      <div className={clsx('relative w-full max-w-2xl mx-auto', className)}>
        <div
          ref={cardRef}
          className={clsx(
            'relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1810] via-[#12100d] to-[#0a0805] text-white shadow-2xl',
            'border-2 border-amber-500/40 hover:border-amber-400/80 transition-all duration-300',
            'shadow-[0_16px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.18)]'
          )}
        >
          {/* Top Luxury Gold Gradient Highlight Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.8)]" />

          {/* Tactical Corner Brackets (Gold) */}
          <div className="pointer-events-none absolute top-3.5 left-3.5 h-3.5 w-3.5 border-t-2 border-l-2 border-amber-400/70" />
          <div className="pointer-events-none absolute top-3.5 right-3.5 h-3.5 w-3.5 border-t-2 border-r-2 border-amber-400/70" />
          <div className="pointer-events-none absolute bottom-3.5 left-3.5 h-3.5 w-3.5 border-b-2 border-l-2 border-amber-400/70" />
          <div className="pointer-events-none absolute bottom-3.5 right-3.5 h-3.5 w-3.5 border-b-2 border-r-2 border-amber-400/70" />

          {/* VIP Pass Header (Top Logo & Title) */}
          <div className="pt-4 sm:pt-5 px-4 sm:px-6 pb-3 sm:pb-4 border-b border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/community-assembly-logo.png"
                alt="PUBG Mobile Community Assembly Ethiopia"
                className="h-11 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]"
              />
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-amber-400 uppercase font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  OFFICIAL PUBG MOBILE TEAM
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                  COMMUNITY ASSEMBLY <span className="text-amber-400">— ETHIOPIA</span>
                </h3>
              </div>
            </div>

            {/* Glowing VIP Pass Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/60 text-amber-300 font-heading font-black text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.35)] shrink-0">
              <span>⭐</span> VIP ALL-ACCESS PASS
            </div>
          </div>

          {/* Horizontal Split Body (Left Info, Right QR Code) */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column: Attendee Data */}
            <div className="md:col-span-7 space-y-4 text-left">
              {/* Pass Ref */}
              <div className="inline-flex items-center gap-2 rounded bg-black/60 px-3 py-1 border border-amber-500/30">
                <span className="font-mono text-[10px] text-amber-200/70 uppercase">
                  PASS REF:
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-amber-400">
                  {referenceId}
                </span>
              </div>

              {/* Attendee Name & IGN */}
              <div className="space-y-1">
                <div className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wide text-white">
                  {fullName}
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2">
                  <span>IGN: {inGameName}</span>
                </div>
                <div className="font-body text-xs text-neutral-300">
                  Role: <span className="font-semibold text-white">{categoryLabel}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge status={status as BadgeStatus} />
                <span className="font-mono text-[11px] text-neutral-400 uppercase">
                  VIP TICKET HOLDER
                </span>
              </div>

              {/* VIP Privileges Banner */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-0.5 font-body">
                <div className="font-mono font-bold text-[10px] tracking-wider text-amber-400 uppercase">
                  ✨ VIP ACCESS PRIVILEGES
                </div>
                <div>Front-Row Seating • Fast-Track Admission • VIP Lounge Access</div>
              </div>
            </div>

            {/* Right Column: QR Code Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                {qrDataUrl ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={`VIP Pass QR Code for ${referenceId}`}
                      width={172}
                      height={172}
                      className="h-full w-full object-contain rounded select-none"
                    />
                    {/* Centered Attached PUBG MOBILE Logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-[#050505] px-1.5 py-1 rounded-md border border-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/community-assembly-logo.png"
                          alt="PUBG Mobile"
                          className="h-5 w-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-xs text-neutral-500">
                    QR Code Loading...
                  </div>
                )}

                {/* Scanning radar indicator dot (Gold) */}
                <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-400" />
              </div>

              <div className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                SCAN AT VIP GATE
              </div>
            </div>
          </div>

          {/* Shimmer Footer Bar */}
          <div className="relative overflow-hidden py-2 px-6 bg-amber-950/30 border-t border-amber-500/20 text-center holo-shimmer">
            <div className="font-mono text-[10px] tracking-wider text-amber-200/80 uppercase">
              OFFICIAL VIP PASS • PRESENT AT DEDICATED ASSEMBLY ENTRANCE
            </div>
          </div>
        </div>

        {/* Download Button Trigger */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300/80 hover:text-amber-400 transition-colors cursor-pointer"
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
            <span>{isDownloading ? 'GENERATING VIP PASS IMAGE...' : 'SAVE DIGITAL VIP PASS IMAGE'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ─── RENDER: STANDARD VERTICAL TACTICAL PASS ──────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
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
        <div className="p-4 sm:p-6 text-center">
          {/* Official Team Verified Pill */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-[10px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
            OFFICIAL PUBG MOBILE TEAM
          </div>

          {/* Top Logo */}
          <div className="flex justify-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/community-assembly-logo.png"
              alt="PUBG Mobile Community Assembly Ethiopia"
              className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]"
            />
          </div>

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
              <div className="relative flex h-full w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`Check-in QR Code for ${referenceId}`}
                  width={172}
                  height={172}
                  className="h-full w-full object-contain rounded select-none"
                />
                {/* Centered PUBG MOBILE Logo Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#050505] px-1.5 py-1 rounded-md border border-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/community-assembly-logo.png"
                      alt="PUBG Mobile"
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
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

      {/* Direct Pass Download Trigger */}
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
