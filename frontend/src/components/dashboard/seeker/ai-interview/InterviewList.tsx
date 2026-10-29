import Link from 'next/link';
import { ArrowRight, Video } from 'lucide-react';
import { interviewsApi } from '@/lib/interviews';
import { ResetInterviewButton } from '@/components/interview/ResetInterviewButton';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { InterviewSession } from '@/types/interviews';
import { formatDate } from '@/utils/format';
import { STATUS_LABELS } from '@/utils/interviews';
import { aiInterviewPath, interviewReportPath } from '@/utils/routes';
import { requireDashboard } from '@/utils/session';

const STATUS_TONE: Record<InterviewSession['status'], string> = {
  INVITED: 'border-[#b9d3f0] bg-[#e7f0fa] text-[#0a65cc]',
  IN_PROGRESS: 'border-[#f5d9a8] bg-[#fff7e6] text-[#b45309]',
  COMPLETED: 'border-[#bfe3c7] bg-[#eaf6ec] text-[#1e7e34]',
  EXPIRED: 'border-[#e4e5e8] bg-[#f1f2f4] text-[#767f8c]',
};

export async function InterviewList() {
  await requireDashboard('SEEKER');
  const interviews = await interviewsApi.list().catch(() => null);

  return (
    <>
      <div className="mb-5 pt-2 sm:pt-3">
        <h1 className="recruiter-page-title">AI Interview</h1>
        <p className="mt-1 text-[13.5px] leading-[1.4] text-[#5e6670]">Your interview invites, progress, and reports.</p>
      </div>

      {interviews === null ? (
        <p className="border border-[#e4e5e8] bg-white p-10 text-center text-sm text-[#767f8c]">Couldn&apos;t load your interviews. Please refresh the page.</p>
      ) : interviews.length === 0 ? (
        <div className="border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f0fa] text-[#0a65cc]">
            <Video size={22} aria-hidden />
          </div>
          <h3 className="mb-1.5 text-lg font-bold text-[#18191c]">No interviews yet</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#767f8c]">When a recruiter invites you to an AI interview, it shows up here and in your messages.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {interviews.map((interview) => (
            <div key={interview.id} className="flex flex-col border border-[#e4e5e8] bg-white sm:flex-row sm:items-center">
              <Link
                href={interview.status === 'COMPLETED' ? interviewReportPath(interview.id) : aiInterviewPath(interview.id)}
                className="flex min-w-0 flex-1 items-center gap-4 p-4 transition-colors hover:bg-[#f8fafc]"
              >
                <CompanyMark company={interview.job.company.name} logoUrl={interview.job.company.logoUrl} className="h-12 w-12 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#18191c]">{interview.job.title}</p>
                  <p className="truncate text-[13px] text-[#767f8c]">
                    {interview.job.company.name} •{' '}
                    {interview.status === 'COMPLETED' && interview.completedAt
                      ? `Completed ${formatDate(interview.completedAt)}`
                      : `Expires ${formatDate(interview.expiresAt)}`}
                  </p>
                </div>
                <span className={`border px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide ${STATUS_TONE[interview.status]}`}>
                  {STATUS_LABELS[interview.status]}
                </span>
                <ArrowRight size={18} className="shrink-0 text-[#767f8c]" aria-hidden />
              </Link>
              {interview.status === 'COMPLETED' && (
                <div className="border-t border-[#f1f2f4] px-4 pb-4 pt-3 sm:border-t-0 sm:py-0 sm:pl-0">
                  <ResetInterviewButton interviewId={interview.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
