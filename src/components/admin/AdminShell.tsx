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
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Registrations',
    href: '/admin/registrations',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Check-In',
    href: '/admin/check-in',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Announcements',
    href: '/admin/announcements',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    label: 'Export Data',
    href: '/admin/export',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                  PUBG COMMAND
                </span>
              </div>
              <p className="font-mono text-[10px] text-[var(--color-silver,#999999)] uppercase tracking-wider mt-0.5">
                ETHIOPIA ASSEMBLY &bull; ADMIN
              </p>
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

            <span className="font-mono text-xs text-[var(--color-silver,#999999)] uppercase hidden sm:inline">
              ETHIOPIA GAMING SECTOR // OPERATIONAL DASHBOARD
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
