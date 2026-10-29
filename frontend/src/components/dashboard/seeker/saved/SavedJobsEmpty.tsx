import Link from 'next/link';
import { ArrowRight, Bookmark, Search } from 'lucide-react';

export function SavedJobsEmpty() {
  return (
    <div className="bg-white rounded-lg border border-[#e4e5e8] p-10 sm:p-14 text-center my-4">
      <div className="w-12 h-12 mx-auto mb-3.5 rounded-full bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center">
        <Bookmark size={22} className="text-[#0a65cc]" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#18191c] tracking-tight mb-1.5">
        No favorite jobs saved yet
      </h3>
      <p className="text-sm text-[#767f8c] max-w-md mx-auto leading-relaxed mb-6">
        Browse open positions and click the bookmark icon on any job card to save it here for quick review and applying.
      </p>
      <Link
        href="/dashboard/seeker/jobs"
        className="jp-btn jp-btn--primary inline-flex items-center gap-2"
        style={{ height: '44px', padding: '0 1.5rem', fontSize: '0.9375rem' }}
      >
        <Search size={16} />
        <span>Find and bookmark jobs</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
