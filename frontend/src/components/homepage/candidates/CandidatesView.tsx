import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Briefcase, FileText, Mic, Search, Send, Upload, UserRound } from 'lucide-react';
import { FreshJobsSection } from './FreshJobsSection';
import { FreshJobsSkeleton } from './FreshJobsSkeleton';
import { SignupLink } from '@/components/homepage/SignupLink';

const FEATURES = [
  {
    title: 'Smart Apply',
    desc: 'Queue roles you like and let Chakri apply with tailored materials for each one.',
    icon: Send,
  },
  {
    title: 'CV Tailor',
    desc: 'One master CV, automatically adapted to every job description you target.',
    icon: FileText,
  },
  {
    title: 'Interview Prep',
    desc: 'Practice with AI mock interviews and get instant, actionable feedback.',
    icon: Mic,
  },
  {
    title: 'Job Alerts',
    desc: 'Get notified the moment a matching role goes live — never miss a deadline.',
    icon: Bell,
  },
];

const STEPS = [
  {
    title: 'Create free account',
    desc: 'Sign up with email or Google — it takes less than a minute.',
    icon: UserRound,
    active: false,
  },
  {
    title: 'Upload your CV',
    desc: 'Chakri parses your skills and experience for smarter matching.',
    icon: Upload,
    active: true,
  },
  {
    title: 'Get matched roles',
    desc: 'Browse AI-ranked jobs that actually fit your profile.',
    icon: Search,
    active: false,
  },
  {
    title: 'Apply & track',
    desc: 'Apply with one click and follow every application in your dashboard.',
    icon: Briefcase,
    active: false,
  },
];

export function CandidatesView() {
  return (
    <>
      {/* Hero Section */}
      <section className="jp-hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="jp-container">
          <div className="jp-hero-grid">
            <div className="jp-hero-copy">
              <h1>Your AI copilot for landing the right job.</h1>
              <p>
                Chakri.ai tailors your CV for every role, applies smartly on your behalf, and preps you for interviews — across Dhaka and remote opportunities.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <SignupLink
                  label="Create Free Account"
                  href="/auth/signup?role=seeker"
                  withArrow
                  className="jp-btn jp-btn--primary"
                />
                <Link href="/jobs" className="jp-btn jp-btn--outline">
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="jp-section">
        <div className="jp-container">
          <h2 className="jp-section-title jp-section-title--center">
            Everything you need to get hired
          </h2>
          <div className="jp-cat-grid">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="jp-cat">
                  <div className="jp-cat-icon">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="jp-section jp-section--muted">
        <div className="jp-container">
          <h2 className="jp-section-title jp-section-title--center">
            How it works for candidates
          </h2>
          <div className="jp-how-grid">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className={`jp-how-step${step.active ? ' is-active' : ''}`}
                >
                  <span className="jp-how-step-badge">Step 0{index + 1}</span>
                  <div className="jp-how-icon">
                    <Icon size={26} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fresh Jobs (Live Server Component) */}
      <Suspense fallback={<FreshJobsSkeleton />}>
        <FreshJobsSection />
      </Suspense>

      {/* Dual CTA */}
      <section className="jp-section">
        <div className="jp-container">
          <div className="jp-cta-grid">
            <div className="jp-cta jp-cta--candidate">
              <div className="jp-cta-copy">
                <h2>Become a Candidate</h2>
                <p>
                  Join thousands of candidates using Chakri.ai. It is free during our seed round — no card required.
                </p>
                <SignupLink
                  label="Register Now"
                  href="/auth/signup?role=seeker"
                  withArrow
                  className="jp-btn jp-btn--outline"
                  style={{ alignSelf: 'flex-start' }}
                />
              </div>
              <div className="jp-cta-art" aria-hidden>
                <Image
                  src="/jobpilot/undraw_my-resume_etai.svg"
                  alt=""
                  width={220}
                  height={280}
                  unoptimized
                />
              </div>
            </div>

            <div className="jp-cta jp-cta--employer">
              <div className="jp-cta-copy">
                <h2>Become an Employer</h2>
                <p>
                  Post jobs, screen with AI, and hire faster with explainable shortlists built for Bangladesh teams.
                </p>
                <SignupLink
                  label="Register Now"
                  href="/auth/signup?role=recruiter"
                  withArrow
                  className="jp-btn jp-btn--white"
                  style={{ alignSelf: 'flex-start' }}
                />
              </div>
              <div className="jp-cta-art" aria-hidden>
                <Image
                  src="/jobpilot/undraw_person-search_wuzp.svg"
                  alt=""
                  width={280}
                  height={220}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
