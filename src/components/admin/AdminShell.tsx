'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

interface AdminShellProps {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
  adminRole: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      /* Performance analytics bar chart icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Registrations',
    href: '/admin/registrations',
    icon: (
      /* Registered players / attendees user list icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Ticket Scanner',
    href: '/admin/check-in',
    icon: (
      /* Optical camera ticket scanner / check-in icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Announcements',
    href: '/admin/announcements',
    icon: (
      /* Megaphone broadcast announcement icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: 'VIP & Settings',
    href: '/admin/settings',
    icon: (
      /* System settings gear icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Export Data',
    href: '/admin/export',
    icon: (
      /* File spreadsheet download icon */
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export function AdminShell({ children, adminName, adminEmail, adminRole }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-abyss,#0a0a0a)] text-white flex">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-charcoal,#111111)] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Brand Header with PUBG Mobile Logo */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pubg-mobile-logo.png"
                alt="PUBG Mobile"
                className="h-9 w-auto object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-base font-black uppercase tracking-wider text-white">
                    ADMIN HQ
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#CCFF00]/15 border border-[#CCFF00]/30 text-[#CCFF00] font-mono text-[9px] uppercase">
                    OFFICIAL
                  </span>
                </div>
                <p className="font-mono text-[9px] text-[#999999] uppercase tracking-wider mt-0.5">
                  PMCA ETHIOPIA COMMAND
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded text-[var(--color-silver,#999999)] hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-sm font-heading text-sm uppercase tracking-wider transition-all duration-200',
                    isActive
                      ? 'bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)] font-bold shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                      : 'text-[var(--color-silver,#999999)] hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className={clsx(isActive ? 'text-[var(--color-void,#050505)]' : 'text-current')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Admin Identity */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-sm bg-[var(--color-lime,#CCFF00)] text-[var(--color-void,#050505)] font-bold font-heading flex items-center justify-center text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-heading text-sm font-bold text-white truncate uppercase">
                {adminName}
              </p>
              <p className="font-mono text-[10px] text-[var(--color-silver,#999999)] truncate">
                {adminEmail || adminRole.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 font-heading text-xs uppercase tracking-wider transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>DISCONNECT</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-4 sm:px-6 bg-[var(--color-charcoal,#111111)] border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded text-[var(--color-silver,#999999)] hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pubg-mobile-logo.png"
              alt="PUBG Mobile"
              className="h-7 w-auto object-contain lg:hidden"
            />

            <span className="font-mono text-xs text-[var(--color-silver,#999999)] uppercase hidden sm:inline">
              OFFICIAL PUBG MOBILE TEAM // ETHIOPIA COMMAND HEADQUARTERS
            </span>
          </div>

          {/* Quick link & status */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="font-mono text-xs text-[var(--color-lime,#CCFF00)] hover:underline flex items-center gap-1.5"
            >
              <span>Live Site</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[var(--color-silver,#999999)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[var(--color-void,#050505)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminShell;
