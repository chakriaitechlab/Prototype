import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { HiringCompany } from '@/types/jobs';

export function TopCompaniesSection({ topCompanies }: { topCompanies: HiringCompany[] }) {
  if (topCompanies.length === 0) return null;

  return (
    <section className="jp-section">
      <div className="jp-container">
        <div className="jp-section-head">
          <h2 className="jp-section-title">Top companies</h2>
          <Link href="/employers" className="jp-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="jp-company-grid">
          {topCompanies.slice(0, 6).map((company) => (
            <article key={company.name} className="jp-company">
              <div className="jp-company-top">
                <CompanyMark
                  company={company.name}
                  logoUrl={company.logoUrl}
                  className="jp-company-logo"
                />
                <div>
                  <h3>
                    {company.name}{' '}
                    {company.featured ? <span className="jp-badge jp-badge--featured">Featured</span> : null}
                  </h3>
                  <p className="jp-company-loc">
                    <MapPin size={14} /> {company.location}
                  </p>
                </div>
              </div>
              <Link
                href={`/jobs?company=${encodeURIComponent(company.name)}`}
                className="jp-btn jp-btn--soft jp-btn--block"
              >
                Open Position ({company.positions})
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
