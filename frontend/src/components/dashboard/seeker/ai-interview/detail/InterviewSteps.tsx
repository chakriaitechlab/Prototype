import { ListChecks } from 'lucide-react';
import { QUESTIONS_PER_SKILL } from '@/utils/interviews';

const STEPS = [
  { title: 'Device check', text: 'Turn on your camera and microphone in the lobby.' },
  { title: 'Introduction', text: 'Tell the AI interviewer about yourself.' },
  { title: 'Skill questions', text: `Up to ${QUESTIONS_PER_SKILL} spoken questions for each skill above.` },
  { title: 'Report', text: 'Your score and feedback are ready when you finish.' },
];

export function InterviewSteps() {
  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <ListChecks size={18} className="text-[#0a65cc]" aria-hidden />
        How it works
      </h2>
      <ol className="px-5 py-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 py-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e7f0fa] text-[13px] font-bold text-[#0a65cc]">{index + 1}</span>
            <div>
              <p className="text-sm font-semibold text-[#18191c]">{step.title}</p>
              <p className="text-[13px] text-[#767f8c]">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
