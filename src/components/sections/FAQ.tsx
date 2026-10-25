'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const faqs = [
  {
    id: '01',
    q: 'What is the PUBG MOBILE Community Assembly?',
    a: 'It is a community-focused gathering bringing together PUBG MOBILE players, squads, content creators, and gaming enthusiasts in Ethiopia for community networking and collaborative activities.',
  },
  {
    id: '02',
    q: 'How can I register for the event?',
    a: 'Complete the online registration form with your full name, PUBG MOBILE UID, in-game name, and required contact details. Follow the instructions to submit your registration.',
  },
  {
    id: '03',
    q: 'Why do I need to provide my PUBG MOBILE UID?',
    a: 'Your UID helps organizers identify your in-game account, manage community attendance, and verify your player details when necessary.',
  },
  {
    id: '04',
    q: 'Do I need to verify my identity or face?',
    a: 'No face photo or facial scan is required. To protect attendee and VIP privacy, no facial biometric photos are collected. Standard player registration details and National ID verification are used exclusively for secure event admission.',
  },
  {
    id: '05',
    q: 'When and where will the event take place?',
    a: 'The event is planned for Addis Ababa, Ethiopia. The exact date, venue, and schedule will be announced through the official event channels once confirmed.',
  },
  {
    id: '06',
    q: 'What activities are planned for the event?',
    a: 'The event is an official community gathering featuring player meetups, networking sessions, community showcases, content creator spotlights, and discussions on growing the PUBG MOBILE community in Ethiopia.',
  },
  {
    id: '07',
    q: 'Does registration guarantee my entry?',
    a: 'No. Submitting the form does not automatically guarantee entry. Your place is confirmed only when the organizers approve your registration and provide confirmation.',
  },
  {
    id: '08',
    q: 'How can I contact the organizers or get updates?',
    a: 'Follow the official event communication channels linked on this website for announcements about registration, gathering details, venue information, and event updates.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-28 sm:py-36 px-4 sm:px-6 md:px-8 bg-[#0a0a0a]">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(204,255,0,0.04), transparent 70%)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <SectionHeading
          title="FREQUENTLY ASKED QUESTIONS"
          subtitle="Essential details regarding registrations, event format, and assembly participation."
          size="xl"
          align="center"
          tag="OFFICIAL INTELLIGENCE"
        />

        {/* FAQ Accordion List */}
        <div className="mt-14 space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#CCFF00]/40 bg-[#141414] shadow-[0_0_25px_rgba(204,255,0,0.08)]'
                    : 'border-white/10 bg-[#111111]/90 hover:border-white/20 hover:bg-[#141414]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(i)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left group cursor-pointer gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                    <span
                      className={`font-sans text-xs font-bold px-2.5 py-1 rounded-md transition-colors shrink-0 ${
                        isOpen
                          ? 'bg-[#CCFF00] text-black shadow-[0_0_10px_rgba(204,255,0,0.5)]'
                          : 'bg-white/5 text-[#CCFF00] border border-[#CCFF00]/25'
                      }`}
                    >
                      {faq.id}
                    </span>
                    <h3
                      className={`font-sans font-semibold text-base sm:text-lg transition-colors leading-snug tracking-tight ${
                        isOpen ? 'text-[#CCFF00]' : 'text-white group-hover:text-neutral-200'
                      }`}
                    >
                      {faq.q}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors bg-white/5 border-white/10 group-hover:border-[#CCFF00]/40"
                  >
                    <svg
                      className="w-4 h-4 text-[#CCFF00]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/5">
                        <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Official PUBGM HQ Governance Footer Note */}
        <div className="mt-10 p-4 rounded-xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 flex items-center gap-3 text-center sm:text-left flex-col sm:flex-row justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shrink-0" />
            <p className="font-sans text-xs text-neutral-300 leading-normal">
              Official PUBG MOBILE Assembly FAQ • Controlled and operated directly under <strong className="text-white font-semibold">PUBG MOBILE HQ</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <a
              href="https://t.me/pubgmethsupport"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs font-bold text-[#CCFF00] hover:underline shrink-0 uppercase tracking-wider"
            >
              NEED HELP? ASK SUPPORT TEAM →
            </a>
            <span className="text-white/20 hidden sm:inline">•</span>
            <a
              href="https://t.me/pubgm_eth"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-xs font-bold text-neutral-300 hover:text-white hover:underline shrink-0 uppercase tracking-wider"
            >
              TELEGRAM CHANNEL →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
