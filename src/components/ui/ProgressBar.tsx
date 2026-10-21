'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface StepItem {
  number: number;
  label: string;
}

export interface ProgressBarProps {
  currentStep: number;
  steps: StepItem[];
  className?: string;
}

export function ProgressBar({ currentStep, steps, className }: ProgressBarProps) {
  if (!steps || steps.length === 0) return null;

  const activeStep = steps.find((s) => s.number === currentStep) || steps[0];

  return (
    <nav aria-label="Progress" className={clsx('w-full py-2 sm:py-4', className)}>
      {/* Mobile Current Step Headline (Prevents label collisions on phone) */}
      <div className="sm:hidden flex items-center justify-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-black/40 border border-white/5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime,#CCFF00)] animate-pulse" />
        <span className="font-mono text-[10px] tracking-wider text-[var(--color-lime,#CCFF00)] font-bold">
          STEP {String(currentStep).padStart(2, '0')} OF {String(steps.length).padStart(2, '0')}
        </span>
        <span className="text-white/40 text-[10px]">|</span>
        <span className="font-heading text-xs uppercase tracking-wider text-white font-bold truncate">
          {activeStep?.label}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;
          const formattedNumber = String(step.number).padStart(2, '0');

          return (
            <React.Fragment key={step.number}>
              {/* Step Node & Label */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={clsx(
                    'flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all duration-300 font-mono text-[11px] sm:text-sm shrink-0',
                    isCompleted &&
                      'border-[var(--color-lime,#CCFF00)] bg-[var(--color-lime,#CCFF00)]/15 text-[var(--color-lime,#CCFF00)] shadow-[0_0_12px_rgba(204,255,0,0.25)]',
                    isCurrent &&
                      'border-[var(--color-lime,#CCFF00)] bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)] font-bold shadow-[0_0_20px_rgba(204,255,0,0.6)] ring-2 sm:ring-4 ring-[var(--color-lime,#CCFF00)]/20',
                    isUpcoming &&
                      'border-white/10 bg-[var(--color-charcoal,#111111)] text-[var(--color-silver,#999999)]'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{formattedNumber}</span>
                  )}
                </div>

                {/* Step Label (Hidden on small phones to avoid text clipping, visible on sm+) */}
                <span
                  className={clsx(
                    'hidden sm:block mt-2.5 max-w-[120px] text-center font-heading text-xs uppercase tracking-wider transition-colors duration-200 line-clamp-2',
                    isCurrent && 'text-[var(--color-lime,#CCFF00)] font-bold',
                    isCompleted && 'text-white font-medium',
                    isUpcoming && 'text-[var(--color-silver,#999999)]'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line between steps */}
              {idx < steps.length - 1 && (
                <div
                  className="relative -top-0 sm:-top-3.5 mx-1.5 sm:mx-2 flex-1 h-[2px] bg-white/10 overflow-hidden"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: currentStep > step.number ? 1 : 0,
                    }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

export default ProgressBar;
