import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CandidatesGrid, type CandidatesSearchParams } from '@/components/dashboard/recruiter/candidates/CandidatesGrid';
import { CandidatesSkeleton } from '@/components/dashboard/recruiter/candidates/CandidatesSkeleton';

export const metadata: Metadata = {
  title: 'Candidates | Recruiter Dashboard | Chakri.ai',
  description: 'Browse and connect with verified job seekers across Bangladesh.',
};

export default function RecruiterCandidatesPage({ searchParams }: { searchParams: CandidatesSearchParams }) {
  return (
    <div className="pt-2 sm:pt-3">
      <header className="mb-[18px]">
        <h1 className="recruiter-page-title">Job Seekers</h1>
        <p className="mt-1 max-w-[640px] text-[13.5px] leading-[1.4] text-[#5e6670]">
          Browse and connect with verified job seekers across Bangladesh.
        </p>
      </header>

      <Suspense fallback={<CandidatesSkeleton />}>
        <CandidatesGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
