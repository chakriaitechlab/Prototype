import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BarChart3, Check, Coins, Hexagon, Headset, MapPin, Sparkles, Building2 } from 'lucide-react';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { HiringCompany } from '@/types/jobs';

const JP_EMPLOYER = {
  hero: {
    badge: 'AI-Powered Recruitment',
    title: 'Hire the best talent in Bangladesh, faster.',
    description:
      'Post a job in minutes and let Chakri.ai screen, rank, and interview candidates with AI — so your team only talks to the best fits.',
  },
  heroStats: [
    { value: 'AI', label: 'Screening & shortlists' },
    { value: 'BD', label: 'Built for Bangladesh hiring' },
  ],
  trustedLabel: 'Hiring teams use Chakri.ai across Bangladesh',
  trustedBrands: [
    { name: 'ABCD', style: 'block' as const },
    { name: 'XYZ', style: 'token' as const },
    { name: 'PQRST', style: 'text' as const },
    { name: 'ACME', style: 'arch' as const },
  ],
  bento: {
    title: 'Why lead your hiring with Chakri.ai?',
    subtitle: 'Streamline your workflow with tools designed for high-performance teams.',
  },
  companies: {
    title: 'Top companies with open positions',
    subtitle: 'Browse employers hiring across Dhaka, Chattogram, and remote Bangladesh.',
  },
};

