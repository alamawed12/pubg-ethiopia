'use client';

import React, { useRef, useState, useCallback } from 'react';
import clsx from 'clsx';
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

  // Helper to wait for Montserrat font before canvas rendering
  const ensureFontLoaded = async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await Promise.all([
          document.fonts.load('900 34px Montserrat'),
          document.fonts.load('800 20px Montserrat'),
          document.fonts.load('700 14px Montserrat'),
        ]);
      } catch {
        // Fallback gracefully
      }
    }
  };

  // Handle high-resolution digital pass download using Canvas API
  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      await ensureFontLoaded();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context unavailable');
      }

      // Helper: draw a rounded rect on a fresh path
      const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };

      // Load QR Code Image
      let qrImg: HTMLImageElement | null = null;
      if (qrDataUrl) {
        try {
          qrImg = await loadImage(qrDataUrl);
        } catch {
          // QR code fallback
        }
      }

      // Load PMCA logo for centering inside QR
      let pmcaLogoImg: HTMLImageElement | null = null;
      try {
        pmcaLogoImg = await loadImage('/images/community-assembly-logo.png');
      } catch {
        // Optional fallback
      }

      // Helper to draw text that wraps or scales
      const drawAttendeeName = (
        nameText: string,
        startX: number,
        startY: number,
        maxWidth: number,
        baseSize: number
      ): number => {
        let fontSize = baseSize;
        if (nameText.length > 26) {
          fontSize = Math.round(baseSize * 0.65);
        } else if (nameText.length > 18) {
          fontSize = Math.round(baseSize * 0.8);
        }

        ctx.font = `900 ${fontSize}px Montserrat, sans-serif`;
        ctx.fillStyle = '#FFFFFF';

        const words = nameText.split(' ');
        let line = '';
        let y = startY;
        const lineHeight = fontSize + 4;

        if (ctx.measureText(nameText).width > maxWidth && words.length > 1) {
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            if (ctx.measureText(testLine).width > maxWidth && n > 0) {
              ctx.fillText(line.trim(), startX, y);
              line = words[n] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), startX, y);
          return y + 10;
        } else {
          ctx.fillText(nameText, startX, y);
          return y + 10;
        }
      };

      if (isVip) {
        // ══════════════════════════════════════════════════════════════
        // ─── VIP HORIZONTAL / LANDSCAPE PASS (960 x 540) ──────────────
        // ══════════════════════════════════════════════════════════════
        canvas.width = 960;
        canvas.height = 540;

        // Draw Official VIP Pass Background Graphic
        const bgImg = await loadImage('/images/ticket-vip-bg.png');
        ctx.drawImage(bgImg, 0, 0, 960, 540);

        // Draw QR Code into the pre-designed white rounded square (X: 546, Y: 118, W: 300, H: 302)
        if (qrImg) {
          const qrW = 264;
          const qrH = 264;
          const qrX = 546 + (300 - qrW) / 2;
          const qrY = 118 + (302 - qrH) / 2;
          ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);

          // Draw PMCA logo in the exact center of QR code
          if (pmcaLogoImg && pmcaLogoImg.naturalWidth > 0) {
            const logoW = 54;
            const logoH = 27;
            const logoX = qrX + (qrW - logoW) / 2;
            const logoY = qrY + (qrH - logoH) / 2;

            ctx.fillStyle = '#050505';
            drawRoundRect(logoX - 4, logoY - 4, logoW + 8, logoH + 8, 6);
            ctx.fill();
            ctx.strokeStyle = '#CCFF00';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.drawImage(pmcaLogoImg, logoX, logoY, logoW, logoH);
          }
        }

        // Draw Attendee Details into the blank space on the left
        ctx.textAlign = 'left';

        // Reference ID Badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        drawRoundRect(68, 120, 200, 32, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(204, 255, 0, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.font = '700 11px Montserrat, sans-serif';
        ctx.fillStyle = '#999999';
        ctx.fillText('REF:', 82, 141);
        ctx.font = '800 12px Montserrat, monospace';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(referenceId, 115, 141);

        // Attendee Full Name (Bold Montserrat with multi-line/auto-scale support)
        const nextY = drawAttendeeName(fullName.toUpperCase(), 68, 195, 450, 34);

        // In-Game Name (IGN)
        ctx.font = '800 20px Montserrat, sans-serif';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(`IGN: ${inGameName}`, 68, nextY + 24);

        // Category / Role
        ctx.font = '700 14px Montserrat, sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`ROLE: ${categoryLabel.toUpperCase()}`, 68, nextY + 54);

        // Status Badge Pill
        const isConfirmed = status.toUpperCase() === 'CONFIRMED' || status.toUpperCase() === 'CHECKED_IN';
        ctx.fillStyle = isConfirmed ? 'rgba(13, 40, 24, 0.9)' : 'rgba(45, 30, 2, 0.9)';
        drawRoundRect(68, nextY + 76, 160, 28, 14);
        ctx.fill();
        ctx.strokeStyle = isConfirmed ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '800 11px Montserrat, sans-serif';
        ctx.fillStyle = isConfirmed ? '#34d399' : '#fbbf24';
        ctx.fillText(status.toUpperCase(), 86, nextY + 94);
      } else {
        // ══════════════════════════════════════════════════════════════
        // ─── STANDARD VERTICAL TACTICAL PASS (600 x 960) ─────────────
        // ══════════════════════════════════════════════════════════════
        canvas.width = 600;
        canvas.height = 960;

        // Draw Official Standard Pass Background Graphic
        const bgImg = await loadImage('/images/ticket-standard-bg.png');
        ctx.drawImage(bgImg, 0, 0, 600, 960);

        // Draw QR Code into the pre-designed white rounded square (X: 68, Y: 548, W: 300, H: 302)
        if (qrImg) {
          const qrW = 264;
          const qrH = 264;
          const qrX = 68 + (300 - qrW) / 2;
          const qrY = 548 + (302 - qrH) / 2;
          ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);

          // Draw PMCA logo in the exact center of QR code
          if (pmcaLogoImg && pmcaLogoImg.naturalWidth > 0) {
            const logoW = 54;
            const logoH = 27;
            const logoX = qrX + (qrW - logoW) / 2;
            const logoY = qrY + (qrH - logoH) / 2;

            ctx.fillStyle = '#050505';
            drawRoundRect(logoX - 4, logoY - 4, logoW + 8, logoH + 8, 6);
            ctx.fill();
            ctx.strokeStyle = '#CCFF00';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.drawImage(pmcaLogoImg, logoX, logoY, logoW, logoH);
          }
        }

        // Draw Attendee Details into the blank space above the QR box
        ctx.textAlign = 'left';

        // Reference ID Badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        drawRoundRect(68, 200, 200, 32, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(204, 255, 0, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.font = '700 11px Montserrat, sans-serif';
        ctx.fillStyle = '#999999';
        ctx.fillText('REF:', 82, 221);
        ctx.font = '800 12px Montserrat, monospace';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(referenceId, 115, 221);

        // Attendee Full Name (Bold Montserrat with multi-line/auto-scale support)
        const nextY = drawAttendeeName(fullName.toUpperCase(), 68, 275, 460, 32);

        // In-Game Name (IGN)
        ctx.font = '800 20px Montserrat, sans-serif';
        ctx.fillStyle = '#CCFF00';
        ctx.fillText(`IGN: ${inGameName}`, 68, nextY + 24);

        // Category / Role
        ctx.font = '700 14px Montserrat, sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`CATEGORY: ${categoryLabel.toUpperCase()}`, 68, nextY + 54);

        // Status Badge Pill
        const isConfirmed = status.toUpperCase() === 'CONFIRMED' || status.toUpperCase() === 'CHECKED_IN';
        ctx.fillStyle = isConfirmed ? 'rgba(13, 40, 24, 0.9)' : 'rgba(45, 30, 2, 0.9)';
        drawRoundRect(68, nextY + 76, 160, 28, 14);
        ctx.fill();
        ctx.strokeStyle = isConfirmed ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '800 11px Montserrat, sans-serif';
        ctx.fillStyle = isConfirmed ? '#34d399' : '#fbbf24';
        ctx.fillText(status.toUpperCase(), 86, nextY + 94);
      }

      // Trigger automatic file download
      const dataUri = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUri;
      downloadLink.download = `${fullName.replace(/\s+/g, '_')}_${isVip ? 'VIP' : 'Standard'}_Assembly_Pass.png`;
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
        {/* VIP Pass Container with Official Background Template */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[960/540] overflow-hidden rounded-2xl shadow-2xl border border-[#CCFF00]/30 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(204,255,0,0.15)] bg-black select-none"
          style={{
            backgroundImage: `url('/images/ticket-vip-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Left Column Attendee Details (Blank Space Area) */}
          <div className="absolute left-[7%] top-[22%] w-[46%] flex flex-col justify-center text-left">
            {/* Reference ID Pill */}
            <div className="inline-flex items-center gap-1.5 self-start px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-black/75 border border-[#CCFF00]/40 backdrop-blur-sm mb-1 sm:mb-2">
              <span className="font-montserrat font-bold text-[8px] sm:text-[10px] text-[#999999] uppercase">REF:</span>
              <span className="font-montserrat font-black text-[9px] sm:text-xs tracking-wider text-[#CCFF00]">
                {referenceId}
              </span>
            </div>

            {/* Attendee Full Name (Bold Montserrat with multi-line/auto-size support) */}
            <h2
              className={clsx(
                'font-montserrat font-black text-white uppercase tracking-tight leading-tight drop-shadow-md break-words',
                fullName.length > 25
                  ? 'text-xs sm:text-base md:text-lg'
                  : fullName.length > 15
                  ? 'text-sm sm:text-lg md:text-2xl'
                  : 'text-base sm:text-2xl md:text-3xl'
              )}
            >
              {fullName}
            </h2>

            {/* In-Game Name (Bold Montserrat, Lime) */}
            <div className="font-montserrat font-extrabold text-[11px] sm:text-base md:text-lg text-[#CCFF00] tracking-wide mt-0.5 sm:mt-1 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] truncate">
              IGN: {inGameName}
            </div>

            {/* Role & Category */}
            <div className="font-montserrat font-bold text-[9px] sm:text-xs md:text-sm text-neutral-300 mt-0.5 sm:mt-1 truncate">
              ROLE: <span className="text-white font-extrabold">{categoryLabel}</span>
            </div>

            {/* Status Pill */}
            <div className="mt-1.5 sm:mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-montserrat font-black tracking-wider uppercase bg-[#CCFF00]/20 border border-[#CCFF00] text-[#CCFF00]">
                {status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Column: QR Code aligned directly inside the pre-designed white rounded square */}
          <div
            className="absolute left-[56.875%] top-[21.85%] w-[31.25%] h-[55.93%] flex items-center justify-center p-[4%] relative"
          >
            {qrDataUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`VIP Pass QR Code for ${referenceId}`}
                  className="w-full h-full object-contain select-none"
                />
                {/* Embedded PMCA Logo Badge in center of QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#050505] p-1 rounded-md border border-[#CCFF00] shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/community-assembly-logo.png"
                      alt="PMCA"
                      className="h-4 sm:h-5 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center font-montserrat font-bold text-[9px] sm:text-xs text-neutral-500 text-center px-2">
                {status === 'CONFIRMED' || status === 'CHECKED_IN' ? 'LOADING QR...' : 'PASS PENDING'}
              </div>
            )}
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CCFF00] text-black font-montserrat font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#b8e600] transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{isDownloading ? 'GENERATING VIP PASS...' : 'DOWNLOAD VIP PASS IMAGE'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ─── RENDER: STANDARD VERTICAL TACTICAL PASS ──────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className={clsx('relative w-full max-w-[380px] sm:max-w-[420px] mx-auto', className)}>
      {/* Standard Pass Container with Official Background Template */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[600/960] overflow-hidden rounded-2xl shadow-2xl border border-[#CCFF00]/30 shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(204,255,0,0.15)] bg-black select-none"
        style={{
          backgroundImage: `url('/images/ticket-standard-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Attendee Details in Blank Space (Above the QR Box) */}
        <div className="absolute left-[11%] top-[21%] right-[11%] flex flex-col text-left">
          {/* Reference ID Pill */}
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-md bg-black/75 border border-[#CCFF00]/40 backdrop-blur-sm mb-2">
            <span className="font-montserrat font-bold text-[9px] sm:text-[11px] text-[#999999] uppercase">REF:</span>
            <span className="font-montserrat font-black text-[10px] sm:text-xs tracking-wider text-[#CCFF00]">
              {referenceId}
            </span>
          </div>

          {/* Attendee Full Name (Bold Montserrat with multi-line/auto-size support) */}
          <h2
            className={clsx(
              'font-montserrat font-black text-white uppercase tracking-tight leading-tight drop-shadow-md break-words',
              fullName.length > 25
                ? 'text-sm sm:text-base md:text-xl'
                : fullName.length > 15
                ? 'text-base sm:text-xl md:text-2xl'
                : 'text-lg sm:text-2xl md:text-3xl'
            )}
          >
            {fullName}
          </h2>

          {/* In-Game Name (Bold Montserrat, Lime) */}
          <div className="font-montserrat font-extrabold text-sm sm:text-base md:text-lg text-[#CCFF00] tracking-wide mt-1 drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] truncate">
            IGN: {inGameName}
          </div>

          {/* Category / Role */}
          <div className="font-montserrat font-bold text-[10px] sm:text-xs text-neutral-300 mt-1 truncate">
            CATEGORY: <span className="text-white font-extrabold">{categoryLabel}</span>
          </div>

          {/* Status Badge */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-montserrat font-black tracking-wider uppercase bg-[#CCFF00]/20 border border-[#CCFF00] text-[#CCFF00]">
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* QR Code Container aligned directly inside the pre-designed white rounded square */}
        <div
          className="absolute left-[11.33%] top-[57.08%] w-[50%] h-[31.46%] flex items-center justify-center p-[4%] relative"
        >
          {qrDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`Standard Pass QR Code for ${referenceId}`}
                className="w-full h-full object-contain select-none"
              />
              {/* Embedded PMCA Logo Badge in center of QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-[#050505] p-1 rounded-md border border-[#CCFF00] shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/community-assembly-logo.png"
                    alt="PMCA"
                    className="h-4 sm:h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center font-montserrat font-bold text-[10px] sm:text-xs text-neutral-500 text-center px-2">
              {status === 'CONFIRMED' || status === 'CHECKED_IN' ? 'LOADING QR...' : 'PASS PENDING'}
            </div>
          )}
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CCFF00] text-black font-montserrat font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#b8e600] transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isDownloading ? 'GENERATING PASS...' : 'DOWNLOAD EVENT PASS IMAGE'}</span>
        </button>
      </div>
    </div>
  );
}

export default EventPass;
