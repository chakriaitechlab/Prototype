import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageLoader } from '@/components/ui/AppLoader';
import { InterviewList } from '@/components/dashboard/seeker/ai-interview/InterviewList';

export const metadata: Metadata = {
  title: 'AI Interview | Seeker Dashboard | Chakri.ai',
  description: 'Your AI interview invites, progress, and reports.',
};

export default function SeekerAiInterviewPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="w-full pb-10">
        <InterviewList />
      </div>
    </Suspense>
  );
}
