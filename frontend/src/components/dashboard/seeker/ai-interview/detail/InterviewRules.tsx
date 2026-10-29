import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Maximize, RotateCcw, ShieldCheck, Users, Video } from 'lucide-react';
import { MAX_INTERVIEW_WARNINGS } from '@/utils/interviews';

const RULES: { icon: LucideIcon; tone: string; text: string }[] = [
  { icon: Video, tone: 'text-[#0a65cc]', text: 'Keep your camera on and your face visible the whole time.' },
  { icon: Maximize, tone: 'text-[#0a65cc]', text: "Stay in fullscreen. Don't switch tabs or windows." },
  { icon: Users, tone: 'text-[#0a65cc]', text: 'Only you should be in the camera frame. No mobile phones.' },
  { icon: AlertTriangle, tone: 'text-[#d97706]', text: `After ${MAX_INTERVIEW_WARNINGS} warnings the interview ends automatically.` },
  { icon: RotateCcw, tone: 'text-[#e05151]', text: 'You can take the interview only once.' },
];

export function InterviewRules() {
  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <ShieldCheck size={18} className="text-[#0a65cc]" aria-hidden />
        Interview rules
      </h2>
      <ul className="px-5 py-3">
        {RULES.map(({ icon: Icon, tone, text }) => (
          <li key={text} className="flex gap-2.5 py-1.5 text-[13.5px] leading-snug text-[#5e6670]">
            <Icon size={17} className={`mt-px shrink-0 ${tone}`} aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
