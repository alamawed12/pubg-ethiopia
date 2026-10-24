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

// Tactical High-Impact SVG Icons
function OverviewIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Tactical Assembly Command Shield */}
      <path d="M12 2L3 6.5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11v-6L12 2z" />
      <circle cx="12" cy="11" r="3" />
      <path d="M7 19c.7-2.3 2.6-3.8 5-3.8s4.3 1.5 5 3.8" />
    </svg>
  );
}

function VenueDateIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Tactical Drop Location Beacon Pin with Crosshair radar */}
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
      <line x1="12" y1="2" x2="12" y2="4" strokeWidth="2" />
      <line x1="2" y1="10" x2="4" y2="10" strokeWidth="2" />
      <line x1="20" y1="10" x2="22" y2="10" strokeWidth="2" />
    </svg>
  );
}

function TournamentIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Esports Championship Trophy with center star */}
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" />
      <path d="M12 16v3" />
      <path d="M8 21h8" />
      <polygon
        points="12 6.5 13.2 8.5 15.5 8.7 13.8 10.2 14.3 12.5 12 11.2 9.7 12.5 10.2 10.2 8.5 8.7 10.8 8.5 12 6.5"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function AttendanceIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Tactical Squad with Corner Reticle Brackets */}
      <path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1" />
      <circle cx="10" cy="8" r="3" />
      <path d="M19 19v-1a3 3 0 0 0-2-2.8" />
      <path d="M15 5.2a3 3 0 0 1 0 5.6" />
      <path d="M2 5V2h3" stroke="#CCFF00" />
      <path d="M19 2h3v3" stroke="#CCFF00" />
      <path d="M22 19v3h-3" stroke="#CCFF00" />
      <path d="M5 22H2v-3" stroke="#CCFF00" />
    </svg>
  );
}

const panels = [
  {
    title: 'EVENT OVERVIEW',
    content:
      'The PUBG MOBILE Community Assembly is a gathering for Ethiopian players, teams, content creators, and community organizers. Expect an esports tournament, community meetups, networking, and the chance to shape the future of PUBG MOBILE in Ethiopia.',
    Icon: OverviewIcon,
  },
  {
    title: 'VENUE & DATE',
    content: 'Details will be announced on our community channels. Stay tuned for updates.',
    Icon: VenueDateIcon,
    tba: true,
  },
  {
    title: 'TOURNAMENT',
    content:
      'An esports tournament is planned as part of the assembly. Format, rules, and eligibility details will be announced. Open to registered participants.',
    Icon: TournamentIcon,
  },
];

export function EventDashboard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [regCount, setRegCount] = useState<number>(0);
  const [heroDisplay, setHeroDisplay] = useState<string>('100-1000');

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setAnnouncements(d.data?.slice(0, 3) || []))
      .catch(() => {});

    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : { totalRegistrations: 0 }))
      .then((d) => setRegCount(d.totalRegistrations || 0))
      .catch(() => {});

    // Dynamically fetch configured attendance display from Admin Settings
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.heroAttendeesDisplay) {
          setHeroDisplay(d.heroAttendeesDisplay);
        } else if (d?.maxCapacity) {
          setHeroDisplay(`${d.maxCapacity}+`);
        }
      })
      .catch(() => {});
  }, []);

  function renderAttendanceCounter(display: string) {
    const trimmed = (display || '100-1000').trim();

    // Pattern 1: Range like "100-1000", "200–300", "500 - 1000"
    const rangeMatch = trimmed.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (rangeMatch) {
      const min = rangeMatch[1];
      const max = parseInt(rangeMatch[2], 10);
      return (
        <AnimatedCounter
          value={max}
          prefix={`${min}–`}
          suffix=""
          label="Expected Attendees"
        />
      );
    }

    // Pattern 2: Suffix plus like "300+", "1000+"
    const plusMatch = trimmed.match(/^(\d+)\+$/);
    if (plusMatch) {
      const num = parseInt(plusMatch[1], 10);
      return (
        <AnimatedCounter
          value={num}
          prefix=""
          suffix="+"
          label="Expected Attendees"
        />
      );
    }

    // Pattern 3: Pure integer like "500"
    const numMatch = trimmed.match(/^(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      return (
        <AnimatedCounter
          value={num}
          label="Expected Attendees"
        />
      );
    }

    // Pattern 4: Custom string entered by admin
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-[#CCFF00]">
          {trimmed}
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#999999] mt-2">
          Expected Attendees
        </span>
      </div>
    );
  }

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
              className="relative p-6 rounded-xl border group hover:border-[#CCFF00]/30 transition-colors"
              style={{
                backgroundColor: '#111111',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(204, 255, 0, 0.08)',
                    borderColor: 'rgba(204, 255, 0, 0.25)',
                    color: '#CCFF00',
                    boxShadow: '0 0 18px rgba(204, 255, 0, 0.08)',
                  }}
                >
                  <panel.Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg tracking-wider mb-2 font-bold"
                    style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
                  >
                    {panel.title}
                  </h3>
                  {panel.tba && (
                    <div
                      className="inline-block px-3 py-1 rounded text-xs tracking-widest mb-3 font-semibold"
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
            className="relative p-6 rounded-xl border flex flex-col items-center justify-center text-center group hover:border-[#CCFF00]/30 transition-colors"
            style={{
              backgroundColor: '#111111',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundColor: 'rgba(204, 255, 0, 0.08)',
                borderColor: 'rgba(204, 255, 0, 0.25)',
                color: '#CCFF00',
                boxShadow: '0 0 18px rgba(204, 255, 0, 0.08)',
              }}
            >
              <AttendanceIcon className="w-6 h-6" />
            </div>
            <h3
              className="text-lg tracking-wider mb-4 font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
            >
              ATTENDANCE TARGET
            </h3>
            {renderAttendanceCounter(heroDisplay)}
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
              className="text-sm tracking-[0.3em] uppercase font-bold"
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
            className="inline-block px-8 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-lg hover:brightness-110"
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
