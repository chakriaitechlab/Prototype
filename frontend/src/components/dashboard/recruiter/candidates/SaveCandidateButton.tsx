'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { removeCandidateAction, saveCandidateAction } from '@/actions/favorites.actions';
import { FormAlert } from '@/components/ui/FormAlert';

interface SaveCandidateButtonProps {
  candidateId: string;
  name: string;
  initialSaved: boolean;
}

export function SaveCandidateButton({ candidateId, name, initialSaved }: SaveCandidateButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; trigger: number } | null>(null);

  const handleClick = () => {
    const next = !saved;
    startTransition(async () => {
      setOptimisticSaved(next);
      const result = next ? await saveCandidateAction(candidateId) : await removeCandidateAction(candidateId);

      if (result.error) {
        setAlert({ type: 'error', message: result.error, trigger: Date.now() });
        return;
      }
      setSaved(next);
      setAlert({
        type: 'success',
        message: next ? `Saved ${name}'s profile` : `Removed ${name} from saved`,
        trigger: Date.now(),
      });
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`absolute right-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ${
          optimisticSaved
            ? 'border-rose-200 bg-rose-50 text-[#e11d48] shadow-xs'
            : 'border-[#e4e5e8] bg-white text-[#767f8c] shadow-2xs hover:border-rose-300 hover:text-[#e11d48] hover:shadow-xs'
        }`}
        aria-label={optimisticSaved ? `Remove ${name} from saved` : `Save ${name} profile`}
        aria-pressed={optimisticSaved}
        title={optimisticSaved ? 'Saved to Favorites' : 'Save candidate profile'}
      >
        <Heart
          size={14}
          strokeWidth={2}
          aria-hidden
          className={`transition-all duration-200 ${
            optimisticSaved ? 'scale-110 fill-[#e11d48] text-[#e11d48]' : 'fill-transparent hover:scale-110'
          }`}
        />
      </button>
      <FormAlert message={alert?.message} type={alert?.type} trigger={alert?.trigger} />
    </>
  );
}
