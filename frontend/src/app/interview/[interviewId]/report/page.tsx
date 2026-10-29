import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { PageLoader } from '@/components/ui/AppLoader';
import { ReportContent } from '@/components/interview/report/ReportContent';
import { ApiError } from '@/lib/client';
import { interviewsApi } from '@/lib/interviews';
import { pathForUser } from '@/utils/routes';
import { requireUser } from '@/utils/session';

export const instant = false;

export default function InterviewReportPage({ params }: { params: Promise<{ interviewId: string }> }) {
  return (
    <Suspense fallback={<PageLoader className="min-h-dvh" />}>
      <ReportLoader params={params} />
    </Suspense>
  );
}

async function ReportLoader({ params }: { params: Promise<{ interviewId: string }> }) {
  const user = await requireUser();
  if (user.nextStep !== 'done') redirect(pathForUser(user));

  const { interviewId } = await params;
  const report = await interviewsApi.report(interviewId).catch((err: unknown) => {
    if (err instanceof ApiError && [400, 403, 404].includes(err.status)) notFound();
    throw err;
  });

  return <ReportContent data={report} />;
}
