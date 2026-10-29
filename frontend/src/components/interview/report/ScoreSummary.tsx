import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { MAX_INTERVIEW_WARNINGS, scoreTone, VERDICT_LABELS } from '@/utils/interviews';

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreSummaryProps {
  score: number;
  verdict: string | null;
  summary: string | null;
  warnings: number;
  endReason: string | null;
}

export function ScoreSummary({ score, verdict, summary, warnings, endReason }: ScoreSummaryProps) {
  const rounded = Math.round(score);
  const tone = scoreTone(rounded);
  const flagged = endReason === 'proctoring';

  return (
    <section className="flex flex-col items-center gap-5 border border-[#e4e5e8] bg-white p-5 sm:flex-row">
      <svg width="132" height="132" viewBox="0 0 132 132" className="shrink-0" aria-label={`Score ${rounded} out of 100`}>
        <circle cx="66" cy="66" r={RADIUS} fill="none" stroke="#f1f2f4" strokeWidth="10" />
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(rounded, 100) / 100)}
          transform="rotate(-90 66 66)"
        />
        <text x="66" y="64" textAnchor="middle" fontSize="32" fontWeight="700" fill="#18191c">
          {rounded}
        </text>
        <text x="66" y="86" textAnchor="middle" fontSize="12" fill="#767f8c">
          / 100
        </text>
      </svg>
      <div>
        {verdict && (
          <span className="border px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide" style={{ color: tone, borderColor: tone }}>
            {VERDICT_LABELS[verdict] ?? verdict}
          </span>
        )}
        {summary && <p className="mt-2.5 text-sm leading-relaxed text-[#5e6670]">{summary}</p>}
        <p className={`mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold ${flagged ? 'text-[#e05151]' : 'text-[#28a745]'}`}>
          {flagged ? <ShieldAlert size={15} aria-hidden /> : <ShieldCheck size={15} aria-hidden />}
          {flagged
            ? `Ended after ${MAX_INTERVIEW_WARNINGS} integrity warnings`
            : `No integrity flags · ${warnings} warning${warnings === 1 ? '' : 's'}`}
        </p>
      </div>
    </section>
  );
}
