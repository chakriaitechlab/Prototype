import { Suspense } from 'react';
import type { Metadata } from 'next';
import { companyApi } from '@/lib/company';
import { requireDashboard } from '@/utils/session';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import { CompanyProfileSkeleton } from '@/components/dashboard/recruiter/company-profile/CompanyProfileSkeleton';
import { CompanyProfileView } from '@/components/dashboard/recruiter/company-profile/CompanyProfileView';

export const metadata: Metadata = {
  title: 'Company Profile | Recruiter Dashboard | Chakri.ai',
  description: 'Manage your company identity, founding details, office locations, and public branding.',
};

async function CompanyProfileLoader() {
  const user = await requireDashboard('RECRUITER');
  const company = await companyApi.get().catch(() => null);

  if (!company) {
    return (
      <div className="cdash-empty">
        Couldn&apos;t load company profile. <RetryButton />
      </div>
    );
  }

  return <CompanyProfileView company={company} user={user} />;
}

export default function RecruiterCompanyProfilePage() {
  return (
    <Suspense fallback={<CompanyProfileSkeleton />}>
      <CompanyProfileLoader />
    </Suspense>
  );
}
