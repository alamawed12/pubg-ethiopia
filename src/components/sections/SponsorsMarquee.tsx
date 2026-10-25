'use client';

import React, { useEffect, useState } from 'react';

export interface SponsorItem {
  id: string;
  name: string;
  logo?: string;
  url?: string;
  tier?: string;
}

export function SponsorsMarquee() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [title, setTitle] = useState('OFFICIAL SPONSORS & PARTNERS');
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.sponsorsEnabled !== undefined) setEnabled(Boolean(data.sponsorsEnabled));
          if (data.sponsorsTitle !== undefined) setTitle(data.sponsorsTitle);
          if (Array.isArray(data.sponsors)) setSponsors(data.sponsors);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !enabled || sponsors.length === 0) {
    return null;
  }

  // Multiply list so the marquee always fills the screen seamlessly across all devices
  let displayList = [...sponsors];
  while (displayList.length < 8) {
    displayList = [...displayList, ...sponsors];
  }
  const marqueeItems = [...displayList, ...displayList];

  const handleImgError = (key: string) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <section className="relative w-full py-8 sm:py-10 bg-transparent overflow-hidden select-none border-none">
      {/* Background Subtle Gradient Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent pointer-events-none" />

      {/* Optional Minimalist Title */}
      {title && title.trim().length > 0 && (
        <div className="relative max-w-7xl mx-auto px-4 text-center mb-6">
          <p className="font-sans text-[11px] sm:text-xs font-bold text-neutral-400 tracking-[0.25em] uppercase">
            {title}
          </p>
        </div>
      )}

      {/* Infinite Right-to-Left Loop: Pure PNG Logos, No Borders, No Cards, No Links */}
      <div className="relative w-full overflow-hidden border-none">
        {/* Edge Gradient Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-36 z-10 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-36 z-10 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />

        {/* Scrolling Strip — Uninterrupted Continuous Infinite Loop */}
        <div className="animate-marquee items-center py-2 border-none pointer-events-none select-none">
          {marqueeItems.map((sponsor, index) => {
            const errorKey = `${sponsor.id}-${index}`;
            const hasLogo = Boolean(sponsor.logo && !imgErrors[errorKey]);

            return (
              <div
                key={errorKey}
                className="flex items-center justify-center px-8 sm:px-12 md:px-16 shrink-0 border-none bg-transparent"
              >
                {hasLogo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    onError={() => handleImgError(errorKey)}
                    className="h-9 sm:h-12 md:h-14 w-auto max-w-[150px] sm:max-w-[200px] object-contain filter brightness-90 hover:brightness-110 opacity-85 hover:opacity-100 transition-all duration-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                    draggable={false}
                  />
                ) : (
                  <span className="font-heading font-black text-base sm:text-lg md:text-xl text-neutral-400 tracking-wider uppercase opacity-80 hover:opacity-100 transition-opacity">
                    {sponsor.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
