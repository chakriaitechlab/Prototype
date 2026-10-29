import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { jobsApi } from '@/lib/jobs';
import { JobDetailView } from '@/components/homepage/jobs/detail/JobDetailView';
import { companyName, jobLocation, jobPostingJsonLd } from '@/utils/job-detail';
import { jobDetailPath } from '@/utils/routes';
import { SITE_URL } from '@/utils/public-profile';

export const instant = false;

const DESCRIPTION_LENGTH = 155;

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await jobsApi.job(id);

  if (!job) {
    return {
      title: 'Job Not Found | Chakri.ai',
      description: 'This job is no longer available on Chakri.ai.',
      robots: { index: false, follow: true },
    };
  }

  const title = `${job.title} at ${companyName(job)} — ${jobLocation(job)} | Chakri.ai`;
  const summary = (job.description ?? '').replace(/[*_~#>`<>/-]/g, ' ').replace(/\s+/g, ' ').trim();
  const description =
    summary.length > DESCRIPTION_LENGTH
      ? `${summary.slice(0, DESCRIPTION_LENGTH).trim()}...`
      : summary || `${job.title} job at ${companyName(job)} on Chakri.ai.`;
  const url = jobDetailPath(job.id);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', title, description, url, siteName: 'Chakri.ai' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await jobsApi.job(id);
  if (!job) notFound();

  const url = `${SITE_URL}${jobDetailPath(job.id)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job, url)).replace(/</g, '\\u003c') }}
      />
      <JobDetailView job={job} url={url} />
    </>
  );
}
