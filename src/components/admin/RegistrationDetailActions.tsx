'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DetailActionsProps {
  registrationId: string;
  referenceId: string;
  currentStatus: string;
}

export function RegistrationDetailActions({
  registrationId,
  referenceId,
  currentStatus,
}: DetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleStatusChange = async (targetStatus: string) => {
    const confirmed = window.confirm(
      `Confirm status update for [${referenceId}] to ${targetStatus}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        setMessage({ text: `Status updated to ${targetStatus}`, type: 'success' });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to update status', type: 'error' });
      }
    } catch (err) {
      console.error('Error changing status:', err);
      setMessage({ text: 'Network connection failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCheckIn = async () => {
    const confirmed = window.confirm(
      `Execute venue gate CHECK-IN for ${referenceId}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/check-in`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Attendee successfully CHECKED IN', type: 'success' });
        router.refresh();
      } else {
        setMessage({ text: data.error || 'Check-in failed', type: 'error' });
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setMessage({ text: 'Network connection failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-sm font-mono text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-red-950/40 border-red-500/30 text-red-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Direct Check-In Button */}
        {currentStatus !== 'CHECKED_IN' && (
          <button
            type="button"
            disabled={loading}
            onClick={handleDirectCheckIn}
            className="px-4 py-2 rounded-sm bg-[var(--color-lime,#CCFF00)] hover:bg-[var(--color-lime-dim,#99cc00)] text-[var(--color-void,#050505)] font-heading font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mark Checked In'}
          </button>
        )}

        {/* Approve Button */}
        {currentStatus !== 'CONFIRMED' && currentStatus !== 'CHECKED_IN' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStatusChange('CONFIRMED')}
            className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Approve Pass
          </button>
        )}

        {/* Waitlist Button */}
        {currentStatus !== 'WAITLISTED' && currentStatus !== 'CHECKED_IN' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStatusChange('WAITLISTED')}
            className="px-4 py-2 rounded-sm bg-sky-700 hover:bg-sky-600 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Move to Waitlist
          </button>
        )}

        {/* Reject Button */}
        {currentStatus !== 'REJECTED' && currentStatus !== 'CHECKED_IN' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStatusChange('REJECTED')}
            className="px-4 py-2 rounded-sm bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-red-300 font-heading text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Reject Pass
          </button>
        )}

        {/* Reset to Pending */}
        {currentStatus !== 'PENDING' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStatusChange('PENDING')}
            className="px-4 py-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--color-silver,#999999)] font-heading text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Reset to Pending
          </button>
        )}
      </div>
    </div>
  );
}

export default RegistrationDetailActions;
