'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegistrationActionsProps {
  id: string;
  currentStatus: string;
}

export function RegistrationActions({ id, currentStatus }: RegistrationActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    setLoadingAction(newStatus);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error updating status');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 font-mono text-xs">
      {/* Quick Approve */}
      {currentStatus !== 'CONFIRMED' && currentStatus !== 'CHECKED_IN' && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => updateStatus('CONFIRMED')}
          title="Approve / Confirm"
          className="p-1.5 rounded-sm bg-emerald-950/60 hover:bg-emerald-800/80 border border-emerald-500/30 text-emerald-400 transition-colors disabled:opacity-50"
        >
          {loadingAction === 'CONFIRMED' ? (
            <span className="w-3.5 h-3.5 block border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}

      {/* Quick Waitlist */}
      {currentStatus !== 'WAITLISTED' && currentStatus !== 'CHECKED_IN' && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => updateStatus('WAITLISTED')}
          title="Waitlist"
          className="p-1.5 rounded-sm bg-sky-950/60 hover:bg-sky-800/80 border border-sky-500/30 text-sky-400 transition-colors disabled:opacity-50"
        >
          {loadingAction === 'WAITLISTED' ? (
            <span className="w-3.5 h-3.5 block border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      )}

      {/* Quick Reject */}
      {currentStatus !== 'REJECTED' && currentStatus !== 'CHECKED_IN' && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => updateStatus('REJECTED')}
          title="Reject"
          className="p-1.5 rounded-sm bg-red-950/60 hover:bg-red-800/80 border border-red-500/30 text-red-400 transition-colors disabled:opacity-50"
        >
          {loadingAction === 'REJECTED' ? (
            <span className="w-3.5 h-3.5 block border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      )}

      {/* View Details Link */}
      <Link
        href={`/admin/registrations/${id}`}
        className="px-2 py-1 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--color-lime,#CCFF00)] transition-colors ml-1"
      >
        View
      </Link>
    </div>
  );
}

export default RegistrationActions;
