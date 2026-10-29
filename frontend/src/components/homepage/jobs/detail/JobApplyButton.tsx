'use client';

import { startTransition, useActionState, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { applyJobAction } from '@/actions/jobs.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { JobApplicationInfo } from '@/types/jobs';
import { JobApplyModal } from './JobApplyModal';

type JobApplyButtonProps = {
  jobId: string;
  jobTitle: string;
  company: string;
  info: JobApplicationInfo;
};

export function JobApplyButton({ jobId, jobTitle, company, info }: JobApplyButtonProps) {
  const [state, formAction, pending] = useActionState(applyJobAction.bind(null, jobId), {});
  const [open, setOpen] = useState(false);
  const applied = state.data ?? info.application;

  const submit = (data: FormData) => startTransition(() => formAction(data));

  return (
    <>
      <FormAlert
        message={state.error ?? (state.data && `Application submitted. Reference: ${state.data.refNo}`)}
        type={state.error ? 'error' : 'success'}
        trigger={state}
      />

      {applied ? (
        <span className="jp-btn jp-btn--applied jp-jd-apply" role="status">
          <CheckCircle2 size={18} aria-hidden /> Applied
        </span>
      ) : (
        <button type="button" className="jp-btn jp-btn--primary jp-jd-apply" onClick={() => setOpen(true)}>
          Apply now <ArrowRight size={18} aria-hidden />
        </button>
      )}

      {open && !applied && (
        <JobApplyModal
          jobTitle={jobTitle}
          company={company}
          jobId={jobId}
          hasProfileCv={info.hasProfileCv}
          pending={pending}
          onSubmit={submit}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
