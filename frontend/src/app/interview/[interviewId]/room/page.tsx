import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { PageLoader } from '@/components/ui/AppLoader';
import { InterviewRoom } from '@/components/interview/room/InterviewRoom';
import { ApiError } from '@/lib/client';
import { interviewsApi } from '@/lib/interviews';
import { interviewLobbyPath, interviewReportPath } from '@/utils/routes';
import { requireDashboard } from '@/utils/session';

export const instant = false;

export default function InterviewRoomPage({ params }: { params: Promise<{ interviewId: string }> }) {
  return (
    <Suspense fallback={<PageLoader className="min-h-dvh" />}>
      <RoomContent params={params} />
    </Suspense>
  );
}

async function RoomContent({ params }: { params: Promise<{ interviewId: string }> }) {
  const user = await requireDashboard('SEEKER');
  const { interviewId } = await params;
  const interview = await interviewsApi.get(interviewId).catch((err: unknown) => {
    if (err instanceof ApiError && [400, 403, 404].includes(err.status)) notFound();
    throw err;
  });
  if (interview.status === 'COMPLETED') redirect(interviewReportPath(interview.id));
  if (interview.status !== 'IN_PROGRESS') redirect(interviewLobbyPath(interview.id));

  return <InterviewRoom interview={interview} candidateName={user.name ?? user.username ?? 'You'} />;
}
