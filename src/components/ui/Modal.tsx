'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Basic Focus Trap inside the modal panel
      if (e.key === 'Tab' && modalPanelRef.current) {
        const focusableElements = modalPanelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      window.addEventListener('keydown', handleKeyDown);

      // Auto-focus the modal panel or first interactive element
      const timeoutId = setTimeout(() => {
        if (modalPanelRef.current) {
          const focusable = modalPanelRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable) {
            focusable.focus();
          } else {
            modalPanelRef.current.focus();
          }
        }
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timeoutId);

        // Restore focus to previous element
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop with blur and dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-[var(--color-void,#050505)]/85 backdrop-blur-md"
          />

          {/* Centered Modal Content Panel */}
          <motion.div
            ref={modalPanelRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              'relative z-10 w-full max-w-lg rounded-sm overflow-hidden outline-none',
              'bg-[var(--color-graphite,#1a1a1a)] text-white',
              'border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)]',
              className
            )}
          >
            {/* Top Tactical Accent Bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--color-lime,#CCFF00)] to-transparent" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4.5">
              {title ? (
                <h3
                  id="modal-title"
                  className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white"
                >
                  {title}
                </h3>
              ) : (
                <div />
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="group -mr-2 flex h-9 w-9 items-center justify-center rounded-sm text-[var(--color-silver,#999999)] transition-colors hover:bg-white/5 hover:text-[var(--color-lime,#CCFF00)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lime,#CCFF00)]"
              >
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
