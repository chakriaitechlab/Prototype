import Image from 'next/image';
import Link from 'next/link';

const PHONE = '+880 9611-234567';
const ADDRESS = 'Gulshan, Dhaka 1212, Bangladesh';

const FOOTER_LINKS = {
  quick: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/support' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ],
  candidate: [
    { label: 'Jobs in Bangladesh', href: '/jobs' },
    { label: 'Jobs in Dhaka', href: '/jobs?location=Dhaka' },
    { label: 'Internships', href: '/jobs?type=INTERNSHIP' },
    { label: 'Remote jobs', href: '/jobs?type=REMOTE' },
    { label: 'All Jobs', href: '/jobs' },
    { label: 'Browse Companies', href: '/employers' },
  ],
  employers: [
    { label: 'Post a Job', href: '/auth/login' },
    { label: 'Browse Candidates', href: '/candidates' },
    { label: 'Employer Dashboard', href: '/onboarding/role' },
    { label: 'Applications', href: '/auth/login' },
  ],
  support: [
    { label: 'Faqs', href: '/support#faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
} as const;

export function Footer() {
  return (
    <footer className="jp-footer">
      <div className="jp-container">
        <div className="jp-footer-grid">
          {/* Brand & Contact Column */}
          <div className="jp-footer-brand">
            <Link href="/" className="jp-logo" aria-label="Chakri.ai home">
              <Image
                src="/jobpilot/chakri-logo-dark.png"
                alt="Chakri.ai"
                width={795}
                height={221}
                className="jp-logo-img jp-logo-img--md jp-logo-img--inverted"
                loading="eager"
              />
            </Link>
            <div className="jp-footer-contact">
              <a href={`tel:${PHONE.replace(/\s/g, '')}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
                </svg>
                Call now: {PHONE}
              </a>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {ADDRESS}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="jp-footer-col">
            <h4>Quick Link</h4>
            {FOOTER_LINKS.quick.map((link) => (
              <Link key={link.label} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Candidate Links */}
          <div className="jp-footer-col">
            <h4>Candidate</h4>
            {FOOTER_LINKS.candidate.map((link) => (
              <Link key={link.label} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Employer Links */}
          <div className="jp-footer-col">
            <h4>Employers</h4>
            {FOOTER_LINKS.employers.map((link) => (
              <Link key={link.label} href={link.href}>{link.label}</Link>
            ))}
          </div>

          {/* Support Links */}
          <div className="jp-footer-col">
            <h4>Support</h4>
            {FOOTER_LINKS.support.map((link) => (
              <Link key={link.label} href={link.href}>{link.label}</Link>
            ))}
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="jp-footer-bottom">
          <span>© 2026 Chakri.ai — Made in Dhaka</span>
          <div className="jp-footer-social">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
