import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PrivateJobCard } from '@/components/jobs/PrivateJobCard';
import { jobsApi } from '@/lib/jobs';
import { featuredJobs } from '@/utils/homepage';

const FRESH_JOBS_SHOWN = 6;
/** Extra jobs so enough featured ones can be picked, like the legacy page. */
const FRESH_JOBS_POOL = FRESH_JOBS_SHOWN * 3;

export async function FreshJobsSection() {
  const { items: jobs } = await jobsApi.publicList({ limit: FRESH_JOBS_POOL });
  const items = featuredJobs(jobs, FRESH_JOBS_SHOWN);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="jp-section">
      <div className="jp-container">
        <div className="jp-section-head">
          <h2 className="jp-section-title">Fresh jobs for you</h2>
          <Link href="/jobs" className="jp-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="jp-find-grid">
          {items.map((job) => (
            <PrivateJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
