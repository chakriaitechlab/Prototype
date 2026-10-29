'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import { getSavedJobIds, getServerSavedJobIds, subscribeSavedJobs, toggleSavedJob } from '@/utils/saved-jobs';
import { toggleSaveJobAction } from '@/actions/jobs.actions';

const LABELS = {
  icon: { saved: 'Job saved', removed: 'Removed from saved' },
  labeled: { saved: 'চাকরি সেভ করা হয়েছে', removed: 'সেভ তালিকা থেকে সরানো হয়েছে' },
} as const;

type SaveJobButtonProps = {
  jobId: string;
  variant: keyof typeof LABELS;
  jobType?: 'private' | 'govt';
};

export function SaveJobButton({ jobId, variant, jobType }: SaveJobButtonProps) {
  const savedIds = useSyncExternalStore(subscribeSavedJobs, getSavedJobIds, getServerSavedJobIds);
  const [notice, setNotice] = useState<{ message: string; type?: 'error' | 'success' }>();
  const [, startTransition] = useTransition();
  const saved = savedIds.includes(jobId);

  const toggle = () => {
    const nowSaved = toggleSavedJob(jobId);
    setNotice({
      message: nowSaved ? LABELS[variant].saved : LABELS[variant].removed,
      type: 'success',
    });

    const resolvedType = jobType ?? (/^\d+$/.test(jobId) || variant === 'labeled' ? 'govt' : 'private');
    startTransition(async () => {
      const res = await toggleSaveJobAction(jobId, resolvedType);
      if (res.error) {
        toggleSavedJob(jobId);
        setNotice({ message: res.error, type: 'error' });
      }
    });
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          className="jp-fcard-save"
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          aria-pressed={saved}
          onClick={toggle}
        >
          <Bookmark size={18} fill={saved ? '#0a65cc' : 'none'} color={saved ? '#0a65cc' : 'currentColor'} />
        </button>
      ) : (
        <button
          type="button"
          className={`jp-govt-card-save${saved ? ' is-saved' : ''}`}
          aria-label={saved ? 'Remove saved job' : 'Save job'}
          aria-pressed={saved}
          onClick={toggle}
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
          <span>{saved ? 'সেভ করা হয়েছে' : 'সেভ করুন'}</span>
        </button>
      )}
      <FormAlert message={notice?.message} type={notice?.type ?? 'success'} trigger={notice} />
    </>
  );
}
