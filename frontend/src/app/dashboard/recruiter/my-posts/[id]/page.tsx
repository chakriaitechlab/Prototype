import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobApplicantsContent, type ApplicantsSearchParams } from '@/components/dashboard/recruiter/my-posts/detail/JobApplicantsContent';
import { ApplicantsSkeleton } from '@/components/dashboard/recruiter/my-posts/detail/ApplicantsSkeleton';

export const instant = false;

export const metadata: Metadata = {
  title: 'Applicants | Recruiter Dashboard | Chakri.ai',
  description: 'Review the applicants for your job post and send AI interview invites or rejections.',
};

interface RecruiterJobApplicantsPageProps {
  params: Promise<{ id: string }>;
  searchParams: ApplicantsSearchParams;
}

export default function RecruiterJobApplicantsPage({ params, searchParams }: RecruiterJobApplicantsPageProps) {
  return (
    <div className="w-full pb-10">
      <Suspense fallback={<ApplicantsSkeleton />}>
        <JobApplicantsContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
