'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl border"
        style={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
          >
            ADMIN ACCESS
          </h1>
          <p className="text-sm mt-2" style={{ color: '#999999' }}>
            Authorized personnel only
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-3 rounded-lg text-sm text-center"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#999999' }}>
              Email / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border text-sm text-white outline-none transition-colors duration-300 focus:border-[#CCFF00]"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
              placeholder="pubgmethiopia.et"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#999999' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border text-sm text-white outline-none transition-colors duration-300 focus:border-[#CCFF00]"
              style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: '#CCFF00',
              color: '#050505',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs" style={{ color: '#666666' }}>
          <Link href="/" className="hover:underline" style={{ color: '#CCFF00' }}>
            ← Back to main site
          </Link>
        </p>
      </div>
    </div>
  );
}
