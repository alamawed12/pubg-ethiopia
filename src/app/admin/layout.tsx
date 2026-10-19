'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/registrations', label: 'Registrations', icon: '◉' },
  { href: '/admin/check-in', label: 'Check-In', icon: '⬡' },
  { href: '/admin/announcements', label: 'Announcements', icon: '◆' },
  { href: '/admin/export', label: 'Export', icon: '↓' },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 border-r hidden md:flex flex-col"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/" className="block">
            <span
              className="text-lg tracking-wider"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              PUBG·M // ETH
            </span>
          </Link>
          <span
            className="text-xs tracking-[0.2em] uppercase block mt-1"
            style={{ fontFamily: 'var(--font-mono)', color: '#666666' }}
          >
            ADMIN PANEL
          </span>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-200"
              style={{
                color: pathname === item.href ? '#CCFF00' : '#999999',
                backgroundColor: pathname === item.href ? 'rgba(204,255,0,0.05)' : 'transparent',
                borderRight: pathname === item.href ? '2px solid #CCFF00' : '2px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs truncate mb-2" style={{ color: '#999999' }}>
            {session?.user?.email}
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-xs uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:text-white"
            style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <span className="text-sm" style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}>
          ADMIN
        </span>
        <div className="flex gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs px-2 py-1 rounded"
              style={{
                color: pathname === item.href ? '#CCFF00' : '#999999',
                backgroundColor: pathname === item.href ? 'rgba(204,255,0,0.1)' : 'transparent',
              }}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 md:pt-10 pt-16 overflow-auto">
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
