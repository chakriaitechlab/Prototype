'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 350;

export function CandidatesSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const [syncedQuery, setSyncedQuery] = useState(initialQuery);
  const lastSubmitted = useRef(initialQuery);

  if (initialQuery !== syncedQuery) {
    setSyncedQuery(initialQuery);
    setValue(initialQuery);
  }

  useEffect(() => {
    const query = value.trim();
    if (query === lastSubmitted.current || query === initialQuery) {
      lastSubmitted.current = query;
      return;
    }

    const timer = setTimeout(() => {
      lastSubmitted.current = query;
      const href = query ? `${pathname}?q=${encodeURIComponent(query)}` : pathname;
      startTransition(() => router.replace(href, { scroll: false }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, initialQuery, pathname, router]);

  return (
    <div className="border border-[#e4e5e8] bg-white p-4 shadow-xs">
      <div className="relative flex items-center">
        <Search size={16} className="pointer-events-none absolute left-3.5 text-[#767f8c]" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name, role, skills, or location…"
          aria-label="Search job seekers"
          className="h-11 w-full border border-[#e4e5e8] bg-[#f8f9fa] pl-10 pr-10 text-sm text-[#18191c] outline-none transition-all placeholder:text-[#9199a3] focus:border-[#0a65cc] focus:bg-white"
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
    </div>
  );
}
