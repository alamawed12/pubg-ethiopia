'use client';

import React from 'react';
import clsx from 'clsx';

interface TacticalCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TacticalCheckbox({
  checked,
  onChange,
  disabled = false,
  label,
  ariaLabel,
  className = '',
  size = 'md',
}: TacticalCheckboxProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 rounded',
    md: 'w-4 h-4 rounded-md',
    lg: 'w-5 h-5 rounded-md',
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      className={clsx(
        'inline-flex items-center gap-2 select-none cursor-pointer outline-none transition-all duration-150',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      <div
        className={clsx(
          sizeClasses,
          'border flex items-center justify-center transition-all duration-200 shrink-0',
          checked
            ? 'bg-[#CCFF00] border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.5)]'
            : 'bg-[#181818] border-white/20 hover:border-[#CCFF00]/70 hover:bg-white/5'
        )}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-black stroke-[3.5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {label && <span className="font-sans font-bold text-xs uppercase tracking-wider">{label}</span>}
    </div>
  );
}

export default TacticalCheckbox;
