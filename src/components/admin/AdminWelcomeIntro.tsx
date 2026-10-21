'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminWelcomeIntro() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);

  const handleDismiss = useCallback(() => {
    if (session?.user?.email) {
      sessionStorage.setItem(`pmca_intro_seen_${session.user.email}`, 'true');
    }
    setVisible(false);
  }, [session?.user?.email]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const storageKey = `pmca_intro_seen_${session.user.email}`;
    const alreadySeen = sessionStorage.getItem(storageKey);

    if (!alreadySeen) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [status, session?.user?.email, handleDismiss]);

  if (!visible || !session?.user) return null;

  const userEmail = session.user.email || '';
  const isScanner = session.user.role === 'scanner' || userEmail.includes('scanner');
  const title = isScanner ? 'Welcome Scanner' : 'Welcome Head Admin';
  const subtitle = isScanner
    ? 'GATE ADMISSION SCANNER PORTAL ACTIVE • TICKET VALIDATION TERMINAL READY'
    : 'PMCA ETHIOPIA COMMAND CENTER ACCESS GRANTED • FULL ADMINISTRATIVE PRIVILEGES ACTIVE';
  const roleCode = isScanner ? 'STAFF • TICKET SCANNER' : 'HQ COMMAND • LEVEL 01 ROOT';
  const primaryColor = isScanner ? '#f59e0b' : '#CCFF00';
  const glowShadow = isScanner
    ? '0 0 30px rgba(245, 158, 11, 0.4)'
    : '0 0 30px rgba(204, 255, 0, 0.45)';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]/95 backdrop-blur-md text-white select-none overflow-hidden"
          onClick={handleDismiss}
        >
          {/* Tactical scan grid & pulse lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div
            className="absolute inset-x-0 h-[2px] pointer-events-none animate-pulse"
            style={{
              backgroundColor: primaryColor,
              top: '50%',
              boxShadow: glowShadow,
              opacity: 0.35,
            }}
          />

          {/* Animated Card Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-lg w-full mx-4 p-5 sm:p-8 rounded-2xl border text-center flex flex-col items-center shadow-2xl"
            style={{
              backgroundColor: '#0d0d0d',
              borderColor: `${primaryColor}40`,
              boxShadow: glowShadow,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* PUBG Mobile Community Assembly Logo */}
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              src="/images/community-assembly-logo.png"
              alt="PUBG Mobile Community Assembly Ethiopia"
              className="h-14 sm:h-16 w-auto object-contain mb-3 sm:mb-4 filter drop-shadow-[0_0_20px_rgba(204,255,0,0.45)]"
            />

            {/* Role Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="px-2.5 sm:px-3 py-1 rounded-full font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest mb-3 border max-w-full truncate"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}60`,
                color: primaryColor,
              }}
            >
              [ {roleCode} ]
            </motion.div>

            {/* Main Welcome Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2 font-heading"
              style={{
                color: primaryColor,
                textShadow: glowShadow,
              }}
            >
              {title}
            </motion.h1>

            {/* User Email */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              className="font-mono text-xs text-white/80 mb-4"
            >
              {userEmail}
            </motion.p>

            {/* Subtitle / Terminal Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="font-mono text-[11px] leading-relaxed text-[#999999] max-w-sm mb-6"
            >
              {subtitle}
            </motion.p>

            {/* Auto-dismiss progress bar */}
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-6">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.2, ease: 'linear' }}
                className="h-full"
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            {/* Enter Button */}
            <button
              onClick={handleDismiss}
              className="px-6 py-2 rounded-lg font-heading font-black text-xs uppercase tracking-widest cursor-pointer transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: primaryColor,
                color: '#050505',
              }}
            >
              ENTER DASHBOARD →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdminWelcomeIntro;
