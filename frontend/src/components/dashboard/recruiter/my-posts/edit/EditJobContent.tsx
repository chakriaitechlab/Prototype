import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/client';
import { hireApi } from '@/lib/hire';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import { JobForm } from '@/components/dashboard/recruiter/job-form/JobForm';
import { jobToDraft } from '@/utils/job-posting';
import { RECRUITER_MY_POSTS_PATH } from '@/utils/routes';

export async function EditJobContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await hireApi.job(id).catch((err: unknown) => {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
    return null;
  });

  return (
    <>
      <div className="mb-5">
        <Link
          href={RECRUITER_MY_POSTS_PATH}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a65cc] hover:underline"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to My Posts
        </Link>
        <h1 className="cpost-title">Edit job</h1>
        <p className="text-sm text-[#5e6670]">
          {job ? `Update the details of “${job.title}”.` : 'Update the details of your vacancy.'}
        </p>
      </div>

      {job ? (
        <JobForm jobId={job.id} initial={jobToDraft(job)} />
      ) : (
        <div className="border border-[#e4e5e8] bg-white p-10 text-center">
          <p className="mb-4 text-sm text-[#767f8c]">Couldn&apos;t load this job. Please try again.</p>
          <RetryButton label="Retry" className="jp-btn jp-btn--outline h-[42px]! px-6! text-sm!" />
        </div>
      )}
    </>
  );
}
