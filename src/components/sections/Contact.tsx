'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSoundContext } from '@/components/sound/SoundManager';

function TelegramLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#24A1DE" />
      <path
        d="M18.37 6.63L4.78 11.87C3.85 12.24 3.86 12.76 4.61 12.99L8.09 14.08L16.14 9C16.52 8.77 16.87 8.89 16.58 9.15L10.05 15.04H10.04L10.05 15.05L9.81 18.61C10.16 18.61 10.31 18.45 10.51 18.26L12.19 16.63L15.68 19.21C16.32 19.56 16.78 19.38 16.94 18.61L19.23 7.82C19.46 6.9 18.88 6.48 18.37 6.63Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function DiscordLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const communityChannels = [
  {
    name: 'TELEGRAM SUPPORT TEAM',
    handle: '@pubgmethsupport',
    href: 'https://t.me/pubgmethsupport',
    icon: <TelegramLogo className="w-7 h-7 shrink-0" />,
    badge: 'SUPPORT',
    badgeColor: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  },
  {
    name: 'DISCORD SERVER',
    handle: 'discord.gg/73xvuBch',
    href: 'https://discord.gg/73xvuBch',
    icon: <DiscordLogo className="w-7 h-7 shrink-0" />,
    badge: 'COMMUNITY',
    badgeColor: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/30',
  },
  {
    name: 'OFFICIAL TELEGRAM CHANNEL',
    handle: '@pubgm_eth',
    href: 'https://t.me/pubgm_eth',
    icon: <TelegramLogo className="w-7 h-7 shrink-0" />,
    badge: 'OFFICIAL',
    badgeColor: 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30',
  },
];

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { playSound } = useSoundContext();

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
              Join our channels to stay updated on event announcements, gathering details, and
              connect with other Ethiopian PUBG MOBILE players.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#999999' }}>
              Whether you&apos;re a competitive player, a casual gamer, a content creator, or
              someone who wants to help organize — there&apos;s a place for you here.
            </p>
          </motion.div>

          {/* Right: Social Channels */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {communityChannels.map((channel, i) => (
              <motion.a
                key={channel.name}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 group cursor-pointer"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  playSound('hover');
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(204,255,0,0.4)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(204,255,0,0.04)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(204,255,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a1a';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Real Brand Logo */}
                <div className="shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {channel.icon}
                </div>

                {/* Channel Name & Subtext */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-base tracking-wider uppercase transition-colors duration-300 font-bold group-hover:text-white"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: '#eeeeee',
                      }}
                    >
                      {channel.name}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded border font-mono text-[9px] uppercase font-bold ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#777777] group-hover:text-[#aaaaaa] transition-colors">
                    {channel.handle}
                  </span>
                </div>

                {/* Arrow */}
                <span className="ml-auto text-lg text-[#CCFF00] transition-transform duration-300 group-hover:translate-x-1.5">
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
