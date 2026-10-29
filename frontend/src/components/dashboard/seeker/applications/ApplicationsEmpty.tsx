import Link from 'next/link';
import { ArrowRight, Briefcase, Search } from 'lucide-react';

export function ApplicationsEmpty() {
  return (
    <div className="bg-white rounded-lg border border-[#e4e5e8] p-10 sm:p-14 text-center my-4">
      <div className="w-12 h-12 mx-auto mb-3.5 rounded-full bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center">
        <Briefcase size={22} className="text-[#0a65cc]" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#18191c] tracking-tight mb-1.5">
        No applications submitted yet
      </h3>
      <p className="text-sm text-[#767f8c] max-w-md mx-auto leading-relaxed mb-6">
        Browse open positions, discover jobs tailored to your profile, and start applying today.
      </p>
      <Link
        href="/dashboard/seeker/jobs"
        className="jp-btn jp-btn--primary"
        style={{
          height: '44px',
          padding: '0 1.5rem',
          fontSize: '0.9375rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Search size={16} />
        <span>Find jobs</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
