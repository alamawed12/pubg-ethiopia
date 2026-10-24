'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { AdminWelcomeIntro } from '@/components/admin/AdminWelcomeIntro';

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  headOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    shortLabel: 'Stats',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/admin/payments',
    label: 'VIP Payments',
    shortLabel: 'Payments',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/admin/registrations',
    label: 'Registrations',
    shortLabel: 'Players',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/teams',
    label: 'Squads & Teams',
    shortLabel: 'Squads',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/gate-monitor',
    label: 'Gate Monitor',
    shortLabel: 'Live Gate',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    href: '/admin/check-in',
    label: 'Ticket Scanner',
    shortLabel: 'Scanner',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    label: 'VIP & Settings',
    shortLabel: 'Settings',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/admins',
    label: 'Admin Team',
    shortLabel: 'Staff',
    headOnly: true,
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    href: '/admin/announcements',
    label: 'Announcements',
    shortLabel: 'News',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    href: '/admin/export',
    label: 'Export Data',
    shortLabel: 'Export',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const isScannerRole = session?.user?.role === 'scanner';
  const isHeadAdmin =
    session?.user?.role === 'super_admin' ||
    session?.user?.email?.toLowerCase() === 'pmcaheadadmin@pubgmethiopia.et' ||
    session?.user?.email?.toLowerCase() === 'pubgmethiopia.et';

  const visibleNavItems = navItems.filter((i) => {
    if (isScannerRole) return i.href === '/admin/check-in';
    if (i.headOnly && !isHeadAdmin) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] text-white">
      <AdminWelcomeIntro />
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="w-64 flex-shrink-0 border-r hidden md:flex flex-col justify-between"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pubg-mobile-logo.png"
              alt="PUBG Mobile"
              className="h-9 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-sm font-bold tracking-tight text-white uppercase">
                  {isScannerRole ? 'GATE SCANNER' : 'ADMIN HQ'}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-wider ${
                  isScannerRole
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                    : 'bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00]'
                }`}>
                  {isScannerRole ? 'STAFF' : 'HEAD ADMIN'}
                </span>
              </div>
              <p className="font-sans text-[11px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
                {isScannerRole ? 'ADMISSION CHECK-IN PORTAL' : 'PUBG·M ETHIOPIA COMMAND'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans transition-all duration-200 ${
                    isActive
                      ? 'bg-[#CCFF00] text-[#050505] font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className={isActive ? 'text-[#050505]' : 'text-[#CCFF00]'}>{item.icon}</span>
                  <span className="tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <p className="text-xs truncate font-sans text-neutral-400 font-medium mb-3">
            {session?.user?.email || 'pubgmethiopia.et'}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Top Header ─── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/pubg-mobile-logo.png"
            alt="PUBG Mobile"
            className="h-7 w-auto object-contain"
          />
          <span className="font-sans font-bold text-sm tracking-tight text-white uppercase">
            {isScannerRole ? 'GATE SCANNER' : 'ADMIN HQ'}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="px-3 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 font-sans text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
        >
          <span>LOGOUT</span>
        </button>
      </header>

      {/* ─── Mobile Bottom App Bar (Clear Icons + Readable Labels) ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex items-center overflow-x-auto py-1.5 px-2 gap-1 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ backgroundColor: '#0d0d0d', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[54px] ${
                isActive
                  ? 'text-[#CCFF00] font-bold bg-[#CCFF00]/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className={`transition-transform ${isActive ? 'scale-110 text-[#CCFF00]' : 'text-neutral-400'}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-tight mt-0.5 whitespace-nowrap">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ─── Main Content Container ─── */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 pt-16 md:pt-8 pb-20 md:pb-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
