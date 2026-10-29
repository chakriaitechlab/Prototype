import Link from 'next/link';
import { Search, Users } from 'lucide-react';
import type { ApplicantFilter } from '@/types/hire';
import { jobApplicantsPath } from '@/utils/routes';

const OUTLINE_BUTTON = 'jp-btn jp-btn--outline h-11! px-5! text-[0.9375rem]!';

interface ApplicantsEmptyProps {
  jobId: string;
  hasApplicants: boolean;
  status?: ApplicantFilter;
  search: string;
}

export function ApplicantsEmpty({ jobId, hasApplicants, status, search }: ApplicantsEmptyProps) {
  if (!hasApplicants) {
    return (
      <EmptyCard
        icon={<Users size={22} aria-hidden />}
        highlight
        title="No applicants yet"
        description="Nobody has applied to this job yet. Applicants appear here as soon as job seekers apply."
      />
    );
  }

  return (
    <EmptyCard
      icon={<Search size={22} aria-hidden />}
      title="No applicants found"
      description={search ? `No applicants matched “${search}”. Try a different name or clear the filters.` : 'No applicants match this status yet.'}
    >
      <Link href={jobApplicantsPath(jobId)} className={OUTLINE_BUTTON}>
        Show all applicants
      </Link>
      {search && status && (
        <Link href={jobApplicantsPath(jobId, { status })} className={OUTLINE_BUTTON}>
          Clear search
        </Link>
      )}
    </EmptyCard>
  );
}

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  children?: React.ReactNode;
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
      <p className="mx-auto max-w-md text-sm leading-relaxed text-[#767f8c]">{description}</p>
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}
