'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const faqs = [
  {
    q: 'What is the PUBG MOBILE Community Assembly?',
    a: 'An independently organized gathering of Ethiopia\'s PUBG MOBILE community. A space for players, teams, content creators, and organizers to connect, compete, and build together.',
  },
  {
    q: 'Is this an official PUBG MOBILE event?',
    a: 'No. This is an independent community-organized event. It is not officially operated by or affiliated with PUBG MOBILE, Tencent, or Krafton, Inc.',
  },
  {
    q: 'How do I register?',
    a: 'Click the Register button on this website and complete the three-step registration process. You\'ll receive a unique reference number and digital event pass.',
  },
  {
    q: 'Is there a tournament?',
    a: 'Yes, an esports tournament is planned as part of the assembly. Format, rules, and eligibility details will be announced.',
  },
  {
    q: 'What is the attendance capacity?',
    a: 'We are planning for 200–300 attendees. Registration may close when capacity is reached.',
  },
  {
    q: 'Where and when is the event?',
    a: 'The event will be held in Addis Ababa, Ethiopia. The specific venue and date will be announced on our community channels.',
  },
  {
    q: 'How is my data handled?',
    a: 'Your registration data is used solely for event management. We do not share your personal information with third parties. See our Privacy Policy for details.',
  },
  {
    q: 'Can I cancel my registration?',
    a: 'This is a free community event. You can request cancellation of your registration by contacting the organizing team.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-32 px-6" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto relative z-10">
        <SectionHeading
          title="FREQUENTLY ASKED QUESTIONS"
          size="xl"
          align="center"
        />

        <div className="mt-16 space-y-0">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group cursor-pointer"
              >
                <span
                  className="text-base pr-8 transition-colors duration-300"
                  style={{ color: openIndex === i ? '#CCFF00' : '#cccccc' }}
                >
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl flex-shrink-0 w-6 h-6 flex items-center justify-center"
                  style={{ color: '#CCFF00' }}
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p
                      className="pb-6 text-sm leading-relaxed"
                      style={{ color: '#999999' }}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
