'use client';

import React, { useEffect, useState } from 'react';

export interface TacticalHUDProps {
  className?: string;
}

export function TacticalHUD({ className = '' }: TacticalHUDProps) {
  const [coords, setCoords] = useState({ lat: '9.0249', lng: '38.7469' });
  const [signalBars, setSignalBars] = useState(7);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    // Subtle coordinate drift simulation (Addis Ababa coordinates)
    const coordInterval = setInterval(() => {
      const latOffset = (Math.random() - 0.5) * 0.003;
      const lngOffset = (Math.random() - 0.5) * 0.003;
      setCoords({
        lat: (9.0249 + latOffset).toFixed(4),
        lng: (38.7469 + lngOffset).toFixed(4),
      });
    }, 2800);

    // Subtle signal fluctuation
    const signalInterval = setInterval(() => {
      setSignalBars(Math.floor(Math.random() * 2) + 7); // 7 or 8 bars
    }, 3500);

    return () => {
      clearInterval(coordInterval);
      clearInterval(signalInterval);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none z-10 p-4 md:p-8 font-mono text-[10px] md:text-xs text-[#CCFF00]/30 tracking-widest ${className}`}
    >
      {/* ─── Corner Brackets ─── */}
      {/* Top-Left Bracket */}
      <div className="absolute top-3 left-3 md:top-6 md:left-6 w-4 h-4 md:w-6 md:h-6 border-t-2 border-l-2 border-[#CCFF00]/40" />

      {/* Top-Right Bracket */}
      <div className="absolute top-3 right-3 md:top-6 md:right-6 w-4 h-4 md:w-6 md:h-6 border-t-2 border-r-2 border-[#CCFF00]/40" />

      {/* Bottom-Left Bracket */}
      <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 w-4 h-4 md:w-6 md:h-6 border-b-2 border-l-2 border-[#CCFF00]/40" />

      {/* Bottom-Right Bracket */}
      <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6 w-4 h-4 md:w-6 md:h-6 border-b-2 border-r-2 border-[#CCFF00]/40" />

      {/* ─── HUD Corner Content ─── */}
      {/* Top-Left */}
      <div className="absolute top-5 left-5 md:top-9 md:left-9 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]/40 animate-pulse" />
          <span className="text-[#CCFF00]/40 font-semibold">SYS.SYS_LOC</span>
        </div>
        <div>
          {coords.lat}° N, {coords.lng}° E
        </div>
        <div className="text-[#999999]/30 text-[9px] md:text-[10px]">
          SEC-09 • ADDIS ABABA
        </div>
      </div>

      {/* Top-Right */}
      <div className="absolute top-5 right-5 md:top-9 md:right-9 text-right flex flex-col gap-0.5 text-[#CCFF00]/25">
        <div>GRID REF: 09-3874</div>
        <div className="text-[9px] md:text-[10px] text-[#999999]/30">
          CH: 04 • PUBG-M-ET
        </div>
      </div>

      {/* Bottom-Left */}
      <div className="absolute bottom-5 left-5 md:bottom-9 md:left-9 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span>STATUS:</span>
          <span className="text-[#CCFF00]/50 font-bold">ACTIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <span>SIGNAL:</span>
          <span className="text-[#CCFF00]/40 tracking-tighter">
            {'█'.repeat(signalBars)}
            {'░'.repeat(8 - signalBars)}
          </span>
        </div>
      </div>

      {/* Bottom-Right */}
      <div className="absolute bottom-5 right-5 md:bottom-9 md:right-9 text-right flex flex-col gap-0.5">
        <div>ALT: 2355m ASL</div>
        <div className="text-[#999999]/30 text-[9px] md:text-[10px]">
          BEARING: 042° NE
        </div>
      </div>
    </div>
  );
}

export default TacticalHUD;
