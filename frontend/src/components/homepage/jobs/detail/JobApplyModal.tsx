'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import type { ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FileText, Upload, X } from 'lucide-react';
import { MatchScoreButton } from '@/components/jobs/MatchScoreButton';
import { FormAlert } from '@/components/ui/FormAlert';
import { useMatchScores } from '@/hooks/useMatchScores';
import type { ApplyCvSource } from '@/types/jobs';
import { JobApplyCvOption } from './JobApplyCvOption';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_BYTES = 10 * 1024 * 1024;
const SEEKER_RESUME_PATH = '/dashboard/seeker/profile?tab=resume';

const noopSubscribe = () => () => {};

type JobApplyModalProps = {
  jobId: string;
  jobTitle: string;
  company: string;
  hasProfileCv: boolean;
  pending: boolean;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
};

export function JobApplyModal({ jobId, jobTitle, company, hasProfileCv, pending, onSubmit, onClose }: JobApplyModalProps) {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvSource, setCvSource] = useState<ApplyCvSource>(hasProfileCv ? 'profile' : 'upload');
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<{ error?: string }>({});
  const matchScore = useMatchScores([jobId])[jobId];

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, pending]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setClientError({});
    if (!ALLOWED_EXTENSIONS.some((ext) => selected.name.toLowerCase().endsWith(ext))) {
      setClientError({ error: 'Only PDF or DOCX files are allowed.' });
      event.target.value = '';
      return;
    }
    if (selected.size > MAX_BYTES) {
      setClientError({ error: 'File must be 10 MB or smaller.' });
      event.target.value = '';
      return;
    }
    setFile(selected);
    setCvSource('upload');
  };

  const handleSubmit = () => {
    if (cvSource === 'upload' && !file) {
      setClientError({ error: 'Please upload a CV/Resume first.' });
      return;
    }
    const data = new FormData();
    data.set('cvSource', cvSource);
    if (cvSource === 'upload' && file) data.set('file', file);
    onSubmit(data);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <FormAlert message={clientError.error} trigger={clientError} />
      <div
        role="presentation"
        onClick={pending ? undefined : onClose}
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-apply-title"
          onClick={(event) => event.stopPropagation()}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-none border border-slate-300 bg-white p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 sm:px-7 sm:py-5">
            <div className="min-w-0">
              <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-none border border-blue-300 bg-blue-50/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#0a65cc]">
                <span className="h-1.5 w-1.5 rounded-none bg-[#0a65cc]" />
                Apply to job
              </span>
              <h4 id="job-apply-title" className="m-0 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {jobTitle}
              </h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="text-[13px] text-slate-500">{company}</span>
                <MatchScoreButton opportunityId={jobId} matchScore={matchScore} size="xs" />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              aria-label="Close"
              className="shrink-0 cursor-pointer rounded-none border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-white p-6 sm:p-7">
            <p className="m-0 mb-3 text-xs leading-relaxed text-slate-500">
              {cvSource === 'upload'
                ? 'Upload a CV for this job, then confirm your application.'
                : 'Use your profile CV (already matched) and confirm your application.'}
            </p>

            <div role="radiogroup" aria-label="CV source" className="mb-4 space-y-2.5">
              <JobApplyCvOption
                selected={cvSource === 'profile'}
                disabled={!hasProfileCv}
                icon={FileText}
                title="Profile CV/Resume"
                description={hasProfileCv ? 'Use your saved profile CV (default).' : 'No profile CV yet. Upload one in CV settings.'}
                onSelect={() => setCvSource('profile')}
              />

              <JobApplyCvOption
                selected={cvSource === 'upload'}
                icon={Upload}
                title="Upload a different CV/Resume"
                description="Submit a custom file for this application only. Your profile CV stays unchanged."
                onSelect={() => setCvSource('upload')}
              >
                <label
                  htmlFor={fileInputId}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#0a65cc] hover:bg-blue-50/30"
                >
                  <Upload size={13} aria-hidden />
                  <span>{file ? 'Change file' : 'Choose file'}</span>
                </label>
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  className="hidden"
                  onClick={(event) => event.stopPropagation()}
                  onChange={handleFileChange}
                />
                {file && <div className="mt-2 truncate text-xs font-semibold text-emerald-600">{file.name}</div>}
              </JobApplyCvOption>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="w-full cursor-pointer rounded-none border border-[#084ea3] bg-[#0a65cc] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#084ea3] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
            >
              {pending ? 'Submitting…' : 'Confirm Apply'}
            </button>

            <p className="m-0 mt-3 text-center text-[11px] text-slate-500">
              Update your default CV in{' '}
              <Link href={SEEKER_RESUME_PATH} className="font-semibold text-[#0a65cc] hover:underline">
                CV settings
              </Link>{' '}
              if needed.
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
