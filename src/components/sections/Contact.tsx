'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const links = [
  { name: 'Telegram Community', href: '#', icon: '✈' },
  { name: 'Discord Server', href: '#', icon: '🎮' },
  { name: 'Email Contact', href: 'mailto:contact@pubg-ethiopia.com', icon: '✉' },
];

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className="relative py-32 px-6" style={{ backgroundColor: '#111111' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(204,255,0,0.02), transparent 60%)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10" ref={ref}>
        <SectionHeading
          title="JOIN THE COMMUNITY"
          subtitle="Connect with fellow players and stay updated"
          size="xl"
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-base leading-relaxed mb-6" style={{ color: '#999999' }}>
              The PUBG MOBILE Community Assembly is built by the community, for the community.
              Join our channels to stay updated on event announcements, tournament details, and
              connect with other Ethiopian PUBG MOBILE players.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#999999' }}>
              Whether you&apos;re a competitive player, a casual gamer, a content creator, or
              someone who wants to help organize — there&apos;s a place for you here.
            </p>
          </motion.div>

          {/* Right: Links */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 group"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(204,255,0,0.3)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(204,255,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a1a';
                }}
              >
                <span className="text-2xl">{link.icon}</span>
                <span
                  className="text-base tracking-wider uppercase transition-colors duration-300"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: '#cccccc',
                  }}
                >
                  {link.name}
                </span>
                <span className="ml-auto text-lg" style={{ color: '#CCFF00' }}>
                  →
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Final Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-20 p-8 sm:p-12 rounded-2xl border border-[var(--color-lime,#CCFF00)]/30 bg-black/60 text-center shadow-[0_0_40px_rgba(204,255,0,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#CCFF00] shadow-[0_0_15px_#CCFF00]" />
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            BE PART OF THE COMMUNITY.
          </h3>
          <p className="text-[#cccccc] text-base sm:text-lg max-w-xl mx-auto mb-8 font-body">
            Register your interest and join the gathering of Ethiopia&rsquo;s PUBG MOBILE community.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-[#050505] font-heading font-black text-base sm:text-lg tracking-wider uppercase rounded transition-all duration-300 shadow-[0_0_25px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>REGISTER FOR THE EVENT</span>
            <span>→</span>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12 text-sm"
          style={{ color: '#666666' }}
        >
          Have questions? Reach out to the organizing team through any of our community channels.
        </motion.p>
      </div>
    </section>
  );
}
