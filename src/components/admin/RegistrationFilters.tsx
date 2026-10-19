'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface RegistrationFiltersProps {
  initialSearch: string;
  initialStatus: string;
  initialCategory: string;
}

export function RegistrationFilters({
  initialSearch,
  initialStatus,
  initialCategory,
}: RegistrationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);

  const applyFilters = (newParams: { search?: string; status?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 on filter change
    params.set('page', '1');

    if (newParams.search !== undefined) {
      if (newParams.search) params.set('search', newParams.search);
      else params.delete('search');
    }

    if (newParams.status !== undefined) {
      if (newParams.status && newParams.status !== 'ALL') params.set('status', newParams.status);
      else params.delete('status');
    }

    if (newParams.category !== undefined) {
      if (newParams.category && newParams.category !== 'ALL') params.set('category', newParams.category);
      else params.delete('category');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: search.trim() });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ status: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ category: e.target.value });
  };

  const clearAllFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(
    initialSearch || (initialStatus && initialStatus !== 'ALL') || (initialCategory && initialCategory !== 'ALL')
  );

  return (
    <div className="bg-[var(--color-charcoal,#111111)] border border-white/10 p-4 rounded-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, IGN, UID, Phone, Ref..."
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] px-3.5 py-2 rounded-sm font-body text-xs sm:text-sm text-white placeholder:text-[var(--color-silver,#999999)] outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  applyFilters({ search: '' });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-silver,#999999)] hover:text-white text-xs font-mono"
              >
                &times;
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-heading text-xs uppercase tracking-wider rounded-sm transition-colors shrink-0"
          >
            SEARCH
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 items-center">
          {/* Status Dropdown */}
          <select
            value={initialStatus}
            onChange={handleStatusChange}
            aria-label="Filter by Status"
            className="bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] text-xs font-mono text-[var(--color-silver-light,#cccccc)] py-2 px-3 rounded-sm outline-none cursor-pointer"
          >
            <option value="ALL">Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={initialCategory}
            onChange={handleCategoryChange}
            aria-label="Filter by Category"
            className="bg-black/40 border border-white/10 focus:border-[var(--color-lime,#CCFF00)] text-xs font-mono text-[var(--color-silver-light,#cccccc)] py-2 px-3 rounded-sm outline-none cursor-pointer"
          >
            <option value="ALL">Category: All</option>
            <option value="attendee">Attendee</option>
            <option value="tournament_player">Tournament Player</option>
            <option value="team_rep">Team Representative</option>
            <option value="content_creator">Content Creator</option>
            <option value="volunteer">Volunteer</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="font-mono text-xs text-[var(--color-lime,#CCFF00)] hover:underline whitespace-nowrap px-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="font-mono text-[11px] text-[var(--color-lime,#CCFF00)] flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-lime,#CCFF00)]" />
          <span>Synchronizing query filters...</span>
        </div>
      )}
    </div>
  );
}

export default RegistrationFilters;
