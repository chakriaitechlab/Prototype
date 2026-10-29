import Link from 'next/link';
import { CheckCircle2, ClipboardCheck, Clock3, FileText, Upload, UserRound, XCircle } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { HireApplicant } from '@/types/hire';
import { formatDate } from '@/utils/format';
import { candidateProfilePath, interviewReportPath } from '@/utils/routes';
import { ApplicantActions } from './ApplicantActions';

const DAY_MS = 86_400_000;
const ACTION_BUTTON =
  'inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-[#e4e5e8] bg-white px-3.5 text-[14px] font-semibold text-[#374151] transition-colors hover:border-[#0a65cc] hover:bg-[#f8fafc] hover:text-[#0a65cc]';

interface ApplicantsTableProps {
  jobId: string;
  jobTitle: string;
  applicants: HireApplicant[];
}

export function ApplicantsTable({ jobId, jobTitle, applicants }: ApplicantsTableProps) {
  return (
    <table className="cdash-table">
      <thead>
        <tr>
          <th>Applicant</th>
          <th>CV</th>
          <th>Status</th>
          <th className="is-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {applicants.map((applicant) => (
          <ApplicantRow key={applicant.id} jobId={jobId} jobTitle={jobTitle} applicant={applicant} />
        ))}
      </tbody>
    </table>
  );
}

function ApplicantRow({ jobId, jobTitle, applicant }: { jobId: string; jobTitle: string; applicant: HireApplicant }) {
  const { seeker } = applicant;
  const name = seeker.name || seeker.username || 'Candidate';
  const uploaded = applicant.applyMethod === 'upload';

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <UserAvatar
            src={seeker.avatarUrl}
            name={name}
            className="h-11 w-11 rounded-full text-[15px] font-semibold"
            fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
          />
          <div className="min-w-0">
            <div className="cdash-job-title">{name}</div>
            <div className="cdash-job-meta">
              {seeker.username ? `@${seeker.username} • ` : ''}Applied {formatDate(applicant.appliedAt)}
            </div>
          </div>
        </div>
      </td>
      <td>
        <span className="cdash-apps-count">
          {uploaded ? <Upload size={16} className="text-[#0a65cc]" aria-hidden /> : <FileText size={16} className="text-[#0a65cc]" aria-hidden />}
          {uploaded ? 'Uploaded CV' : 'Profile CV'}
        </span>
      </td>
      <td>
        <ApplicantStatus applicant={applicant} />
      </td>
      <td className="is-right">
        <div className="cdash-row-actions">
          {applicant.cvUrl && (
            <a
              href={applicant.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_BUTTON}
              aria-label={`View ${name}'s CV`}
              title="View CV"
            >
              <FileText size={17} aria-hidden />
              <span>CV</span>
            </a>
          )}
          {seeker.username && (
            <Link
              href={candidateProfilePath(seeker.username)}
              target="_blank"
              className={ACTION_BUTTON}
              aria-label={`View ${name}'s profile`}
              title="View profile"
            >
              <UserRound size={17} aria-hidden />
              <span>Profile</span>
            </Link>
          )}
          {applicant.interview?.status === 'COMPLETED' && (
            <Link href={interviewReportPath(applicant.interview.id)} className={ACTION_BUTTON} title="View interview report">
              <ClipboardCheck size={17} aria-hidden />
              <span>Report</span>
            </Link>
          )}
          {applicant.status === 'SUBMITTED' && (
            <ApplicantActions
              jobId={jobId}
              jobTitle={jobTitle}
              applicationId={applicant.id}
              name={name}
              username={seeker.username}
              avatarUrl={seeker.avatarUrl}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

function ApplicantStatus({ applicant }: { applicant: HireApplicant }) {
  const { interview } = applicant;

  if (interview?.status === 'COMPLETED') {
    const score = interview.report?.status === 'READY' ? interview.report.overallScore : null;
    return (
      <div className="cdash-status justify-start!">
        <ClipboardCheck size={17} aria-hidden />
        <span>
          Interview done
          <span className="mt-0.5 block text-[11.5px] font-normal text-[#9ca3af]">
            {score === null ? 'Report in progress' : `Score ${Math.round(score)} / 100`}
          </span>
        </span>
      </div>
    );
  }

  if (applicant.status === 'VOICE_INTERVIEW') {
    return (
      <div className="cdash-status justify-start!">
        <CheckCircle2 size={17} aria-hidden />
        <span>
          {interview?.status === 'IN_PROGRESS' ? 'Interviewing' : 'Invited'}
          <span className="mt-0.5 block text-[11.5px] font-normal text-[#9ca3af]">{expiryLabel(interview?.expiresAt ?? null)}</span>
        </span>
      </div>
    );
  }

  if (applicant.status === 'REJECTED') {
    return (
      <div className="cdash-status is-bad justify-start!">
        <XCircle size={17} aria-hidden />
        <span>Rejected</span>
      </div>
    );
  }

  return (
    <div className="cdash-status is-warn justify-start!">
      <Clock3 size={17} aria-hidden />
      <span>To review</span>
    </div>
  );
}

function expiryLabel(expiresAt: string | null) {
  if (!expiresAt) return '';
  const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS);
  if (daysLeft <= 0) return 'Invite expired';
  return `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
}
