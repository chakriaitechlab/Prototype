import { talentApi } from '@/lib/talent';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import { CandidateCard } from './CandidateCard';
import { CandidatesEmpty } from './CandidatesEmpty';
import { CandidatesPagination } from './CandidatesPagination';
import { CandidatesSearch } from './CandidatesSearch';

const CANDIDATES_PER_PAGE = 24;
const MAX_QUERY_LENGTH = 100;

export type CandidatesSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSearchParams(params: Awaited<CandidatesSearchParams>) {
  const q = (firstValue(params.q) ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const page = Math.max(1, Math.floor(Number(firstValue(params.page))) || 1);
  return { q, page };
}

export async function CandidatesGrid({ searchParams }: { searchParams: CandidatesSearchParams }) {
  const { q, page } = parseSearchParams(await searchParams);
  const data = await talentApi
    .candidates({ q: q || undefined, page, limit: CANDIDATES_PER_PAGE })
    .catch(() => null);

  return (
    <div className="space-y-6">
      <CandidatesSearch initialQuery={q} />

      {data === null ? (
        <div className="border border-rose-200 bg-white p-8 text-center">
          <p className="mb-2 text-sm font-semibold text-rose-600">Failed to load candidates</p>
          <p className="mb-4 text-xs text-[#5e6670]">An error occurred while fetching candidate profiles.</p>
          <RetryButton
            label="Try Again"
            className="bg-[#0a65cc] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#084d9d] disabled:opacity-60"
          />
        </div>
      ) : data.items.length === 0 ? (
        <CandidatesEmpty query={q} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.items.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
          <CandidatesPagination
            query={q}
            page={data.page}
            limit={data.limit}
            totalPages={data.totalPages}
            total={data.total}
          />
        </>
      )}
    </div>
  );
}
