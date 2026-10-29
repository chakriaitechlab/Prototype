import Link from 'next/link';
import { ArrowRight, CheckCircle2, Pencil, Users, X } from 'lucide-react';
import type { HireJob } from '@/types/hire';
import { formatCount, formatDate } from '@/utils/format';
import { jobApplicantsPath } from '@/utils/routes';
import { JobRowMenu } from './JobRowMenu';

const LISTING_DAYS = 30;
const DAY_MS = 86_400_000;

export function JobsTable({ jobs }: { jobs: HireJob[] }) {
  return (
    <table className="cdash-table">
      <thead>
        <tr>
          <th>Jobs</th>
          <th>Status</th>
          <th>Applications</th>
          <th className="is-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </tbody>
    </table>
  );
}

function JobRow({ job }: { job: HireJob }) {
  const expired = isExpiredStatus(job.status);
  const draft = job.status === 'DRAFT';

  return (
    <tr>
      <td>
        <div className="cdash-job-title">{job.title || 'Untitled role'}</div>
        <div className="cdash-job-meta">
          {jobTypeLabel(job.employmentType)} • {remainingLabel(job)}
        </div>
      </td>
      <td>
        <div className={`cdash-status${expired ? ' is-bad' : draft ? ' is-warn' : ''}`}>
          {expired ? (
            <span className="cdash-status-badge is-expire" aria-hidden>
              <X size={11} strokeWidth={3} />
            </span>
          ) : draft ? (
            <span className="cdash-status-badge is-draft" aria-hidden>
              <Pencil size={10} strokeWidth={2.5} />
            </span>
          ) : (
            <CheckCircle2 className="cdash-status-tick" size={18} strokeWidth={2.25} aria-hidden />
          )}
          <span>{expired ? 'Expire' : draft ? 'Draft' : 'Active'}</span>
        </div>
      </td>
      <td>
        <span className="cdash-apps-count">
          <Users size={16} aria-hidden />
          {formatCount(job.applicantCount)} Application{job.applicantCount === 1 ? '' : 's'}
        </span>
      </td>
      <td className="is-right">
        <div className="cdash-row-actions">
          <Link href={jobApplicantsPath(job.id)} className="cdash-row-btn">
            View Applications
            <ArrowRight size={16} strokeWidth={2.25} className="cdash-row-btn-arrow" aria-hidden />
          </Link>
          <JobRowMenu job={job} />
        </div>
      </td>
    </tr>
  );
}

function isExpiredStatus(status: HireJob['status']) {
  return status === 'CLOSED' || status === 'PAUSED';
}

function jobTypeLabel(raw?: string | null) {
  const value = (raw ?? '').trim().toLowerCase();
  if (value.includes('part')) return 'Part Time';
  if (value.includes('intern')) return 'Internship';
  if (value.includes('contract')) return 'Contract';
  if (value.includes('temp')) return 'Temporary';
  return (raw ?? '').trim() || 'Full Time';
}

function remainingLabel(job: HireJob) {
  if (job.status === 'DRAFT') return 'Draft';

  const expiresAt = job.deadline ?? new Date(new Date(job.createdAt).getTime() + LISTING_DAYS * DAY_MS).toISOString();
  const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS);
  if (isExpiredStatus(job.status) || daysLeft < 0) return formatDate(expiresAt);
  if (daysLeft === 0) return 'Expires today';
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`;
}
