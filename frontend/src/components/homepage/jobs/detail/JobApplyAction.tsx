import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SaveJobButton } from '@/components/jobs/SaveJobButton';
import { jobsApi } from '@/lib/jobs';
import type { JobApplicationInfo, JobDetail } from '@/types/jobs';
import { companyName } from '@/utils/job-detail';
import { getCurrentUser } from '@/utils/session';
import { JobApplyButton } from './JobApplyButton';
import { JobMatchLoginPrompt, JobMatchRing } from './JobMatchRing';

const SEEKER_LOGIN_PATH = '/auth/login?role=seeker';

const EMPTY_INFO: JobApplicationInfo = { application: null, hasProfileCv: false };

type Placement = 'header' | 'card';

export async function JobApplyAction({ job, placement }: { job: JobDetail; placement: Placement }) {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    const apply = (
      <Link href={SEEKER_LOGIN_PATH} className="jp-btn jp-btn--primary jp-jd-apply">
        Apply now <ArrowRight size={18} aria-hidden />
      </Link>
    );

    if (placement === 'header') return apply;

    return (
      <>
        <JobMatchLoginPrompt href={SEEKER_LOGIN_PATH} />
        <div className="jp-jd-apply-row">{apply}</div>
      </>
    );
  }

  if (user.role !== 'SEEKER') return null;

  const info = await jobsApi.application(job.id).catch(() => EMPTY_INFO);
  const save = <SaveJobButton jobId={job.id} variant="icon" jobType="private" />;
  const apply = <JobApplyButton jobId={job.id} jobTitle={job.title} company={companyName(job)} info={info} />;

  if (placement === 'header') {
    return (
      <>
        {save}
        {apply}
      </>
    );
  }

  return (
    <>
      <JobMatchRing jobId={job.id} />
      <div className="jp-jd-apply-row">
        {apply}
        {save}
      </div>
    </>
  );
}

export function JobApplyActionFallback({ placement }: { placement: Placement }) {
  const apply = (
    <span className="jp-btn jp-btn--soft jp-jd-apply" aria-busy="true">
      Apply now <ArrowRight size={18} aria-hidden />
    </span>
  );

  return placement === 'header' ? apply : <div className="jp-jd-apply-row">{apply}</div>;
}
