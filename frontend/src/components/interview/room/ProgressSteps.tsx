import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import type { InterviewTurn } from '@/types/interviews';
import { QUESTIONS_PER_SKILL } from '@/utils/interviews';

export function ProgressSteps({ skills, turn, questionNumber }: { skills: string[]; turn: InterviewTurn | null; questionNumber: number }) {
  const currentIndex = turn?.phase === 'SKILL' ? skills.indexOf(turn.skill ?? '') : -1;
  const steps = [
    { label: 'Introduction', state: turn?.phase === 'SKILL' ? 'done' : 'current' },
    ...skills.map((skill, index) => ({
      label: index === currentIndex ? `${skill} · Q${questionNumber} of ${QUESTIONS_PER_SKILL}` : skill,
      state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'next',
    })),
  ];

  return (
    <ol className="absolute left-4 top-[76px] z-[3] hidden gap-1.5 sm:left-6 md:grid" aria-label="Interview progress">
      {steps.map(({ label, state }) => (
        <li
          key={label}
          className={`flex items-center gap-2 border bg-slate-900/55 px-2.5 py-1 text-[12.5px] ${
            state === 'current' ? 'border-[#93c5fd]/50 text-white' : state === 'done' ? 'border-white/10 text-slate-300' : 'border-white/10 text-slate-500'
          }`}
        >
          {state === 'done' ? (
            <CheckCircle2 size={14} className="text-[#4ade80]" aria-hidden />
          ) : state === 'current' ? (
            <CircleDot size={14} className="text-[#93c5fd]" aria-hidden />
          ) : (
            <Circle size={14} aria-hidden />
          )}
          {label}
        </li>
      ))}
    </ol>
  );
}
