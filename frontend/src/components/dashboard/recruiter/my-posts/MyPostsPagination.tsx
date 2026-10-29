'use client';

import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import type { HireJobStatus } from '@/types/hire';
import { myPostsPath } from '@/utils/routes';

interface MyPostsPaginationProps {
  page: number;
  totalPages: number;
  status?: HireJobStatus;
  search: string;
}

export function MyPostsPagination({ page, totalPages, status, search }: MyPostsPaginationProps) {
  const router = useRouter();

  return (
    <div className="mt-6 flex justify-center">
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        label="My posts pagination"
        onPageChange={(next) => router.push(myPostsPath({ status, search, page: next }))}
      />
    </div>
  );
}
