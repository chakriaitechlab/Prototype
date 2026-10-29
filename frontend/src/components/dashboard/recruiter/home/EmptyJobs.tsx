import { Briefcase } from 'lucide-react';
import { PostJobButton } from '@/components/dashboard/recruiter/PostJobButton';

export function EmptyJobs() {
  return (
    <div className="my-3 border border-[#e4e5e8] bg-white p-8 text-center sm:p-10">
      <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center bg-[#e7f0fa] text-[#0a65cc]">
        <Briefcase size={22} aria-hidden />
      </div>
      <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#18191c]">No jobs posted yet</h3>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#767f8c]">
        You haven&apos;t posted any jobs yet. Create and publish job openings to find and hire the best
        candidates for your company.
      </p>
      <PostJobButton />
    </div>
  );
}
