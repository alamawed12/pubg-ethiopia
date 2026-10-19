'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type SectionHeadingSize = 'lg' | 'xl' | '2xl';
export type SectionHeadingAlign = 'left' | 'center';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  size?: SectionHeadingSize;
  className?: string;
  align?: SectionHeadingAlign;
  tag?: string; // Optional tactical tag above title (e.g. "PHASE 01", "COMMUNITY")
}

export function SectionHeading({
  title,
  subtitle,
  size = 'xl',
  className,
  align = 'center',
  tag,
}: SectionHeadingProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
  }, []);

  const words = title.trim().split(/\s+/);

  const sizeStyles: Record<SectionHeadingSize, string> = {
    lg: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    xl: 'text-3xl sm:text-4xl md:text-5xl font-extrabold',
    '2xl': 'text-4xl sm:text-5xl md:text-6xl font-black tracking-tight',
  };

  const alignStyles: Record<SectionHeadingAlign, { container: string; title: string; subtitle: string }> = {
    left: {
      container: 'items-start text-left',
      title: 'justify-start',
      subtitle: 'mr-auto',
    },
    center: {
      container: 'items-center text-center mx-auto',
      title: 'justify-center',
      subtitle: 'mx-auto',
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(3px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay: reducedMotion ? 0 : words.length * 0.07 + 0.12,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className={clsx('flex flex-col', alignStyles[align].container, className)}>
      {/* Tactical Tag / Pre-heading */}
      {tag && (
        <div className="mb-2.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
          <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-lime,#CCFF00)]">
            {tag}
          </span>
        </div>
      )}

      {/* Word-by-word reveal Heading */}
      <motion.h2
        variants={reducedMotion ? undefined : containerVariants}
        initial={reducedMotion ? false : 'hidden'}
        whileInView={reducedMotion ? undefined : 'visible'}
        viewport={{ once: true, amount: 0.3 }}
        className={clsx(
          'flex flex-wrap font-heading uppercase tracking-wider text-white',
          sizeStyles[size],
          alignStyles[align].title
        )}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={reducedMotion ? undefined : wordVariants}
            className="mr-2.5 sm:mr-3 inline-block"
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>

      {/* Subtitle with delayed fade-in */}
      {subtitle && (
        <motion.p
          variants={reducedMotion ? undefined : subtitleVariants}
          initial={reducedMotion ? false : 'hidden'}
          whileInView={reducedMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.3 }}
          className={clsx(
            'mt-3.5 max-w-2xl font-body text-sm sm:text-base leading-relaxed text-[var(--color-silver,#999999)]',
            alignStyles[align].subtitle
          )}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default SectionHeading;
