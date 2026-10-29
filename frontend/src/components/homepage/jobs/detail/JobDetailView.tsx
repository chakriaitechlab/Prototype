import type { JobDetail } from '@/types/jobs';
import { jobTimeline } from '@/utils/job-detail';
import { JobDescription } from './JobDescription';
import { JobDetailHeader } from './JobDetailHeader';
import { JobDetailSidebar } from './JobDetailSidebar';
import { JobKeyFacts } from './JobKeyFacts';

export async function JobDetailView({ job, url }: { job: JobDetail; url: string }) {
  const { posted, remaining } = await jobTimeline(job.createdAt, job.deadline);

  return (
    <section className="jp-jd">
      <div className="jp-jd-hero">
        <div className="jp-container">
          <JobDetailHeader job={job} url={url} posted={posted} />
          <JobKeyFacts job={job} remaining={remaining} />
        </div>
      </div>

      <div className="jp-container jp-jd-grid">
        <JobDescription job={job} />
        <JobDetailSidebar job={job} url={url} remaining={remaining} />
      </div>
    </section>
  );
}
