'use client';

import Image from 'next/image';
import { Loader2, Sparkles, UserRound, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { useInterviewSpeech } from '@/hooks/useInterviewSpeech';
import type { InterviewLanguage } from '@/types/interviews';
import { INTERVIEWER } from '@/utils/interviews';

export function InterviewerPreviewCard({ interviewId, language }: { interviewId: string; language: InterviewLanguage }) {
  const { speak, speaking } = useInterviewSpeech(interviewId);
  const [state, setState] = useState<'idle' | 'loading' | 'failed'>('idle');

  const preview = async () => {
    setState('loading');
    const ok = await speak('preview', language);
    setState(ok ? 'idle' : 'failed');
  };

  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <UserRound size={18} className="text-[#0a65cc]" aria-hidden />
        Your interviewer
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#28a745]">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
          Available
        </span>
      </h2>
      <div className="relative">
        <div className="relative aspect-[16/10] w-full bg-black">
          <Image src={INTERVIEWER.image} alt={`${INTERVIEWER.name}, ${INTERVIEWER.role}`} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" priority />
        </div>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-900/70 px-2.5 py-1 text-[12.5px] font-semibold text-slate-100">
          <Sparkles size={14} aria-hidden />
          {INTERVIEWER.name} · {INTERVIEWER.role}
        </span>
        {speaking && (
          <span className="absolute right-3 top-3 flex items-center gap-2 bg-[#0a65cc] px-2.5 py-1 text-[12px] font-semibold text-white" role="status">
            <span className="flex h-3 items-end gap-0.5" aria-hidden>
              <i className="block h-1.5 w-[3px] animate-pulse bg-white" />
              <i className="block h-3 w-[3px] animate-pulse bg-white [animation-delay:150ms]" />
              <i className="block h-2 w-[3px] animate-pulse bg-white [animation-delay:300ms]" />
            </span>
            Speaking…
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3.5 px-5 py-4">
        <div>
          <p className="text-[15px] font-bold text-[#18191c]">{INTERVIEWER.label}</p>
          <p className="mt-0.5 text-[13px] text-[#767f8c]">
            {state === 'failed' ? 'Voice preview is temporarily unavailable.' : `${INTERVIEWER.description} Preview the voice you'll hear.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void preview()}
          disabled={state === 'loading' || speaking}
          className="jp-btn jp-btn--soft h-11! px-4! text-sm! disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state === 'loading' && !speaking ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Volume2 size={17} aria-hidden />}
          {speaking ? 'Playing preview…' : state === 'loading' ? 'Preparing preview…' : 'Audio preview'}
        </button>
      </div>
    </section>
  );
}
