import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CompanyProfileDone() {
  return (
    <div className="cco-setup cco-setup--done">
      <div className="cco-done">
        <div className="cco-done-mark" aria-hidden>
          <svg viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="36" fill="#e7f0fa" />
            <path d="M22 37.5l7.5 7.5L38 36" stroke="#0a65cc" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M34 37.5l7.5 7.5L54 32" stroke="#0a65cc" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Congratulations, Your profile is 100% complete!</h1>
        <p>
          Your company profile is ready for hiring. Jump into the dashboard to manage candidates, or post your first
          job to the marketplace.
        </p>
        <div className="cco-done-actions">
          <Link href="/dashboard/recruiter" className="cset-btn-secondary">
            View Dashboard
          </Link>
          <Link href="/dashboard/recruiter/post" className="cset-btn-primary">
            Post Job <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
