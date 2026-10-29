import Image from 'next/image';
import { SignupLink } from '@/components/homepage/SignupLink';

export function CtaBannersSection() {
  return (
    <section className="jp-section">
      <div className="jp-container">
        <div className="jp-cta-grid">
          {/* Candidate CTA */}
          <div className="jp-cta jp-cta--candidate">
            <div className="jp-cta-copy">
              <h2>Become a Candidate</h2>
              <p>
                Build an AI-ready profile, discover roles that fit your skills, and apply across Bangladesh with confidence.
              </p>
              <SignupLink
                label="Register Now"
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

          {/* Employer CTA */}
          <div className="jp-cta jp-cta--employer">
            <div className="jp-cta-copy">
              <h2>Become an Employer</h2>
              <p>
                Post jobs, screen with AI, and hire faster with explainable shortlists built for Bangladesh teams.
              </p>
              <SignupLink
                label="Register Now"
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
  );
}
