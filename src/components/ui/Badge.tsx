'use client';

import React from 'react';
import clsx from 'clsx';

export type BadgeStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'CHECKED_IN'
  | (string & {});

export interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  className?: string;
}

interface StatusConfig {
  container: string;
  dot: string;
  defaultLabel: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  PENDING: {
    container: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    defaultLabel: 'Pending',
  },
  CONFIRMED: {
    container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    defaultLabel: 'Confirmed',
  },
  REJECTED: {
    container: 'bg-red-500/10 text-red-400 border-red-500/30',
    dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]',
    defaultLabel: 'Rejected',
  },
  WAITLISTED: {
    container: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    defaultLabel: 'Waitlisted',
  },
  CHECKED_IN: {
    container:
      'bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)] border-[var(--color-lime,#CCFF00)] font-bold shadow-[0_0_12px_rgba(204,255,0,0.45)]',
    dot: 'bg-[var(--color-void,#050505)]',
    defaultLabel: 'Checked In',
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  container: 'bg-white/10 text-[var(--color-silver,#999999)] border-white/15',
  dot: 'bg-[var(--color-silver,#999999)]',
  defaultLabel: 'Unknown',
};

export function Badge({ status, label, className }: BadgeProps) {
  const normalizedKey = status?.toUpperCase?.() || '';
  const config = STATUS_CONFIGS[normalizedKey] || DEFAULT_CONFIG;
  const displayLabel = label ?? config.defaultLabel;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border',
        'font-mono text-xs uppercase tracking-wider select-none transition-colors duration-200',
        config.container,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={clsx('h-1.5 w-1.5 rounded-full shrink-0', config.dot)}
      />
      <span>{displayLabel}</span>
    </span>
  );
}

export default Badge;
