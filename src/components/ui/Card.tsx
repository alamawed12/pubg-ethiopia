'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import clsx from 'clsx';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowBorder?: boolean;
  padding?: CardPadding;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function Card({
  children,
  className,
  glowBorder = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [canTilt, setCanTilt] = useState(false);

  // Check for hover capability and reduced motion preferences
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setCanTilt(!prefersReducedMotion && hasFinePointer);
  }, []);

  // Motion values for 3D tilt
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 220, mass: 0.1 };
  const springRotX = useSpring(rotX, springConfig);
  const springRotY = useSpring(rotY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt) return;
    const node = cardRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Maximum tilt angles: ±7 degrees
    const maxTilt = 7;
    const tiltX = -((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    rotX.set(tiltX);
    rotY.set(tiltY);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  const paddingStyles: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="relative block w-full"
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={canTilt ? { y: -4 } : undefined}
        style={{
          rotateX: springRotX,
          rotateY: springRotY,
          transformStyle: 'preserve-3d',
        }}
        className={clsx(
          'relative w-full rounded-sm transition-[border-color,box-shadow] duration-500 ease-out',
          'bg-[var(--color-graphite,#1a1a1a)] text-white',
          'border border-white/10 hover:border-[var(--color-lime,#CCFF00)]/30',
          'hover:shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(204,255,0,0.08)]',
          glowBorder && 'animated-border',
          onClick && 'cursor-pointer',
          paddingStyles[padding],
          className
        )}
      >
        {/* Animated border glow sweep if enabled */}
        {glowBorder && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-sm opacity-50 blur-sm bg-gradient-to-r from-[var(--color-lime,#CCFF00)]/30 via-transparent to-[var(--color-lime,#CCFF00)]/30 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Subtle tactical corner accents */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[var(--color-lime,#CCFF00)]/40 transition-colors duration-300 group-hover:border-[var(--color-lime,#CCFF00)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[var(--color-lime,#CCFF00)]/40 transition-colors duration-300 group-hover:border-[var(--color-lime,#CCFF00)]"
        />

        {/* Card Content with 3D depth preservation */}
        <div style={{ transform: 'translateZ(10px)' }}>{children}</div>
      </motion.div>
    </div>
  );
}

export default Card;
