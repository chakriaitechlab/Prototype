import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { PageLoader } from '@/components/ui/AppLoader';
import { LobbyView } from '@/components/interview/lobby/LobbyView';
import { ApiError } from '@/lib/client';
import { interviewsApi } from '@/lib/interviews';
import { aiInterviewPath, interviewReportPath } from '@/utils/routes';
import { requireDashboard } from '@/utils/session';

export const instant = false;

export default function InterviewLobbyPage({ params }: { params: Promise<{ interviewId: string }> }) {
  return (
    <Suspense fallback={<PageLoader className="min-h-dvh" />}>
      <LobbyContent params={params} />
    </Suspense>
  );
}

async function LobbyContent({ params }: { params: Promise<{ interviewId: string }> }) {
  await requireDashboard('SEEKER');
  const { interviewId } = await params;
  const interview = await interviewsApi.get(interviewId).catch((err: unknown) => {
    if (err instanceof ApiError && [400, 403, 404].includes(err.status)) notFound();
    throw err;
  });
  if (interview.status === 'COMPLETED') redirect(interviewReportPath(interview.id));
  if (interview.status === 'EXPIRED') redirect(aiInterviewPath(interview.id));

  return <LobbyView interview={interview} />;
}
