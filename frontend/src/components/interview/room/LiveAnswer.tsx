import { Mic } from 'lucide-react';
import type { InterviewLanguage } from '@/types/interviews';

interface LiveAnswerProps {
  listening: boolean;
  finalText: string;
  interimText: string;
  language: InterviewLanguage;
}

export function LiveAnswer({ listening, finalText, interimText, language }: LiveAnswerProps) {
  if (!listening) return null;

  const hasText = Boolean(finalText || interimText);

  return (
    <div
      className="mx-auto mt-3 w-full max-w-3xl rounded-2xl border border-emerald-400/50 bg-black/80 px-[1.125rem] py-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md"
      aria-live="polite"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-emerald-300">
          <Mic size={14} className="text-emerald-400" aria-hidden />
          Your answer
        </span>
        <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
          {hasText ? 'Speaking…' : 'Listening…'}
        </span>
      </div>
      <div className="flex min-h-[28px] items-center">
        {hasText ? (
          <p className="text-sm font-medium leading-relaxed text-white/95 sm:text-base">
            {finalText}
            {interimText && <span className="italic text-white/60"> {interimText}</span>}
          </p>
        ) : (
          <p className="text-xs italic text-white/40 sm:text-sm">
            {language === 'bangla' ? 'আপনার উত্তরটি স্পষ্ট করে বলুন...' : 'Listening for your response... Speak into your mic.'}
          </p>
        )}
      </div>
    </div>
  );
}
