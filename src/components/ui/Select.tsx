'use client';

import React, { useState, useRef, useEffect, forwardRef, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface SelectChangeEvent {
  target: {
    name?: string;
    value: string;
  };
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: SelectChangeEvent) => void;
  onOpenChange?: (isOpen: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options = [],
      error,
      name,
      value,
      defaultValue,
      onChange,
      onOpenChange,
      required,
      placeholder = 'Select an option...',
      className,
      disabled,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const generatedId = useId();
    const selectId = id || name || generatedId;

    const setDropdownOpen = useCallback(
      (next: boolean) => {
        setIsOpen(next);
        onOpenChange?.(next);
      },
      [onOpenChange]
    );

    const currentValue = value !== undefined ? value : defaultValue;
    const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));

    // Handle outside clicks to close dropdown
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setDropdownOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setDropdownOpen(false);
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, setDropdownOpen]);

    const handleSelect = (option: SelectOption) => {
      if (option.disabled || disabled) return;
      if (onChange) {
        onChange({
          target: {
            name,
            value: String(option.value),
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
      }
      setDropdownOpen(false);
    };

    return (
      <div
        ref={(node) => {
          dropdownRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={clsx('relative w-full select-none', className)}
      >
        {/* Label Above */}
        {label && (
          <label
            htmlFor={selectId}
            onClick={() => !disabled && setDropdownOpen(!isOpen)}
            className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-neutral-300 cursor-pointer"
          >
            {label}
            {required && <span className="ml-1 text-[var(--color-lime,#CCFF00)]">*</span>}
          </label>
        )}

        {/* Hidden Input for standard form submissions */}
        <input
          type="hidden"
          id={selectId}
          name={name}
          value={currentValue !== undefined ? String(currentValue) : ''}
        />

        {/* Custom Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={clsx(
            'group relative w-full flex items-center justify-between rounded-xl font-sans text-sm text-left transition-all duration-200 cursor-pointer',
            'bg-[#141414] px-4 py-3.5 border outline-none',
            error
              ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/30'
              : isOpen
              ? 'border-[var(--color-lime,#CCFF00)] ring-1 ring-[var(--color-lime,#CCFF00)]/40 shadow-[0_0_20px_rgba(204,255,0,0.15)] bg-[#181818]'
              : 'border-white/10 hover:border-white/25 focus:border-[var(--color-lime,#CCFF00)]',
            disabled && 'opacity-50 cursor-not-allowed bg-black/40'
          )}
        >
          <div className="flex-1 pr-2 truncate">
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <span className="text-white font-medium truncate">{selectedOption.label}</span>
                {selectedOption.badge && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] border border-[var(--color-lime,#CCFF00)]/30 shrink-0">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[var(--color-silver,#999999)]">{placeholder}</span>
            )}
          </div>

          {/* Tactical Rotating Chevron */}
          <div
            className={clsx(
              'flex items-center justify-center text-[var(--color-silver,#999999)] transition-transform duration-250 shrink-0',
              isOpen ? 'transform rotate-180 text-[var(--color-lime,#CCFF00)]' : 'group-hover:text-white'
            )}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Custom Tactical Floating Dropdown Menu */}
        <AnimatePresence>
          {isOpen && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 right-0 z-50 overflow-hidden rounded-xl border border-[var(--color-lime,#CCFF00)]/40 bg-[#121212] shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl ring-1 ring-black/80"
              style={{
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(204, 255, 0, 0.12)',
              }}
            >
              <ul
                role="listbox"
                className="max-h-80 sm:max-h-96 overflow-y-auto p-1.5 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/20 font-sans"
              >
                {options.map((option) => {
                  const isSelected = String(option.value) === String(currentValue);

                  return (
                    <li
                      key={String(option.value)}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option)}
                      className={clsx(
                        'group flex items-center justify-between rounded-lg px-3.5 py-3 transition-all duration-150 cursor-pointer text-left',
                        option.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] font-semibold border-l-2 border-[var(--color-lime,#CCFF00)]'
                          : 'text-[#cccccc] hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'text-sm transition-colors',
                              isSelected ? 'text-[var(--color-lime,#CCFF00)] font-bold' : 'group-hover:text-white'
                            )}
                          >
                            {option.label}
                          </span>
                          {option.badge && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[var(--color-lime,#CCFF00)]/20 text-[var(--color-lime,#CCFF00)] border border-[var(--color-lime,#CCFF00)]/40 shrink-0">
                              {option.badge}
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="mt-0.5 text-xs text-[var(--color-silver,#999999)] leading-tight">
                            {option.description}
                          </p>
                        )}
                      </div>

                      {/* Checkmark when selected */}
                      {isSelected && (
                        <div className="shrink-0 text-[var(--color-lime,#CCFF00)]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

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
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
