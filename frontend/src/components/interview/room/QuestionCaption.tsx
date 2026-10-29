import { Sparkles, Volume2 } from 'lucide-react';
import { INTERVIEWER } from '@/utils/interviews';

interface QuestionCaptionProps {
  question: string | null;
  speaking: boolean;
  label: string | null;
}

export function QuestionCaption({ question, speaking, label }: QuestionCaptionProps) {
  if (!question) return null;

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/15 bg-black/75 px-[1.125rem] py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#93c5fd]">
          <Sparkles size={14} aria-hidden />
          {INTERVIEWER.name} · {label ?? 'AI Interviewer'}
        </span>
        {speaking && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#93c5fd]/30 bg-[#93c5fd]/15 px-2 py-0.5 text-[10px] font-semibold text-[#bfdbfe]">
            <Volume2 size={12} className="animate-pulse" aria-hidden />
            Speaking
          </span>
        )}
      </div>
      <p className="text-[15px] font-semibold leading-normal text-white/95">{question}</p>
    </div>
  );
}
