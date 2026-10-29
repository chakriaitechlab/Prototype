import Link from 'next/link';
import { RECRUITER_CANDIDATES_PATH } from '@/utils/routes';

interface CandidatesPaginationProps {
  query: string;
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

const BUTTON_CLASS =
  'border border-[#e4e5e8] bg-white px-3 py-1.5 text-xs font-semibold text-[#18191c] transition-colors hover:bg-[#f1f2f4]';
const DISABLED_CLASS = `${BUTTON_CLASS} pointer-events-none opacity-40`;

function pageHref(query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return search ? `${RECRUITER_CANDIDATES_PATH}?${search}` : RECRUITER_CANDIDATES_PATH;
}

export function CandidatesPagination({ query, page, limit, totalPages, total }: CandidatesPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-[#e4e5e8] pt-4">
      <p className="text-xs text-[#5e6670]">
        Showing <span className="font-semibold text-[#18191c]">{from}</span>–
        <span className="font-semibold text-[#18191c]">{to}</span> of{' '}
        <span className="font-semibold text-[#18191c]">{total}</span> job seekers
      </p>
      <nav className="flex items-center gap-1.5" aria-label="Candidates pagination">
        {page > 1 ? (
          <Link href={pageHref(query, page - 1)} className={BUTTON_CLASS}>
            Previous
          </Link>
        ) : (
          <span className={DISABLED_CLASS} aria-disabled>
            Previous
          </span>
        )}
        <span className="px-3 py-1.5 text-xs font-semibold text-[#5e6670]">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={pageHref(query, page + 1)} className={BUTTON_CLASS}>
            Next
          </Link>
        ) : (
          <span className={DISABLED_CLASS} aria-disabled>
            Next
          </span>
        )}
      </nav>
    </div>
  );
}
