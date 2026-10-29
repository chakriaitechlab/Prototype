import { Suspense } from 'react';
import { Briefcase, Globe, Layers, MapPin, Star, Users } from 'lucide-react';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { JobDetail } from '@/types/jobs';
import { companyName, expiryLabel, jobLocation } from '@/utils/job-detail';
import { JobApplyAction, JobApplyActionFallback } from './JobApplyAction';
import { CompanyVerification } from './JobCompanyCard';
import { JobShareButton } from './JobShareButton';

const CHIP_ICON = { size: 15, 'aria-hidden': true } as const;

type JobDetailHeaderProps = { job: JobDetail; url: string; posted: string };

export function JobDetailHeader({ job, url, posted }: JobDetailHeaderProps) {
  const company = companyName(job);

  return (
    <header className="jp-jd-header">
      <div className="jp-jd-head">
        <CompanyMark company={company} logoUrl={job.company?.logoUrl} className="jp-jd-logo" />

        <div className="jp-jd-head-main">
          <div className="jp-jd-company">
            <strong>{company}</strong>
            {job.company && <CompanyVerification verified={job.company.isVerified} compact />}
            <span aria-hidden>·</span>
            <span>{posted}</span>
          </div>

          <h1 className="jp-jd-title">{job.title}</h1>

          <div className="jp-jd-chips">
            <span className="jp-jd-chip jp-jd-chip--primary">
              <Briefcase {...CHIP_ICON} />
              {job.employmentType ?? 'Full-time'}
            </span>
            <span className="jp-jd-chip">
              {job.isRemote ? <Globe {...CHIP_ICON} /> : <MapPin {...CHIP_ICON} />}
              {jobLocation(job)}
            </span>
            {job.jobLevel && (
              <span className="jp-jd-chip">
                <Layers {...CHIP_ICON} />
                {job.jobLevel}
              </span>
            )}
            <span className="jp-jd-chip">
              <Users {...CHIP_ICON} />
              {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
            </span>
            {job.featured && (
              <span className="jp-jd-chip jp-jd-chip--featured">
                <Star {...CHIP_ICON} />
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="jp-jd-head-actions">
          <div className="jp-jd-head-buttons">
            <JobShareButton url={url} title={`${job.title} at ${company}`} />
            <Suspense fallback={<JobApplyActionFallback placement="header" />}>
              <JobApplyAction job={job} placement="header" />
            </Suspense>
          </div>
          {job.deadline && <small>Apply before {expiryLabel(job.deadline)}</small>}
        </div>
      </div>
    </header>
  );
}
