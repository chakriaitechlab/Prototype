import Link from 'next/link';
import { ArrowRight, Briefcase, Plus, Search } from 'lucide-react';
import type { HireJobStatus } from '@/types/hire';
import { JOB_STATUS_FILTERS } from '@/utils/job-posting';
import { myPostsPath, RECRUITER_POST_JOB_PATH } from '@/utils/routes';

const OUTLINE_BUTTON = 'jp-btn jp-btn--outline h-11! px-5! text-[0.9375rem]!';
const PRIMARY_BUTTON = 'jp-btn jp-btn--primary h-11! px-6! text-[0.9375rem]!';

interface MyPostsEmptyProps {
  hasJobs: boolean;
  status?: HireJobStatus;
  search: string;
}

export function MyPostsEmpty({ hasJobs, status, search }: MyPostsEmptyProps) {
  if (!hasJobs) {
    return (
      <EmptyCard
        icon={<Briefcase size={22} aria-hidden />}
        highlight
        title="No jobs posted yet"
        description="You haven't posted any jobs yet. Create and publish job openings to find and hire the best candidates for your company."
      >
        <PostJobLink />
      </EmptyCard>
    );
  }

  if (search) {
    const statusLabel = JOB_STATUS_FILTERS.find((filter) => filter.id === status)?.label.toLowerCase();
    return (
      <EmptyCard
        icon={<Search size={22} aria-hidden />}
        title="No jobs found"
        description={`No job postings matched “${search}”${statusLabel ? ` under ${statusLabel}` : ''}. Try searching with different keywords or clearing the filter.`}
      >
        <Link href={myPostsPath({ status })} className={OUTLINE_BUTTON}>
          Clear search
        </Link>
        {status && (
          <Link href={myPostsPath({})} className={OUTLINE_BUTTON}>
            Show all jobs
          </Link>
        )}
      </EmptyCard>
    );
  }

  return (
    <EmptyCard
      icon={<Briefcase size={22} aria-hidden />}
      title="No jobs match this status"
      description="No job postings match the selected filter. Try switching back to all jobs or create a new job post."
    >
      <Link href={myPostsPath({})} className={OUTLINE_BUTTON}>
        Clear filter
      </Link>
      <PostJobLink />
    </EmptyCard>
  );
}

function PostJobLink() {
  return (
    <Link href={RECRUITER_POST_JOB_PATH} className={PRIMARY_BUTTON}>
      <Plus size={16} aria-hidden />
      <span>Post a job</span>
      <ArrowRight size={16} aria-hidden />
    </Link>
  );
}

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  children: React.ReactNode;
}

function EmptyCard({ icon, title, description, highlight, children }: EmptyCardProps) {
  return (
    <div className="my-4 border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
      <div
        className={`mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full ${
          highlight ? 'bg-[#e7f0fa] text-[#0a65cc]' : 'bg-[#f1f2f4] text-[#767f8c]'
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#18191c] sm:text-xl">{title}</h3>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#767f8c]">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>
    </div>
  );
}
