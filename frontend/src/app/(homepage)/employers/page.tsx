import type { Metadata } from 'next';
import { EmployersView } from '@/components/homepage/employers/EmployersView';
import { jobsApi } from '@/lib/jobs';
import { hiringCompanies } from '@/utils/homepage';

const JOBS_LIMIT = 100;
const COMPANIES_SHOWN = 18;

export const metadata: Metadata = {
  title: 'For Employers — AI Hiring Platform | Chakri.ai',
  description:
    'Post jobs, screen candidates with AI, and hire faster with explainable shortlists built for Bangladesh teams.',
};

export default async function EmployersPage() {
  const { items } = await jobsApi.publicList({ limit: JOBS_LIMIT });

  return <EmployersView companies={hiringCompanies(items).slice(0, COMPANIES_SHOWN)} />;
}
