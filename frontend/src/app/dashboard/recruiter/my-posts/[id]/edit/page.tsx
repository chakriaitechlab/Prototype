import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageLoader } from '@/components/ui/AppLoader';
import { EditJobContent } from '@/components/dashboard/recruiter/my-posts/edit/EditJobContent';

export const instant = false;

export const metadata: Metadata = {
  title: 'Edit Job | Recruiter Dashboard | Chakri.ai',
};

export default function RecruiterEditJobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="w-full pb-10">
        <EditJobContent params={params} />
      </div>
    </Suspense>
  );
}
