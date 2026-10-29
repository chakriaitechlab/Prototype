import Link from 'next/link';
import { Bookmark, Sparkles, Users } from 'lucide-react';
import { formatCount } from '@/utils/format';
import { RECRUITER_CANDIDATES_PATH } from '@/utils/routes';

export function FavoritesHero({ total }: { total: number }) {
  return (
    <section className="mb-5 border border-[#e4e5e8] bg-white p-4 shadow-xs" data-purpose="saved-candidates-hero">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#0a65cc]/20 bg-[#e7f0fa] text-[#0a65cc]">
            <Bookmark size={18} fill="currentColor" aria-hidden />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#18191c]">Saved Candidates</h1>
              <span className="inline-flex items-center border border-[#0a65cc]/30 bg-[#e7f0fa] px-2 py-0.5 text-[11px] font-semibold text-[#0a65cc]">
                {formatCount(total)} {total === 1 ? 'candidate' : 'candidates'}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#767f8c]">
              Talent and candidates bookmarked across your pipeline and searches for quick outreach.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href={RECRUITER_CANDIDATES_PATH}
            className="jp-btn jp-btn--outline h-9! border-[#e4e5e8]! px-4! text-[13px]! hover:border-[#0a65cc]!"
          >
            <Users size={15} aria-hidden />
            <span>Browse Pipeline</span>
          </Link>
          <Link
            href="/dashboard/recruiter/ai-search"
            className="jp-btn jp-btn--primary h-9! border-[#0a65cc]! px-4! text-[13px]!"
          >
            <Sparkles size={15} aria-hidden />
            <span>AI Search</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
