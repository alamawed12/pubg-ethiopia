'use client';

import React, { forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options = [],
      error,
      name,
      value,
      defaultValue,
      onChange,
      required,
      placeholder,
      className,
      disabled,
      id,
      ...restProps
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || name || generatedId;

    return (
      <div className={clsx('relative w-full', className)}>
        {/* Label Above */}
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-[var(--color-silver,#999999)] select-none"
          >
            {label}
            {required && <span className="ml-1 text-[var(--color-lime,#CCFF00)]">*</span>}
          </label>
        )}

        <div className="group relative w-full">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={clsx(
              'w-full appearance-none rounded-xl font-body text-sm text-white',
              'bg-[var(--color-charcoal,#111111)] px-4 py-3.5 pr-10 outline-none transition-all duration-200 cursor-pointer',
              'border',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                : 'border-white/10 hover:border-white/20 focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40',
              disabled && 'opacity-50 cursor-not-allowed bg-black/40'
            )}
            {...restProps}
          >
            {placeholder && (
              <option value="" disabled className="bg-[var(--color-charcoal,#111111)] text-[var(--color-silver,#999999)]">
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
                className="bg-[var(--color-charcoal,#111111)] py-2 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Tactical Chevron Indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-silver,#999999)] transition-colors duration-200 group-hover:text-[var(--color-lime,#CCFF00)]">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Animated Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${selectId}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-xs font-mono text-red-400"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
