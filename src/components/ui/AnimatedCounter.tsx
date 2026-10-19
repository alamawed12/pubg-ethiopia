'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import clsx from 'clsx';

export interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // Duration in seconds or milliseconds (default 2s)
  label?: string;
  className?: string;
  decimals?: number;
}

// Exponential ease-out function
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  label,
  className,
  decimals,
}: AnimatedCounterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const [currentValue, setCurrentValue] = useState(0);

  // Auto-detect decimals if not provided
  const decimalCount =
    decimals !== undefined
      ? decimals
      : value % 1 !== 0
      ? String(value).split('.')[1]?.length || 1
      : 0;

  useEffect(() => {
    if (!isInView) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentValue(value);
      return;
    }

    const durationMs = duration <= 20 ? duration * 1000 : duration;
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutExpo(progress);

      const nextVal = easedProgress * value;
      setCurrentValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, value, duration]);

  // Format the numerical value
  const formattedNumber =
    decimalCount > 0
      ? currentValue.toFixed(decimalCount)
      : Math.floor(currentValue).toLocaleString('en-US');

  return (
    <div
      ref={containerRef}
      className={clsx('flex flex-col items-center justify-center text-center', className)}
      aria-label={`${prefix}${value}${suffix}${label ? ` ${label}` : ''}`}
    >
      <div className="flex items-baseline font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white">
        {prefix && (
          <span className="text-[var(--color-lime,#CCFF00)] mr-1 text-3xl sm:text-4xl lg:text-5xl">
            {prefix}
          </span>
        )}
        <span className="tabular-nums" aria-live="polite">
          {formattedNumber}
        </span>
        {suffix && (
          <span className="text-[var(--color-lime,#CCFF00)] ml-1 text-3xl sm:text-4xl lg:text-5xl">
            {suffix}
          </span>
        )}
      </div>

      {label && (
        <p className="mt-2 font-mono text-xs sm:text-sm uppercase tracking-widest text-[var(--color-silver,#999999)]">
          {label}
        </p>
      )}
    </div>
  );
}

export default AnimatedCounter;
