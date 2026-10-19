'use client';

import { useState } from 'react';

interface CheckInResult {
  success: boolean;
  message: string;
  data?: { fullName: string; inGameName: string; referenceId: string; status: string; category: string };
}

export default function CheckInPage() {
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/admin/registrations/${refId}/check-in`, {
        method: 'POST',
      });
      const data = await res.json();
      setResult({
        success: res.ok && data.success,
        message: data.message || data.error || (res.ok ? 'Check-in successful!' : 'Check-in failed.'),
        data: data.registration ? {
          fullName: data.registration.fullName,
          inGameName: data.registration.inGameName,
          referenceId: data.registration.referenceId,
          status: data.registration.status,
          category: data.registration.category,
        } : undefined,
      });
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    }

    setLoading(false);
  };

  return (
    <div>
      <h1
        className="text-3xl tracking-wider uppercase mb-2"
        style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
      >
        CHECK-IN
      </h1>
      <p className="text-sm mb-8" style={{ color: '#999999' }}>
        Enter a registration reference ID to check in an attendee. Camera-based QR scanning requires a
        separate library integration.
      </p>

      <form onSubmit={handleCheckIn} className="flex gap-4 mb-8 max-w-xl">
        <input
          type="text"
          value={refId}
          onChange={(e) => setRefId(e.target.value.toUpperCase())}
          placeholder="PUBG-ET-XXXXXX"
          className="flex-1 px-4 py-3 rounded-lg border text-sm text-white outline-none uppercase tracking-wider"
          style={{
            backgroundColor: '#1a1a1a',
            borderColor: 'rgba(255,255,255,0.1)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !refId.trim()}
          className="px-8 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: '#CCFF00', color: '#050505', fontFamily: 'var(--font-heading)' }}
        >
          {loading ? 'CHECKING...' : 'CHECK IN'}
        </button>
      </form>

      {result && (
        <div
          className="max-w-xl rounded-xl border p-6"
          style={{
            backgroundColor: '#111111',
            borderColor: result.success ? 'rgba(204,255,0,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-2xl"
              style={{ color: result.success ? '#CCFF00' : '#ef4444' }}
            >
              {result.success ? '✓' : '✗'}
            </span>
            <span
              className="text-lg tracking-wider uppercase"
              style={{
                fontFamily: 'var(--font-heading)',
                color: result.success ? '#CCFF00' : '#ef4444',
              }}
            >
              {result.success ? 'CHECK-IN SUCCESSFUL' : 'CHECK-IN FAILED'}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: '#999999' }}>{result.message}</p>
          {result.data && (
            <div className="space-y-2 text-sm">
              <p><span style={{ color: '#666' }}>Name:</span> <span className="text-white">{result.data.fullName}</span></p>
              <p><span style={{ color: '#666' }}>IGN:</span> <span style={{ color: '#CCFF00' }}>{result.data.inGameName}</span></p>
              <p><span style={{ color: '#666' }}>Ref:</span> <span style={{ fontFamily: 'var(--font-mono)', color: '#cccccc' }}>{result.data.referenceId}</span></p>
              <p><span style={{ color: '#666' }}>Category:</span> <span className="capitalize" style={{ color: '#cccccc' }}>{result.data.category.replace('_', ' ')}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
