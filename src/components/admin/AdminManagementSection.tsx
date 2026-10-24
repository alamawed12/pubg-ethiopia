'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserPlusIcon,
  ShieldSecurityIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  LockIcon,
  AlertTriangleIcon,
} from '@/components/ui/TacticalIcons';

interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  password?: string | null;
}

export function AdminManagementSection() {
  const { data: session } = useSession();

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'scanner' | 'super_admin'>('admin');

  // Request & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // List State
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [isHeadAdmin, setIsHeadAdmin] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Selected Admin Detail Modal State
  const [selectedAdmin, setSelectedAdmin] = useState<AdminAccount | null>(null);
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedOnboarding, setCopiedOnboarding] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newRoleInput, setNewRoleInput] = useState<'admin' | 'scanner' | 'super_admin'>('admin');
  const [newNameInput, setNewNameInput] = useState('');
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoadingAdmins(true);
      const res = await fetch('/api/admin/admins');
      const data = await res.json();
      if (res.ok && data.success) {
        setAdmins(data.admins || []);
        setIsHeadAdmin(Boolean(data.isHeadAdmin));
      } else if (res.status === 403) {
        setIsHeadAdmin(false);
      }
    } catch (err) {
      console.warn('Failed to fetch admin accounts', err);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Open modal for selected admin
  const handleOpenAdminModal = (admin: AdminAccount) => {
    setSelectedAdmin(admin);
    setNewNameInput(admin.name);
    setNewRoleInput(admin.role as 'admin' | 'scanner' | 'super_admin');
    setNewPasswordInput('');
    setModalShowPassword(true);
    setCopiedPassword(false);
    setCopiedOnboarding(false);
    setModalFeedback(null);
  };

  // Generate random strong password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'PUBG-';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleGenerateModalPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'PUBG-';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(generated);
  };

  // Copy password helper
  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  // Copy complete staff onboarding briefing message for Telegram / WhatsApp
  const handleCopyOnboarding = (admin: AdminAccount) => {
    const currentPass = admin.password || newPasswordInput || 'Contact Head Admin for security key';
    const message = `🎮 PUBG MOBILE Community Assembly Ethiopia
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Official Staff Administrator Access
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal Login: https://pubgmethiopia.vercel.app/admin/login
Staff Name: ${admin.name}
Login Email: ${admin.email}
Password: ${currentPass}
Permission: ${admin.role.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Keep your login credentials confidential. Do not share your password.`;

    navigator.clipboard.writeText(message);
    setCopiedOnboarding(true);
    setTimeout(() => setCopiedOnboarding(false), 3000);
  };

  // Update credentials (password, name, role)
  const handleUpdateAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setIsUpdatingCredentials(true);
      setModalFeedback(null);

      const payload: { id: string; name?: string; role?: string; password?: string } = {
        id: selectedAdmin.id,
        name: newNameInput.trim(),
        role: newRoleInput,
      };

      if (newPasswordInput.trim()) {
        if (newPasswordInput.trim().length < 6) {
          setModalFeedback({ success: false, message: 'Password must be at least 6 characters.' });
          setIsUpdatingCredentials(false);
          return;
        }
        payload.password = newPasswordInput.trim();
      }

      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalFeedback({
          success: true,
          message: data.message || 'Credentials updated successfully!',
        });

        // Update selected admin state with new password and details
        setSelectedAdmin((prev) =>
          prev
            ? {
                ...prev,
                name: newNameInput.trim(),
                role: newRoleInput,
                password: payload.password || prev.password,
              }
            : null
        );

        setNewPasswordInput('');
        fetchAdmins();
      } else {
        setModalFeedback({
          success: false,
          message: data.error || 'Failed to update credentials.',
        });
      }
    } catch {
      setModalFeedback({
        success: false,
        message: 'Network error while updating credentials.',
      });
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ success: false, message: 'Please enter the admin name or title.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ success: false, message: 'Please enter a valid email address.' });
      return;
    }
    if (!password.trim() || password.length < 6) {
      setFeedback({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          success: true,
          message: data.message || `Admin account for ${name} registered successfully!`,
        });
        setName('');
        setEmail('');
        setPassword('');
        fetchAdmins();
      } else {
        setFeedback({
          success: false,
          message: data.error || 'Failed to register admin account.',
        });
      }
    } catch {
      setFeedback({
        success: false,
        message: 'Network error while creating admin account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    try {
      setDeletingId(adminId);
      const res = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmDeleteId(null);
        if (selectedAdmin?.id === adminId) {
          setSelectedAdmin(null);
        }
        setFeedback({
          success: true,
          message: `Admin ${adminEmail} has been removed.`,
        });
        fetchAdmins();
      } else {
        setFeedback({
          success: false,
          message: data.error || 'Failed to delete admin account.',
        });
      }
    } catch {
      setFeedback({
        success: false,
        message: 'Network error while deleting admin account.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // If the logged in user is not Head Admin, display locked message
  const userRole = session?.user?.role;
  const userEmail = (session?.user?.email || '').toLowerCase();
  const userIsSuper =
    userRole === 'super_admin' ||
    userEmail === 'pmcaheadadmin@pubgmethiopia.et' ||
    userEmail === 'admin@pubgmethiopia.et' ||
    userEmail === 'pubgmethiopia.et';

  if (!userIsSuper && !isHeadAdmin) {
    return (
      <div className="p-6 rounded-2xl border border-white/10 bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-400">
            <LockIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider">
              ADMIN REGISTRATION LOCKED
            </h3>
            <p className="text-xs text-[#999999] font-mono">
              Only the primary HQ Head Administrator has permission to register or manage administrator credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl border border-[#CCFF00]/30 bg-gradient-to-b from-[#14180f] to-[#0f110c] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shrink-0">
            <UserPlusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl uppercase tracking-wider text-white font-bold font-heading">
                REGISTER NEW ADMINISTRATOR
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30">
                HEAD ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-[#999999] font-mono mt-0.5">
              Create login credentials for sub-admins and staff members. Sub-admins cannot register other accounts.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="font-mono text-[11px] text-[#888888] block uppercase">ACTIVE STAFF ACCOUNTS</span>
          <span className="font-heading font-black text-xl text-[#CCFF00]">
            {admins.length} REGISTERED
          </span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-mono border flex items-center gap-3 ${
            feedback.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.success ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleRegisterAdmin} className="space-y-4 bg-black/40 p-5 sm:p-6 rounded-xl border border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Admin Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
              ADMINISTRATOR NAME / TITLE *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dawit Bekele (Lead Staff)"
              className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
              required
            />
          </div>

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
              ADMIN LOGIN EMAIL *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dawit@pubgmethiopia.et"
              className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Admin Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#cccccc] flex items-center gap-1.5">
                <KeyIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                <span>ASSIGN PASSWORD *</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-mono text-[#CCFF00] hover:underline cursor-pointer"
              >
                + Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 chars)"
                className="w-full pl-4 pr-16 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#888888] hover:text-white"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Role Picker */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#cccccc] mb-1.5">
              PERMISSION LEVEL / ROLE
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'scanner' | 'super_admin')}
              className="w-full px-4 py-2.5 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#161616] border-white/10 cursor-pointer"
            >
              <option value="admin">Operational Admin (Full Registrations, VIP Payments &amp; Data)</option>
              <option value="scanner">Gate Scanner Staff (Ticket QR Scanner &amp; Check-In ONLY)</option>
              <option value="super_admin">Co-Head Administrator (Full System Privileges)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-[#888888]">
            The new administrator can immediately sign in at <strong className="text-white">/admin/login</strong> with this email and password.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-[#CCFF00] hover:bg-[#b8e600] text-black cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.25)]"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>REGISTERING...</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="w-4 h-4 text-black" />
                <span>CREATE ADMIN ACCOUNT</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Existing Administrators Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#cccccc] font-bold">
              REGISTERED ADMINISTRATOR ACCOUNTS
            </h3>
            <span className="text-[11px] font-mono text-[#888888]">
              💡 Click on any administrator name to view password, reset credentials, or copy onboarding dispatch.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#777777]">
            {admins.length} total staff
          </span>
        </div>

        {isLoadingAdmins ? (
          <div className="p-8 text-center text-xs font-mono text-[#888888]">
            Loading administrator list...
          </div>
        ) : admins.length === 0 ? (
          <div className="p-6 rounded-xl border border-white/5 bg-black/30 text-center text-xs font-mono text-[#888888]">
            No secondary administrators registered yet. Use the form above to add staff accounts.
          </div>
        ) : (
          <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/40">
            {admins.map((admin) => {
              const isPrimaryHead =
                admin.email.toLowerCase() === 'pmcaheadadmin@pubgmethiopia.et' ||
                admin.email.toLowerCase() === 'pubgmethiopia.et';

              return (
                <div
                  key={admin.id}
                  onClick={() => handleOpenAdminModal(admin)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.04] transition-all cursor-pointer group hover:border-l-4 hover:border-l-[#CCFF00]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white font-mono uppercase group-hover:border-[#CCFF00]/50 group-hover:text-[#CCFF00] transition-colors">
                      {admin.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-white tracking-wide group-hover:text-[#CCFF00] transition-colors flex items-center gap-1.5">
                          <span>{admin.name}</span>
                          <span className="text-[10px] font-mono text-[#888888] font-normal group-hover:underline">
                            (click to view password)
                          </span>
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                            admin.role === 'super_admin'
                              ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/30'
                              : admin.role === 'scanner'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {admin.role === 'super_admin'
                            ? 'HEAD ADMIN'
                            : admin.role === 'scanner'
                            ? 'GATE SCANNER'
                            : 'OPERATIONAL ADMIN'}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#888888] mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{admin.email}</span>
                        <span>•</span>
                        <span>Registered {new Date(admin.createdAt).toLocaleDateString()}</span>
                        {admin.password && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400/90 font-bold flex items-center gap-1">
                              <KeyIcon className="w-3 h-3 text-amber-400" />
                              <span>Password Available</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenAdminModal(admin)}
                      className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border border-[#CCFF00]/30 text-[#CCFF00] hover:bg-[#CCFF00]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyIcon className="w-3.5 h-3.5" />
                      <span>VIEW CREDENTIALS</span>
                    </button>

                    {isPrimaryHead ? (
                      <span className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-white/5 border border-white/10 text-neutral-400 flex items-center gap-1">
                        <ShieldSecurityIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>HQ PRIMARY HEAD</span>
                      </span>
                    ) : confirmDeleteId === admin.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                          disabled={deletingId === admin.id}
                          className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors"
                        >
                          {deletingId === admin.id ? 'REMOVING...' : 'CONFIRM REMOVE'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase bg-neutral-800 text-neutral-300 hover:text-white"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(admin.id)}
                        className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>REVOKE ACCESS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 flex items-start gap-2.5 text-xs text-[#888888] font-mono leading-relaxed">
        <AlertTriangleIcon className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">SECURITY GOVERNANCE:</strong> Only the primary Head Administrator can create, view passwords, or revoke sub-admin credentials. Sub-admins are strictly prohibited from creating accounts or granting access to others.
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ADMIN CREDENTIALS & PASSWORD MODAL (OPENS ON CLICKING ANY ADMIN)
      ══════════════════════════════════════════════════════════════════════════ */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border-2 border-[#CCFF00]/40 bg-[#111111] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] font-heading font-black text-lg">
                  {selectedAdmin.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-xl text-white uppercase tracking-wider">
                      {selectedAdmin.name}
                    </h3>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        selectedAdmin.role === 'super_admin'
                          ? 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/30'
                          : selectedAdmin.role === 'scanner'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {selectedAdmin.role === 'super_admin'
                        ? 'HEAD ADMIN'
                        : selectedAdmin.role === 'scanner'
                        ? 'GATE SCANNER'
                        : 'OPERATIONAL ADMIN'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">{selectedAdmin.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Feedback Alert */}
            {modalFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-mono border flex items-center gap-2.5 ${
                  modalFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {modalFeedback.success ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{modalFeedback.message}</span>
              </div>
            )}

            {/* ─── 1. CURRENT PASSWORD SECTION ─── */}
            <div className="p-4 sm:p-5 rounded-xl bg-black/60 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <KeyIcon className="w-4 h-4 text-amber-400" />
                  <span>ACTIVE LOGIN PASSWORD</span>
                </span>
                <span className="text-[10px] font-mono text-[#888888]">HEAD ADMIN VIEW</span>
              </div>

              {selectedAdmin.password ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={modalShowPassword ? 'text' : 'password'}
                      readOnly
                      value={selectedAdmin.password}
                      className="w-full px-4 py-2.5 rounded-xl border text-base font-mono font-bold text-amber-400 bg-[#161616] border-white/10 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => setModalShowPassword(!modalShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-[#888888] hover:text-white"
                    >
                      {modalShowPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyPassword(selectedAdmin.password!)}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>{copiedPassword ? 'COPIED!' : 'COPY PASSWORD'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-neutral-900 border border-white/5 text-xs font-mono text-neutral-400 space-y-1">
                  <div>• Password is encrypted in hash format.</div>
                  <div className="text-neutral-500">
                    Use the form below to assign a new password so you can see and copy it anytime.
                  </div>
                </div>
              )}
            </div>

            {/* ─── 2. QUICK STAFF ONBOARDING DISPATCH ─── */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-neutral-200 font-bold">
                  SHARE CREDENTIALS TO STAFF
                </span>
                <span className="text-[10px] font-sans text-neutral-400 font-semibold">ONE-CLICK DISPATCH</span>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Click below to copy the full login package with portal URL, email, and password to send directly to this admin on Telegram or WhatsApp.
              </p>

              <button
                type="button"
                onClick={() => handleCopyOnboarding(selectedAdmin)}
                className="w-full py-2.5 px-4 rounded-xl border border-[#CCFF00]/40 bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{copiedOnboarding ? '✓ CREDENTIALS COPIED TO CLIPBOARD!' : '📋 COPY STAFF LOGIN ONBOARDING MESSAGE'}</span>
              </button>
            </div>

            {/* ─── 3. UPDATE DETAILS OR RESET PASSWORD FORM ─── */}
            <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 pt-2 border-t border-white/10">
              <span className="text-xs font-sans uppercase tracking-wider text-white font-bold block">
                EDIT ADMINISTRATOR DETAILS &amp; RESET PASSWORD
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Edit Name */}
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-neutral-300 mb-1 font-semibold">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm text-white font-sans outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
                    required
                  />
                </div>

                {/* Edit Role */}
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-neutral-300 mb-1 font-semibold">
                    ROLE / PERMISSION
                  </label>
                  <select
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value as 'admin' | 'scanner' | 'super_admin')}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs text-white font-sans outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10 cursor-pointer"
                  >
                    <option value="admin">Operational Admin</option>
                    <option value="scanner">Gate Scanner Staff</option>
                    <option value="super_admin">Co-Head Administrator</option>
                  </select>
                </div>
              </div>

              {/* Set New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-sans uppercase tracking-wider text-neutral-300 font-semibold">
                    ASSIGN NEW PASSWORD (OPTIONAL)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateModalPassword}
                    className="text-[11px] font-sans font-bold text-[#CCFF00] hover:underline cursor-pointer"
                  >
                    + Generate Password
                  </button>
                </div>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Leave blank to keep existing, or type new password"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm text-white font-mono outline-none focus:border-[#CCFF00] bg-[#1a1a1a] border-white/10"
                />
              </div>

              {/* Save Changes Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white font-mono text-xs uppercase"
                >
                  CLOSE
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingCredentials}
                  className="px-6 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingCredentials ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagementSection;
