import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/client';
import { interviewsApi } from '@/lib/interviews';
import { STATUS_LABELS } from '@/utils/interviews';
import { interviewReportPath, SEEKER_AI_INTERVIEW_PATH } from '@/utils/routes';
import { requireDashboard } from '@/utils/session';
import { InterviewJobCard } from './InterviewJobCard';
import { InterviewRules } from './InterviewRules';
import { InterviewStartCard } from './InterviewStartCard';
import { InterviewSteps } from './InterviewSteps';

export async function InterviewDetailContent({ params }: { params: Promise<{ interviewId: string }> }) {
  await requireDashboard('SEEKER');
  const { interviewId } = await params;
  const interview = await interviewsApi.get(interviewId).catch((err: unknown) => {
    if (err instanceof ApiError && [400, 403, 404].includes(err.status)) notFound();
    throw err;
  });
  if (interview.status === 'COMPLETED') redirect(interviewReportPath(interview.id));

  return (
    <>
      <Link href={SEEKER_AI_INTERVIEW_PATH} className="mb-3 mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a65cc] hover:underline">
        <ArrowLeft size={14} aria-hidden />
        All interviews
      </Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="recruiter-page-title">AI Interview</h1>
          <p className="mt-1 text-[13.5px] leading-[1.4] text-[#5e6670]">
            Complete your interview before the invite expires. The recruiter sees your report right after.
          </p>
        </div>
        <span className="border border-[#b9d3f0] bg-[#e7f0fa] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-[#0a65cc]">
          {STATUS_LABELS[interview.status]}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-5">
          <InterviewJobCard interview={interview} />
          <InterviewSteps />
          <InterviewRules />
        </div>
        <InterviewStartCard interview={interview} />
      </div>
    </>
  );
}
