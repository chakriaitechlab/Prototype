import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { govtJobsApi } from '@/lib/govt-jobs';
import { GovtJobDetailView } from '@/components/homepage/jobs/govt/detail/GovtJobDetailView';
import { govtJobPostingJsonLd } from '@/utils/govt-job-detail';
import { govtJobDetailPath } from '@/utils/routes';
import { SITE_URL } from '@/utils/public-profile';

export const instant = false;

interface GovtJobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GovtJobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await govtJobsApi.job(id);

  if (!job) {
    return {
      title: 'বিজ্ঞপ্তি পাওয়া যায়নি | Chakri.ai',
      description: 'This government job circular is no longer available on Chakri.ai.',
      robots: { index: false, follow: true },
    };
  }

  const title = `${job.title} — ${job.organizationName} | Chakri.ai`;
  const description = `${job.organizationName}-এর ${job.title} পদের সরকারি চাকরির বিজ্ঞপ্তি: যোগ্যতা, শর্তাবলী, আবেদন প্রক্রিয়া ও প্রয়োজনীয় কাগজপত্র।`;
  const url = govtJobDetailPath(job.id);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', title, description, url, siteName: 'Chakri.ai' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function GovtJobDetailPage({ params }: GovtJobDetailPageProps) {
  const { id } = await params;
  const job = await govtJobsApi.job(id);
  if (!job) notFound();

  const url = `${SITE_URL}${govtJobDetailPath(job.id)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(govtJobPostingJsonLd(job, url)).replace(/</g, '\\u003c') }}
      />
      <GovtJobDetailView job={job} url={url} />
    </>
  );
}
