'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import type { ApplicantFilter, HireApplicantsResponse } from '@/types/hire';
import { formatCount } from '@/utils/format';
import { jobApplicantsPath } from '@/utils/routes';

const SEARCH_DEBOUNCE_MS = 350;

const TABS: { id: ApplicantFilter | undefined; label: string; count: keyof HireApplicantsResponse['counts'] }[] = [
  { id: undefined, label: 'All', count: 'all' },
  { id: 'review', label: 'To review', count: 'review' },
  { id: 'invited', label: 'Invited', count: 'invited' },
  { id: 'rejected', label: 'Rejected', count: 'rejected' },
];

interface ApplicantsToolbarProps {
  jobId: string;
  counts: HireApplicantsResponse['counts'];
  status?: ApplicantFilter;
  search: string;
}

export function ApplicantsToolbar({ jobId, counts, status, search }: ApplicantsToolbarProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const [isPending, startTransition] = useTransition();
  const lastSubmitted = useRef(search);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setValue(search);
  }

  const navigate = (next: { status?: ApplicantFilter; q?: string }) =>
    startTransition(() => router.replace(jobApplicantsPath(jobId, { status, q: search, ...next }), { scroll: false }));

  useEffect(() => {
    const query = value.trim();
    if (query === lastSubmitted.current || query === search) {
      lastSubmitted.current = query;
      return;
    }

    const timer = setTimeout(() => {
      lastSubmitted.current = query;
      startTransition(() => router.replace(jobApplicantsPath(jobId, { status, q: query }), { scroll: false }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, search, status, jobId, router]);

  return (
    <section className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex overflow-x-auto border border-[#e4e5e8] bg-white no-scrollbar" role="tablist" aria-label="Filter applicants">
        {TABS.map((tab) => {
          const active = tab.id === status;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => navigate({ status: tab.id })}
              className={`flex h-11 shrink-0 cursor-pointer items-center gap-2 border-r border-[#e4e5e8] px-4 text-[13.5px] font-medium transition-colors last:border-r-0 ${
                active ? 'bg-[#e7f0fa] text-[#0a65cc]' : 'text-[#5e6670] hover:bg-[#f8fafc]'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-px text-[11.5px] ${active ? 'bg-white' : 'bg-[#f1f2f4]'}`}>
                {formatCount(counts[tab.count])}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center lg:w-72">
        <Search size={16} className="pointer-events-none absolute left-3.5 text-[#767f8c]" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setValue('');
          }}
          placeholder="Search applicants..."
          aria-label="Search applicants"
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
    </section>
  );
}
