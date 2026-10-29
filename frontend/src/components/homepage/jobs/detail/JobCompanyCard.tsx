import Link from 'next/link';
import { BadgeCheck, ExternalLink, ShieldAlert } from 'lucide-react';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { JobDetailCompany } from '@/types/jobs';
import { companyProfilePath } from '@/utils/routes';

export function CompanyVerification({ verified, compact = false }: { verified: boolean; compact?: boolean }) {
  if (verified) {
    return (
      <span className="jp-jd-verified" title="Verified employer">
        <BadgeCheck size={compact ? 17 : 15} aria-hidden />
        {compact ? <span className="sr-only">Verified employer</span> : 'Verified employer'}
      </span>
    );
  }

  return (
    <span className="jp-jd-unverified" title="This employer has not been verified yet">
      <ShieldAlert size={13} aria-hidden />
      Unverified
    </span>
  );
}

export function JobCompanyCard({ company }: { company: JobDetailCompany }) {
  return (
    <div className="jp-jd-card jp-jd-company-card">
      <h3>About the employer</h3>
      <div className="jp-jd-company-row">
        <CompanyMark company={company.name} logoUrl={company.logoUrl} className="jp-jd-company-logo" />
        <div>
          <strong>{company.name}</strong>
          <CompanyVerification verified={company.isVerified} />
        </div>
      </div>
      {company.username && (
        <Link href={companyProfilePath(company.username)} className="jp-btn jp-btn--outline jp-btn--block jp-jd-company-link">
          View company profile <ExternalLink size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
}
