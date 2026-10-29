import Link from 'next/link';
import { ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import type { InterviewReport } from '@/types/interviews';
import { formatDate } from '@/utils/format';
import { formatDuration } from '@/utils/interviews';
import { aiInterviewPath, chatPath, jobApplicantsPath, SEEKER_AI_INTERVIEW_PATH } from '@/utils/routes';
import { InterviewTopBar } from '../InterviewTopBar';
import { ResetInterviewButton } from '../ResetInterviewButton';
import { QuestionAnswerList } from './QuestionAnswerList';
import { ReportPending } from './ReportPending';
import { ScoreSummary } from './ScoreSummary';
import { SkillBreakdown } from './SkillBreakdown';
import { StrengthsCard } from './StrengthsCard';

export function ReportContent({ data }: { data: InterviewReport }) {
  const { viewerRole, interview, job, candidate, report, turns } = data;
  const recruiter = viewerRole === 'RECRUITER';
  const candidateName = candidate.name ?? candidate.username ?? 'Candidate';
  const meta = [
    candidateName,
    job.title,
    interview.completedAt ? formatDate(interview.completedAt) : null,
    formatDuration(interview.durationSeconds),
  ].filter(Boolean);

  return (
    <>
      <InterviewTopBar context={`${job.title} · ${job.company}`} />
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-8">
        <Link
          href={recruiter ? jobApplicantsPath(job.id) : SEEKER_AI_INTERVIEW_PATH}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a65cc] hover:underline"
        >
          <ArrowLeft size={14} aria-hidden />
          {recruiter ? 'Back to applicants' : 'All interviews'}
        </Link>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            {interview.status === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 border border-[#bfe3c7] bg-[#eaf6ec] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-[#1e7e34]">
                <CheckCircle2 size={13} aria-hidden />
                Interview completed
              </span>
            )}
            <h1 className="recruiter-page-title mt-2">AI Interview Report</h1>
            <p className="mt-1 text-[13.5px] text-[#5e6670]">{meta.join(' • ')}</p>
          </div>
          {recruiter && candidate.username && (
            <Link href={chatPath('RECRUITER', candidate.username)} className="jp-btn jp-btn--outline h-11! px-4! text-sm!">
              <MessageSquare size={17} aria-hidden />
              Message candidate
            </Link>
          )}
          {!recruiter && interview.status === 'COMPLETED' && <ResetInterviewButton interviewId={interview.id} />}
        </div>

        {interview.status !== 'COMPLETED' ? (
          <div className="border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
            <h3 className="mb-1.5 text-lg font-bold text-[#18191c]">No report yet</h3>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#767f8c]">
              {recruiter ? "The candidate hasn't completed this interview yet." : "This interview hasn't been completed yet, so there's no report."}
            </p>
            {!recruiter && (
              <Link href={aiInterviewPath(interview.id)} className="jp-btn jp-btn--primary h-11! px-5! text-sm!">
                Go to interview
              </Link>
            )}
          </div>
        ) : !report || report.status !== 'READY' ? (
          <ReportPending failed={report?.status === 'FAILED'} />
        ) : (
          <>
            <div className="mb-5 grid gap-5 lg:grid-cols-2">
              <ScoreSummary
                score={report.overallScore ?? 0}
                verdict={report.verdict}
                summary={report.summary}
                warnings={interview.warnings}
                endReason={interview.endReason}
              />
              <SkillBreakdown skills={report.skillScores} />
            </div>
            <div className="mb-5 grid gap-5 lg:grid-cols-2">
              <StrengthsCard tone="good" items={report.strengths} />
              <StrengthsCard tone="improve" items={report.weaknesses} />
            </div>
            <QuestionAnswerList turns={turns} />
          </>
        )}
      </div>
    </>
  );
}
