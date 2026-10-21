'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const panels = [
  {
    title: 'EVENT OVERVIEW',
    content:
      'The PUBG MOBILE Community Assembly is a gathering for Ethiopian players, teams, content creators, and community organizers. Expect an esports tournament, community meetups, networking, and the chance to shape the future of PUBG MOBILE in Ethiopia.',
    icon: '◈',
  },
  {
    title: 'VENUE & DATE',
    content: 'Details will be announced on our community channels. Stay tuned for updates.',
    icon: '◉',
    tba: true,
  },
  {
    title: 'TOURNAMENT',
    content:
      'An esports tournament is planned as part of the assembly. Format, rules, and eligibility details will be announced. Open to registered participants.',
    icon: '⬡',
  },
];

export function EventDashboard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [regCount, setRegCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setAnnouncements(d.data?.slice(0, 3) || []))
      .catch(() => {});

    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : { totalRegistrations: 0 }))
      .then((d) => setRegCount(d.totalRegistrations || 0))
      .catch(() => {});
  }, []);

  return (
    <section
      id="tournament"
      className="relative py-32 px-6"
      style={{ backgroundColor: '#0d1a0d' }}
    >
      <div className="absolute inset-0 tactical-grid pointer-events-none opacity-30" />

      <div className="max-w-6xl mx-auto relative z-10" ref={ref}>
        <SectionHeading
          title="EVENT INTELLIGENCE"
          subtitle="Everything you need to know about the assembly"
          size="2xl"
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
          {panels.map((panel, i) => (
            <motion.div
              key={panel.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative p-6 rounded-xl border"
              style={{
                backgroundColor: '#111111',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl" style={{ color: '#CCFF00' }}>
                  {panel.icon}
                </span>
                <div>
                  <h3
                    className="text-lg tracking-wider mb-3"
                    style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                  >
                    {panel.title}
                  </h3>
                  {panel.tba && (
                    <div
                      className="inline-block px-3 py-1 rounded text-xs tracking-widest mb-3"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'rgba(204,255,0,0.1)',
                        color: '#CCFF00',
                        border: '1px solid rgba(204,255,0,0.2)',
                      }}
                    >
                      TO BE ANNOUNCED
                    </div>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: '#999999' }}>
                    {panel.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Attendance Target Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="relative p-6 rounded-xl border flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor: '#111111',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-2xl mb-2" style={{ color: '#CCFF00' }}>
              ◆
            </span>
            <h3
              className="text-lg tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              ATTENDANCE TARGET
            </h3>
            <AnimatedCounter value={300} prefix="200–" suffix="" label="Expected Attendees" />
          </motion.div>
        </div>

        {/* Registration Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 p-6 rounded-xl border text-center"
          style={{
            backgroundColor: 'rgba(204,255,0,0.03)',
            borderColor: 'rgba(204,255,0,0.15)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#CCFF00', boxShadow: '0 0 10px #CCFF00' }}
            />
            <span
              className="text-sm tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: '#CCFF00' }}
            >
              Registration: OPEN
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: '#999999' }}>
            {regCount > 0
              ? `${regCount} registration${regCount !== 1 ? 's' : ''} received so far.`
              : 'Be among the first to register for the assembly.'}
          </p>
          <a
            href="/register"
            className="inline-block px-8 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: '#CCFF00',
              color: '#050505',
              fontFamily: 'var(--font-heading)',
            }}
          >
            REGISTER NOW
          </a>
        </motion.div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10"
          >
            <h3
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-mono)', color: '#CCFF00' }}
            >
              {'LATEST ANNOUNCEMENTS'}
            </h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <h4 className="text-sm font-medium text-white mb-1">{a.title}</h4>
                  <p className="text-xs" style={{ color: '#999999' }}>
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
