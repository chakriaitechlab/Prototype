import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageLoader } from '@/components/ui/AppLoader';
import { InterviewDetailContent } from '@/components/dashboard/seeker/ai-interview/detail/InterviewDetailContent';

export const instant = false;

export const metadata: Metadata = {
  title: 'AI Interview | Seeker Dashboard | Chakri.ai',
  description: 'Get ready for your AI interview.',
};

export default function SeekerAiInterviewDetailPage({ params }: { params: Promise<{ interviewId: string }> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="w-full pb-10">
        <InterviewDetailContent params={params} />
      </div>
    </Suspense>
  );
}
