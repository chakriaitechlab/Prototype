'use client';

import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import type { ApplicantFilter } from '@/types/hire';
import { jobApplicantsPath } from '@/utils/routes';

interface ApplicantsPaginationProps {
  jobId: string;
  page: number;
  totalPages: number;
  status?: ApplicantFilter;
  search: string;
}

export function ApplicantsPagination({ jobId, page, totalPages, status, search }: ApplicantsPaginationProps) {
  const router = useRouter();

  return (
    <div className="mt-6 flex justify-center">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        label="Applicants pagination"
        onPageChange={(next) => router.push(jobApplicantsPath(jobId, { status, q: search, page: next }))}
      />
    </div>
  );
}
