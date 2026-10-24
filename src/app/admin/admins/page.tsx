'use client';

import React from 'react';
import { AdminManagementSection } from '@/components/admin/AdminManagementSection';

export default function AdminTeamPage() {
  return (
    <div className="max-w-5xl space-y-8 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase font-bold">
            HQ SECURITY &amp; ACCESS CONTROL
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl tracking-wider uppercase mb-2 font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ADMIN TEAM &amp; STAFF CREDENTIALS
        </h1>
        <p className="text-sm text-[#999999] leading-relaxed">
          Head Administrator control panel to register and manage staff accounts. Registered admins can log in at <strong className="text-white">/admin/login</strong> with their assigned email and password. Sub-admins are strictly prohibited from creating accounts.
        </p>
      </div>

      <AdminManagementSection />
    </div>
  );
}
