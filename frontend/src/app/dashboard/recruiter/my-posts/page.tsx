import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MyPostsContent, type MyPostsSearchParams } from '@/components/dashboard/recruiter/my-posts/MyPostsContent';
import { MyPostsSkeleton } from '@/components/dashboard/recruiter/my-posts/MyPostsSkeleton';

export const metadata: Metadata = {
  title: 'My Posts | Recruiter Dashboard | Chakri.ai',
  description: 'Manage your job postings, track applicant status, and publish new openings.',
};

export default function RecruiterMyPostsPage({ searchParams }: { searchParams: MyPostsSearchParams }) {
  return (
    <div className="w-full pb-10">
      <Suspense fallback={<MyPostsSkeleton />}>
        <MyPostsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
