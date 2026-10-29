import Link from 'next/link';
import { Bookmark, Search, Sparkles, Users } from 'lucide-react';
import { RECRUITER_CANDIDATES_PATH } from '@/utils/routes';

interface FavoritesEmptyProps {
  query?: string;
  onReset?: () => void;
}

export function FavoritesEmpty({ query, onReset }: FavoritesEmptyProps) {
  if (onReset) {
    return (
      <div className="border border-[#e4e5e8] bg-white p-8 text-center shadow-xs sm:p-10">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-[#e4e5e8] bg-[#f1f2f4] text-[#767f8c]">
          <Search size={18} aria-hidden />
        </div>
        <h3 className="mb-1 text-base font-bold text-[#18191c]">No matching candidates found</h3>
        <p className="mx-auto mb-4 max-w-sm text-xs text-[#767f8c]">
          No candidates match &quot;{query}&quot;. Try searching with a different keyword.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 border border-[#0a65cc]/30 bg-[#e7f0fa] px-4 py-2 text-xs font-semibold text-[#0a65cc] transition-colors hover:bg-[#d7e7f8]"
        >
          Reset search
        </button>
      </div>
    );
  }

  return (
    <div className="border border-[#e4e5e8] bg-white p-8 text-center shadow-xs sm:p-10">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-[#0a65cc]/20 bg-[#e7f0fa] text-[#0a65cc]">
        <Bookmark size={22} aria-hidden />
      </div>
      <h3 className="mb-1.5 text-base font-bold tracking-tight text-[#18191c] sm:text-lg">No saved candidates yet</h3>
      <p className="mx-auto mb-5 max-w-md text-[13px] leading-relaxed text-[#767f8c]">
        When reviewing applicants or browsing talent, click the bookmark icon on any candidate card to save them
        here for quick outreach.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={RECRUITER_CANDIDATES_PATH}
          className="jp-btn jp-btn--primary h-9! border-[#0a65cc]! px-4! text-[13px]!"
        >
          <Users size={15} aria-hidden />
          <span>Browse Talent Pipeline</span>
        </Link>
        <Link
          href="/dashboard/recruiter/ai-search"
          className="jp-btn jp-btn--outline h-9! border-[#e4e5e8]! px-4! text-[13px]! hover:border-[#0a65cc]!"
        >
          <Sparkles size={15} aria-hidden />
          <span>AI Talent Search</span>
        </Link>
      </div>
    </div>
  );
}
