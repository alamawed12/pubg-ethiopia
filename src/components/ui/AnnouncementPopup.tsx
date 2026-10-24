'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangleIcon, CheckCircleIcon, XMarkIcon } from '@/components/ui/TacticalIcons';

interface AnnouncementData {
  enabled: boolean;
  type: string; // warning, urgent, info, update
  title: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.announcement?.enabled && data.announcement?.message) {
          setAnnouncement(data.announcement);

          // Check if previously dismissed in this session with same title
          const dismissedTitle = sessionStorage.getItem('pubg_announcement_dismissed');
          if (dismissedTitle !== data.announcement.title) {
            // Slight delay so the user lands on the page first, creating a clean entrance
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
          } else {
            // Still show top bar even if modal dismissed
            setShowTopBar(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      sessionStorage.setItem('pubg_announcement_dismissed', announcement.title);
    }
    setIsOpen(false);
    setShowTopBar(true);
  };

  if (!announcement || !announcement.enabled) return null;

  const isUrgent = announcement.type === 'urgent';
  const isWarning = announcement.type === 'warning';
  const isInfo = announcement.type === 'info';

  const themeColors = isUrgent
    ? {
        border: 'border-red-500',
        glow: 'shadow-[0_0_35px_rgba(239,68,68,0.35)]',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        accentText: 'text-red-400',
        ring: 'ring-red-500/30',
        btnBg: 'bg-red-600 hover:bg-red-500 text-white',
      }
    : isWarning
    ? {
        border: 'border-amber-400',
        glow: 'shadow-[0_0_35px_rgba(245,158,11,0.35)]',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        accentText: 'text-amber-400',
        ring: 'ring-amber-400/30',
        btnBg: 'bg-amber-400 hover:bg-amber-300 text-black',
      }
    : isInfo
    ? {
        border: 'border-[#CCFF00]',
        glow: 'shadow-[0_0_35px_rgba(204,255,0,0.35)]',
        badgeBg: 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/40',
        accentText: 'text-[#CCFF00]',
        ring: 'ring-[#CCFF00]/30',
        btnBg: 'bg-[#CCFF00] hover:bg-[#b8e600] text-black',
      }
    : {
        border: 'border-sky-400',
        glow: 'shadow-[0_0_35px_rgba(56,189,248,0.35)]',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        accentText: 'text-sky-400',
        ring: 'ring-sky-400/30',
        btnBg: 'bg-sky-400 hover:bg-sky-300 text-black',
      };

  return (
    <>
      {/* ─── Persistent Top Announcement Bar (Visible when enabled) ─── */}
      {showTopBar && (
        <div
          className={`relative z-50 w-full py-2 px-4 border-b flex items-center justify-between gap-3 text-xs font-sans transition-all backdrop-blur-md ${
            isUrgent
              ? 'bg-red-950/80 border-red-500/40 text-red-200'
              : isWarning
              ? 'bg-[#1a1405]/90 border-amber-500/40 text-amber-200'
              : 'bg-[#0c140c]/90 border-[#CCFF00]/30 text-neutral-200'
          }`}
        >
          <div className="flex items-center gap-2.5 mx-auto truncate max-w-4xl">
            <span className="shrink-0">
              {isUrgent || isWarning ? (
                <AlertTriangleIcon className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <CheckCircleIcon className="w-4 h-4 text-[#CCFF00]" />
              )}
            </span>
            <strong className="font-heading font-black tracking-wider uppercase text-white truncate">
              {announcement.title}:
            </strong>
            <span className="truncate text-neutral-300 hidden sm:inline">{announcement.message}</span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="underline hover:text-white font-bold ml-1 cursor-pointer shrink-0"
            >
              Read More
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowTopBar(false)}
            className="p-1 hover:text-white text-neutral-400 cursor-pointer shrink-0"
            aria-label="Dismiss top announcement"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── High-Impact Apple Pop-Out Announcement Modal ─── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop with modern blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleDismiss}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={`relative z-10 w-full max-w-xl rounded-2xl border-2 bg-gradient-to-b from-[#141414] via-[#0f0f0f] to-[#080808] p-6 sm:p-8 shadow-2xl ${themeColors.border} ${themeColors.glow} ring-1 ${themeColors.ring} overflow-hidden font-sans`}
            >
              {/* Subtle tactical ambient background glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/5 blur-3xl" />

              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Announcement"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Header Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold tracking-wider uppercase border ${themeColors.badgeBg}`}>
                  {isUrgent || isWarning ? (
                    <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {isUrgent ? 'URGENT BULLETIN' : isWarning ? 'OFFICIAL WARNING' : 'COMMUNITY NOTICE'}
                  </span>
                </span>
              </div>

              {/* Title */}
              <h3
                className="text-2xl sm:text-3xl font-heading font-black tracking-wider uppercase text-white mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {announcement.title}
              </h3>

              {/* Message Body with Apple font clarity */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-neutral-200 text-sm leading-relaxed mb-6 font-sans">
                <p className="whitespace-pre-line">{announcement.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-200 font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  DISMISS
                </button>

                {announcement.linkUrl && (
                  <Link
                    href={announcement.linkUrl}
                    onClick={() => {
                      handleDismiss();
                    }}
                    className={`px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all duration-200 text-center cursor-pointer shadow-lg active:scale-95 ${themeColors.btnBg}`}
                  >
                    {announcement.linkText || 'LEARN MORE'} →
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AnnouncementPopup;
