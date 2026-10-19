'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const cards = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="16" r="7" />
        <path d="M10 40c0-7.732 6.268-14 14-14s14 6.268 14 14" />
        <circle cx="38" cy="14" r="5" opacity="0.5" />
        <path d="M43 36c0-4.5-2.239-8.5-5.66-10.9" opacity="0.5" />
        <circle cx="10" cy="14" r="5" opacity="0.5" />
        <path d="M5 36c0-4.5 2.239-8.5 5.66-10.9" opacity="0.5" />
      </svg>
    ),
    title: 'UNITE PLAYERS',
    description:
      "Bringing Ethiopia's PUBG MOBILE community together in one place. Players from across the nation, connecting face to face.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="24" r="4" />
        <circle cx="10" cy="12" r="3" />
        <circle cx="38" cy="12" r="3" />
        <circle cx="10" cy="36" r="3" />
        <circle cx="38" cy="36" r="3" />
        <line x1="13" y1="13" x2="21" y2="22" />
        <line x1="35" y1="13" x2="27" y2="22" />
        <line x1="13" y1="35" x2="21" y2="26" />
        <line x1="35" y1="35" x2="27" y2="26" />
      </svg>
    ),
    title: 'BUILD CONNECTIONS',
    description:
      'Linking players, teams, organizers, and content creators. Strengthening the bonds that make our community thrive.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 40V28l8-8 8 6 8-12 8-6v32" />
        <line x1="8" y1="40" x2="40" y2="40" />
        <circle cx="16" cy="20" r="2" fill="currentColor" />
        <circle cx="24" cy="26" r="2" fill="currentColor" />
        <circle cx="32" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
    title: 'GROW THE ECOSYSTEM',
    description:
      'Creating pathways for competition, collaboration, and a more organized, sustainable gaming community in Ethiopia.',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export function EventStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="assembly"
      className="relative py-32 px-6 overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Subtle background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(204,255,0,0.03), transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <SectionHeading
          title="ABOUT THE ASSEMBLY"
          subtitle="The PUBG MOBILE COMMUNITY ASSEMBLY is designed to bring players, teams, and esports community members together to discuss opportunities, strengthen relationships, encourage fair competition, and contribute to the growth of Ethiopia’s gaming community."
          size="2xl"
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative group"
            >
              <div
                className="relative p-8 rounded-xl border transition-all duration-500 h-full"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(204,255,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none animated-border" />

                {/* Icon */}
                <div className="mb-6" style={{ color: '#CCFF00' }}>
                  {card.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-xl tracking-wider mb-4"
                  style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-relaxed" style={{ color: '#999999' }}>
                  {card.description}
                </p>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                  <div
                    className="absolute top-0 right-0 w-full h-[1px]"
                    style={{ backgroundColor: 'rgba(204,255,0,0.2)' }}
                  />
                  <div
                    className="absolute top-0 right-0 h-full w-[1px]"
                    style={{ backgroundColor: 'rgba(204,255,0,0.2)' }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pull quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-center"
        >
          <p
            className="text-2xl md:text-3xl italic max-w-3xl mx-auto"
            style={{ color: 'rgba(204,255,0,0.6)', fontFamily: 'var(--font-heading)' }}
          >
            &ldquo;This is where the future of Ethiopian esports begins.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
