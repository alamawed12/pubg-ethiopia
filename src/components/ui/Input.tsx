'use client';

import React, { forwardRef, useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      type = 'text',
      name,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
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
    const inputId = id || name || generatedId;

    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value ?? '') : internalValue;
    const isFloating = isFocused || currentValue.length > 0 || (Boolean(placeholder) && isFocused);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const cleanLabel = label ? label.replace(/\s*\*+\s*$/, '') : '';

    return (
      <div className={clsx('relative w-full', className)}>
        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            defaultValue={defaultValue}
            required={required}
            disabled={disabled}
            placeholder={isFloating ? placeholder : (placeholder && !label ? placeholder : '')}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={clsx(
              'peer w-full rounded-xl font-sans text-sm font-medium text-white',
              'bg-[#141414] px-4 py-3.5 outline-none transition-all duration-200',
              'placeholder:text-neutral-400 placeholder:opacity-80',
              'border',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                : success
                ? 'border-[var(--color-lime,#CCFF00)] focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40'
                : 'border-white/10 hover:border-white/25 focus:border-[var(--color-lime,#CCFF00)] focus:ring-1 focus:ring-[var(--color-lime,#CCFF00)]/40',
              disabled && 'opacity-50 cursor-not-allowed bg-black/40',
              (success || error) && 'pr-11'
            )}
            {...restProps}
          />

          {/* Floating Label (Clean Apple-style font, guaranteed no duplicate **) */}
          {cleanLabel && (
            <label
              htmlFor={inputId}
              className={clsx(
                'pointer-events-none absolute left-3 transition-all duration-200 ease-out select-none font-sans',
                isFloating
                  ? clsx(
                      '-top-2.5 px-1.5 text-xs font-semibold tracking-wider uppercase',
                      'bg-[#141414] rounded',
                      error
                        ? 'text-red-400'
                        : isFocused
                        ? 'text-[var(--color-lime,#CCFF00)]'
                        : 'text-neutral-300'
                    )
                  : 'top-3.5 left-4 text-sm font-medium text-neutral-400'
              )}
            >
              {cleanLabel}
              {required && <span className="ml-1 text-[var(--color-lime,#CCFF00)] font-bold">*</span>}
            </label>
          )}

          {/* Status Indicator Icon (Success check or Error exclamation) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
            {error ? (
              <svg
                className="h-4 w-4 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : success ? (
              <svg
                className="h-4 w-4 text-[var(--color-lime,#CCFF00)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : null}
          </div>
        </div>

        {/* Animated Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${inputId}-error`}
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

Input.displayName = 'Input';

export default Input;