export function EmployersView({ companies }: { companies: HiringCompany[] }) {
  return (
    <>
      {/* 1. Hero Section (Exact Jobpilot Layout) */}
      <section className="jp-emp-hero">
        <div className="jp-container jp-emp-hero-grid">
          <div className="jp-emp-hero-copy">
            <div className="jp-emp-badge">
              <Sparkles size={14} fill="currentColor" />
              <span>{JP_EMPLOYER.hero.badge}</span>
            </div>
            <h1>{JP_EMPLOYER.hero.title}</h1>
            <p>{JP_EMPLOYER.hero.description}</p>

            <div className="jp-emp-actions">
              <Link href="/auth/login?role=recruiter" className="jp-btn jp-btn--primary">
                Post A Job <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="jp-btn jp-btn--soft">
                View Pricing
              </Link>
            </div>

            <div className="jp-emp-hero-stats">
              {JP_EMPLOYER.heroStats.map((stat, i) => (
                <div key={stat.label} className="jp-emp-hero-stat">
                  {i > 0 ? <span className="jp-emp-stat-divider" aria-hidden /> : null}
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="jp-emp-hero-art">
            <Image
              src="/jobpilot/undraw_hire_hadq.svg"
              alt="Hiring managers reviewing candidate profiles"
              width={898}
              height={399}
              priority
              unoptimized
              className="jp-emp-art-img"
            />
          </div>
        </div>
      </section>

      {/* 2. Trusted By Leading Teams Marquee Track */}
      <section className="jp-emp-trusted">
        <div className="jp-container">
          <p className="jp-emp-trusted-label">{JP_EMPLOYER.trustedLabel}</p>
        </div>
        <div className="jp-emp-marquee-shell">
          <div className="jp-emp-marquee-track">
            <div className="jp-emp-marquee-group">
              {[...JP_EMPLOYER.trustedBrands, ...JP_EMPLOYER.trustedBrands, ...JP_EMPLOYER.trustedBrands].map((brand, idx) => (
                <div key={`track1-${brand.name}-${idx}`} className="jp-emp-brand">
                  {brand.style === 'block' ? <span className="jp-emp-brand-block" /> : null}
                  {brand.style === 'token' ? <Hexagon size={32} strokeWidth={1.5} /> : null}
                  {brand.style === 'arch' ? <Building2 size={32} strokeWidth={1.5} /> : null}
                  <span className={`jp-emp-brand-name${brand.style === 'text' ? ' is-heavy' : ''}`}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="jp-emp-marquee-group" aria-hidden="true">
              {[...JP_EMPLOYER.trustedBrands, ...JP_EMPLOYER.trustedBrands, ...JP_EMPLOYER.trustedBrands].map((brand, idx) => (
                <div key={`track2-${brand.name}-${idx}`} className="jp-emp-brand">
                  {brand.style === 'block' ? <span className="jp-emp-brand-block" /> : null}
                  {brand.style === 'token' ? <Hexagon size={32} strokeWidth={1.5} /> : null}
                  {brand.style === 'arch' ? <Building2 size={32} strokeWidth={1.5} /> : null}
                  <span className={`jp-emp-brand-name${brand.style === 'text' ? ' is-heavy' : ''}`}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Companies with Open Positions */}
      <section className="jp-section">
        <div className="jp-container">
          <div className="jp-section-head">
            <div>
              <h2 className="jp-section-title">{JP_EMPLOYER.companies.title}</h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--jp-gray-500)', fontSize: '1rem' }}>
                {JP_EMPLOYER.companies.subtitle}
              </p>
            </div>
            <Link href="/jobs" className="jp-view-all">
              Browse jobs <ArrowRight size={16} />
            </Link>
          </div>

          {companies.length > 0 ? (
            <div className="jp-company-grid">
              {companies.map((company) => (
                <article key={company.name} className="jp-company">
                  <div className="jp-company-top">
                    <CompanyMark
                      company={company.name}
                      logoUrl={company.logoUrl}
                      className="jp-company-logo"
                    />
                    <div>
                      <h3>
                        {company.name}
                        {company.featured ? (
                          <span className="jp-badge jp-badge--featured">Featured</span>
                        ) : null}
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
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                background: 'var(--jp-white)',
                border: '1px solid var(--jp-gray-100)',
                borderRadius: 'var(--jp-radius-lg)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  background: 'var(--jp-primary-soft)',
                  color: 'var(--jp-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Building2 size={26} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                Explore Open Positions
              </h3>
              <p style={{ color: 'var(--jp-gray-500)', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
                Find verified employers hiring top talent across Bangladesh.
              </p>
              <Link href="/jobs" className="jp-btn jp-btn--primary">
                Browse All Jobs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Bento Grid Section (Exact Match to Legacy) */}
      <section className="jp-emp-bento-section">
        <div className="jp-container">
          <div className="jp-emp-bento-head">
            <h2>{JP_EMPLOYER.bento.title}</h2>
            <p>{JP_EMPLOYER.bento.subtitle}</p>
          </div>

          <div className="jp-emp-bento">
            {/* Card 1: Wide AI Talent Sourcing */}
            <article className="jp-emp-card jp-emp-card--wide">
              <div className="jp-emp-card-row">
                <div className="jp-emp-card-copy">
                  <h3>AI Talent Sourcing</h3>
                  <p>
                    Our algorithms scan thousands of Bangladesh profiles to find the exact match for your role in
                    seconds.
                  </p>
                  <ul>
                    <li>
                      <Check size={14} strokeWidth={2.5} aria-hidden />
                      Automated headhunting
                    </li>
                    <li>
                      <Check size={14} strokeWidth={2.5} aria-hidden />
                      Skill-based filtering
                    </li>
                  </ul>
                </div>
                <div className="jp-emp-card-visual" aria-hidden>
                  <BarChart3 size={64} strokeWidth={1.25} />
                </div>
              </div>
            </article>

            {/* Card 2: Dedicated Support */}
            <article className="jp-emp-card jp-emp-card--primary">
              <Headset className="jp-emp-card-watermark" size={160} strokeWidth={1} aria-hidden />
              <div>
                <h3>Dedicated Support</h3>
                <p>Our recruitment experts are available 24/7 to help you close positions faster.</p>
              </div>
              <Link href="/support" className="jp-emp-ghost-btn">
                Contact Expert
              </Link>
            </article>

            {/* Card 3: Smart Pricing */}
            <article className="jp-emp-card jp-emp-card--pricing">
              <Coins size={36} className="jp-emp-card-icon" aria-hidden />
              <h3>Smart Pricing</h3>
              <p>Pay only for results. No hidden fees or long-term contracts.</p>
            </article>

            {/* Card 4: Community with Avatars */}
            <article className="jp-emp-card jp-emp-card--community">
              <div className="jp-emp-avatars" aria-hidden>
                <span className="jp-emp-avatar">
                  <Image src="/jobpilot/avatar-1.jpg" alt="" width={64} height={64} />
                </span>
                <span className="jp-emp-avatar">
                  <Image src="/jobpilot/avatar-2.jpg" alt="" width={64} height={64} />
                </span>
                <span className="jp-emp-avatar">
                  <Image src="/jobpilot/avatar-3.jpg" alt="" width={64} height={64} />
                </span>
                <span className="jp-emp-avatar-more">+</span>
              </div>
              <div className="jp-emp-community-copy">
                <h3>Join a growing community</h3>
                <p>Reach Bangladesh candidates who are actively looking for their next role.</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
