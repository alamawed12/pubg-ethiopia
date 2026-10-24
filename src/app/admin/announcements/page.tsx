'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormFeedback({ type: 'error', text: 'Title and content cannot be empty.' });
      return;
    }

    setSubmitting(true);
    setFormFeedback(null);

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          isActive,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setType('info');
        setIsActive(true);
        setFormFeedback({ type: 'success', text: 'Broadcast announcement successfully published.' });
        fetchAnnouncements();
      } else {
        const data = await res.json();
        setFormFeedback({ type: 'error', text: data.error || 'Failed to publish announcement.' });
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      setFormFeedback({ type: 'error', text: 'Network connection failure.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Failed to toggle active state:', err);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    const confirmed = window.confirm(`Permanently delete announcement "${titleStr}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-[var(--color-lime,#CCFF00)] shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[var(--color-lime,#CCFF00)]">
            BROADCAST TRANSMISSION DESK
          </span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-white">
          COMMUNITY ANNOUNCEMENTS
        </h1>
        <p className="font-sans text-xs text-neutral-400 font-medium mt-0.5">
          Publish public news, tournament bulletins, and live logistical updates to the homepage dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create Announcement Form */}
        <div className="lg:col-span-5">
          <Card glowBorder padding="lg" className="bg-[var(--color-charcoal,#111111)] border-white/10">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white mb-4">
              NEW BROADCAST
            </h2>

            {formFeedback && (
              <div
                className={`p-3 rounded-sm font-mono text-xs mb-4 flex items-center gap-2 border ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-950/40 border-red-500/30 text-red-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{formFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <Input
                label="Headline / Title"
                placeholder="e.g. Venue Coordinates Released"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* Type Selection */}
              <div>
                <label className="block font-mono text-xs text-[var(--color-silver,#999999)] uppercase mb-1.5">
                  DISPATCH TYPE
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] font-mono text-xs text-white p-3 rounded-sm outline-none cursor-pointer"
                >
                  <option value="info">INFO — General briefing</option>
                  <option value="update">UPDATE — Schedule / roster update</option>
                  <option value="warning">WARNING — Crucial urgent notice</option>
                </select>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block font-mono text-xs text-[var(--color-silver,#999999)] uppercase mb-1.5">
                  BROADCAST CONTENT
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed text published to the public assembly site..."
                  required
                  className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] font-body text-sm text-white p-3 rounded-sm outline-none placeholder:text-[var(--color-silver,#999999)]/40 resize-none"
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-black/40 border-white/20 text-[var(--color-lime,#CCFF00)] focus:ring-[var(--color-lime,#CCFF00)] focus:ring-offset-0"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="font-mono text-xs text-white cursor-pointer select-none"
                >
                  Publish immediately (Active state)
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                  className="w-full font-heading uppercase tracking-wider text-sm"
                >
                  DISPATCH BROADCAST
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Existing Announcements List */}
        <div className="lg:col-span-7">
          <div className="rounded-sm bg-[var(--color-charcoal,#111111)] border border-white/10 p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                LIVE INTEL FEED ({announcements.length})
              </h2>
              <span className="font-mono text-xs text-[var(--color-silver,#999999)]">
                CHRONOLOGICAL
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="w-6 h-6 border-2 border-[var(--color-lime,#CCFF00)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="font-mono text-xs text-[var(--color-silver,#999999)]">
                  Retrieving announcements...
                </p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-mono text-xs text-[var(--color-silver,#999999)] uppercase">
                  No announcements currently broadcasted. Create your first bulletin on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-sm bg-black/40 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          status={
                            item.type === 'warning'
                              ? 'REJECTED'
                              : item.type === 'update'
                              ? 'CONFIRMED'
                              : 'WAITLISTED'
                          }
                          label={item.type.toUpperCase()}
                        />
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                            item.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-[var(--color-silver,#999999)] border border-white/10'
                          }`}
                        >
                          {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      <time className="font-mono text-xs text-[var(--color-silver,#999999)]">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>

                    <h3 className="font-heading text-lg font-bold uppercase text-white mb-1 tracking-wide">
                      {item.title}
                    </h3>

                    <p className="font-body text-xs sm:text-sm text-[var(--color-silver-light,#cccccc)] leading-relaxed mb-4">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 font-mono text-xs">
                      <span className="text-[var(--color-silver,#999999)] text-[11px]">
                        Posted by: {item.createdBy}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[var(--color-lime,#CCFF00)] transition-colors"
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
