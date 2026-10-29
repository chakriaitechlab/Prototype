import Link from 'next/link';
import { Users } from 'lucide-react';
import { RECRUITER_CANDIDATES_PATH } from '@/utils/routes';

export function CandidatesEmpty({ query }: { query: string }) {
  return (
    <div className="border border-[#e4e5e8] bg-white p-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f2f4] text-[#767f8c]">
        <Users size={22} aria-hidden />
      </div>
      <h3 className="mb-1 text-base font-bold text-[#18191c]">No job seekers found</h3>
      <p className="mx-auto mb-4 max-w-sm text-xs text-[#5e6670]">
        {query
          ? `No candidates match "${query}". Try adjusting your search keywords.`
          : 'There are currently no job seeker profiles available.'}
      </p>
      {query && (
        <Link
          href={RECRUITER_CANDIDATES_PATH}
          className="inline-block border border-[#e4e5e8] bg-white px-4 py-2 text-xs font-semibold text-[#18191c] transition-colors hover:bg-[#f1f2f4]"
        >
          Clear Search
        </Link>
      )}
    </div>
  );
}
