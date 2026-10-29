import { Suspense } from 'react';
import { Clock } from 'lucide-react';
import type { JobDetail } from '@/types/jobs';
import { salaryPeriod, type JobTimeline } from '@/utils/job-detail';
import { JobApplyAction, JobApplyActionFallback } from './JobApplyAction';

export function JobApplyCard({ job, remaining }: { job: JobDetail; remaining: JobTimeline['remaining'] }) {
  return (
    <div className="jp-jd-card jp-jd-apply-card">
      <span className="jp-jd-label">Salary ({job.salaryCurrency ?? 'BDT'})</span>
      <strong className="jp-jd-salary">{job.salary ?? 'Not disclosed'}</strong>
      {job.salaryMode !== 'negotiable' && <span className="jp-jd-muted">{salaryPeriod(job)}</span>}

      <Suspense fallback={<JobApplyActionFallback placement="card" />}>
        <JobApplyAction job={job} placement="card" />
      </Suspense>

      {remaining && (
        <p className="jp-jd-remaining">
          <Clock size={16} aria-hidden /> {remaining}
        </p>
      )}
    </div>
  );
}
