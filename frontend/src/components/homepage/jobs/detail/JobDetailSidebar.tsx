import type { JobDetail } from '@/types/jobs';
import { companyName, type JobTimeline } from '@/utils/job-detail';
import { JobApplyCard } from './JobApplyCard';
import { JobCompanyCard } from './JobCompanyCard';
import { JobOverview } from './JobOverview';
import { JobShareLinks } from './JobShareLinks';

type JobDetailSidebarProps = { job: JobDetail; url: string; remaining: JobTimeline['remaining'] };

export function JobDetailSidebar({ job, url, remaining }: JobDetailSidebarProps) {
  return (
    <aside className="jp-jd-aside">
      <JobApplyCard job={job} remaining={remaining} />
      <JobOverview job={job} />
      {job.company && <JobCompanyCard company={job.company} />}

      <div className="jp-jd-card jp-jd-share-card">
        <h3>Share this job</h3>
        <JobShareLinks url={url} title={`${job.title} at ${companyName(job)}`} />
      </div>
    </aside>
  );
}
