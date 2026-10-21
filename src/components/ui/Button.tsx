'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  onClick,
  type = 'button',
  href,
  ariaLabel,
  target,
  rel,
}: ButtonProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [canMagnetic, setCanMagnetic] = useState(false);

  // Check for fine pointer (desktop mouse) and reduced motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setCanMagnetic(!prefersReducedMotion && hasFinePointer);
  }, []);

  // Framer Motion spring physics for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!canMagnetic || disabled || loading) return;
    const node = elementRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.25;
    const deltaY = (e.clientY - centerY) * 0.25;

    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Base tactical button styles
  const baseStyles = clsx(
    'group relative inline-flex items-center justify-center font-heading uppercase tracking-wider rounded-xl',
    'select-none transition-all duration-300 overflow-hidden',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lime,#CCFF00)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-void,#050505)]',
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  );

  // Variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: clsx(
      'bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)] font-bold',
      'border border-transparent',
      'hover:bg-[var(--color-lime-dim,#99cc00)]',
      'shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:shadow-[0_0_25px_rgba(204,255,0,0.55)]',
      'active:bg-[var(--color-lime-dim,#99cc00)]'
    ),
    secondary: clsx(
      'bg-transparent text-[var(--color-lime,#CCFF00)] font-bold',
      'border border-[var(--color-lime,#CCFF00)]/40 hover:border-[var(--color-lime,#CCFF00)]',
      'hover:bg-[var(--color-lime,#CCFF00)]/10',
      'shadow-[0_0_10px_rgba(204,255,0,0.1)] hover:shadow-[0_0_20px_rgba(204,255,0,0.25)]'
    ),
    ghost: clsx(
      'bg-transparent text-[var(--color-silver,#999999)] font-medium',
      'border border-transparent',
      'hover:text-[var(--color-lime,#CCFF00)] hover:bg-white/5',
      'active:bg-white/10'
    ),
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  // Light sweep pseudo-element animation
  const lightSweepElement = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[150%]"
    />
  );

  // Loading spinner
  const spinnerElement = loading && (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  const innerContent = (
    <>
      {lightSweepElement}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {spinnerElement}
        {children}
      </span>
    </>
  );

  // If href is provided, render as Next.js Link wrapped with motion
  if (href && !disabled) {
    return (
      <motion.div
        style={{ x: springX, y: springY }}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
        className="inline-block"
      >
        <Link
          href={href}
          ref={(node) => {
            elementRef.current = node;
          }}
          target={target}
          rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
          aria-label={ariaLabel}
          aria-busy={loading}
        >
          {innerContent}
        </Link>
      </motion.div>
    );
  }

  // Render standard motion.button
  return (
    <motion.button
      ref={(node) => {
        elementRef.current = node;
      }}
      type={type}
      style={{ x: springX, y: springY }}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
    >
      {innerContent}
    </motion.button>
  );
}

export default Button;
