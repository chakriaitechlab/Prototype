'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import type { HireJobStatus } from '@/types/hire';
import { formatCount } from '@/utils/format';
import { JOB_STATUS_FILTERS } from '@/utils/job-posting';
import { myPostsPath } from '@/utils/routes';

const SEARCH_DEBOUNCE_MS = 350;

interface MyPostsToolbarProps {
  total: number;
  status?: HireJobStatus;
  search: string;
}

export function MyPostsToolbar({ total, status, search }: MyPostsToolbarProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [isPending, startTransition] = useTransition();
  const lastSubmitted = useRef(search);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setValue(search);
  }

  const navigate = (next: { status?: string; search?: string }) =>
    startTransition(() => router.replace(myPostsPath({ status, search, ...next }), { scroll: false }));

  useEffect(() => {
    const query = value.trim();
    if (query === lastSubmitted.current || query === search) {
      lastSubmitted.current = query;
      return;
    }

    const timer = setTimeout(() => {
      lastSubmitted.current = query;
      startTransition(() => router.replace(myPostsPath({ status, search: query }), { scroll: false }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, search, status, router]);

  return (
    <section className="mb-5 flex flex-col gap-4 pt-2 sm:pt-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="recruiter-page-title">My Posts ({formatCount(total)})</h1>
        <p className="mt-1 max-w-[640px] text-[13.5px] leading-[1.4] text-[#5e6670]">
          Manage your job postings, track applicant status, and publish new openings.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex items-center sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-[#767f8c]" aria-hidden />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setValue('');
            }}
            placeholder="Search jobs..."
            aria-label="Search jobs"
            maxLength={100}
            className="h-11 w-full border border-[#e4e5e8] bg-white pl-10 pr-10 text-sm text-[#18191c] outline-none transition-all placeholder:text-[#9199a3] focus:border-[#0a65cc]"
          />
          {isPending ? (
            <Loader2 size={15} className="absolute right-3.5 animate-spin text-[#767f8c]" aria-hidden />
          ) : (
            value && (
              <button
                type="button"
                onClick={() => setValue('')}
                className="absolute right-3 p-1 text-[#767f8c] transition-colors hover:text-[#18191c]"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )
          )}
        </div>

        <div className="relative sm:w-48">
          <select
            value={status ?? 'ALL'}
            onChange={(e) => navigate({ status: e.target.value === 'ALL' ? undefined : e.target.value })}
            aria-label="Filter by job status"
            className="h-11 w-full cursor-pointer appearance-none border border-[#e4e5e8] bg-white pl-3.5 pr-10 text-sm font-medium text-[#18191c] outline-none transition-all focus:border-[#0a65cc]"
          >
            {JOB_STATUS_FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#767f8c]"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
