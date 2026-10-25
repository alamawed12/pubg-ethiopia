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
  const [subtitle, setSubtitle] = useState('POWERING THE PUBG MOBILE COMMUNITY ASSEMBLY ETHIOPIA');
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.sponsorsEnabled !== undefined) setEnabled(Boolean(data.sponsorsEnabled));
          if (data.sponsorsTitle) setTitle(data.sponsorsTitle);
          if (data.sponsorsSubtitle) setSubtitle(data.sponsorsSubtitle);
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

  // Multiply list if needed to ensure seamless continuous right-to-left loop on ultra-wide screens
  let displayList = [...sponsors];
  while (displayList.length < 8) {
    displayList = [...displayList, ...sponsors];
  }
  // Double it for smooth 50% translation infinite loop
  const marqueeItems = [...displayList, ...displayList];

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <section className="relative w-full py-10 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] border-y border-white/5 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-24 bg-[#CCFF00]/5 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="font-sans text-[10px] sm:text-[11px] font-bold text-[#CCFF00] tracking-widest uppercase">
            {title}
          </span>
        </div>
        {subtitle && (
          <p className="font-sans text-xs sm:text-sm font-semibold text-neutral-400 tracking-wide uppercase max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Infinite Marquee Ticker (Right to Left) */}
      <div className="relative w-full overflow-hidden">
        {/* Edge Gradient Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none" />

        {/* Scrolling Strip */}
        <div className="animate-marquee gap-4 py-2 px-4 cursor-default select-none">
          {marqueeItems.map((sponsor, index) => {
            const hasLogo = Boolean(sponsor.logo && !imgErrors[`${sponsor.id}-${index}`]);
            const isClickable = Boolean(sponsor.url && sponsor.url.trim().length > 0);

            const CardContent = (
              <div className="group relative flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-xl bg-[#141414]/90 hover:bg-[#1a1a1a] border border-white/10 hover:border-[#CCFF00]/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0 min-w-[220px] sm:min-w-[260px]">
                {/* Logo or Tactical Monogram */}
                <div className="relative w-11 h-11 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#CCFF00]/40 transition-colors">
                  {hasLogo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      onError={() => handleImgError(`${sponsor.id}-${index}`)}
                      className="w-full h-full object-contain p-1.5 filter brightness-95 group-hover:brightness-110 transition-all"
                    />
                  ) : (
                    <span className="font-heading font-black text-sm text-[#CCFF00] tracking-wider">
                      {getInitials(sponsor.name)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-bold text-sm sm:text-base text-white tracking-wide uppercase truncate group-hover:text-[#CCFF00] transition-colors">
                      {sponsor.name}
                    </h4>
                    {isClickable && (
                      <svg
                        className="w-3 h-3 text-neutral-500 group-hover:text-[#CCFF00] transition-colors shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                  </div>
                  {sponsor.tier && (
                    <p className="font-sans text-[10px] sm:text-[11px] font-semibold text-neutral-400 tracking-wider uppercase truncate mt-0.5">
                      {sponsor.tier}
                    </p>
                  )}
                </div>
              </div>
            );

            if (isClickable) {
              return (
                <a
                  key={`${sponsor.id}-${index}`}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none focus:ring-1 focus:ring-[#CCFF00] rounded-xl"
                  title={`Visit ${sponsor.name}`}
                >
                  {CardContent}
                </a>
              );
            }

            return (
              <div key={`${sponsor.id}-${index}`}>
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
