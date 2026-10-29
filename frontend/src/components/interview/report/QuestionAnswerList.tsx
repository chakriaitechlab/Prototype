import { Info, MessagesSquare } from 'lucide-react';
import type { ReportTurn } from '@/types/interviews';

function marksTone(marks: number) {
  if (marks >= 8) return 'border-[#bfe3c7] bg-[#eaf6ec] text-[#1e7e34]';
  if (marks >= 5) return 'border-[#f5d9a8] bg-[#fff7e6] text-[#b45309]';
  return 'border-[#f3c4c4] bg-[#fdf2f2] text-[#c53030]';
}

export function QuestionAnswerList({ turns }: { turns: ReportTurn[] }) {
  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <MessagesSquare size={18} className="text-[#0a65cc]" aria-hidden />
        Questions and answers
        <span className="ml-auto text-[12.5px] font-medium text-[#767f8c]">
          {turns.length} question{turns.length === 1 ? '' : 's'}
        </span>
      </h2>
      <div className="grid gap-3 p-5">
        {turns.length === 0 && <p className="text-[13.5px] text-[#767f8c]">No answers were recorded for this interview.</p>}
        {turns.map((turn, index) => (
          <article key={turn.id} className="border border-[#e4e5e8]">
            <div className="flex items-start justify-between gap-3 border-b border-[#e4e5e8] bg-[#f8fafc] px-4 py-3.5">
              <div>
                <p className="mb-0.5 text-xs text-[#767f8c]">
                  {turn.skill} · Q{index + 1}
                  {turn.questionType === 'follow_up' ? ' · Follow-up' : ''}
                </p>
                <p className="text-[14.5px] font-bold text-[#18191c]">{turn.question}</p>
              </div>
              {turn.marks !== null && (
                <span className={`shrink-0 border px-2.5 py-1 text-[11.5px] font-bold ${marksTone(turn.marks)}`}>{turn.marks} / 10</span>
              )}
            </div>
            <div className="grid gap-3 px-4 py-3.5 text-[13.5px] leading-relaxed">
              <Block title="Candidate answer" text={turn.answer} />
              <Block title="Ideal answer" text={turn.idealAnswer} />
              <Block title="AI feedback" text={turn.feedback} />
            </div>
          </article>
        ))}
        <p className="flex gap-1.5 text-xs text-[#767f8c]">
          <Info size={14} className="mt-px shrink-0" aria-hidden />
          AI-generated evaluation. Review the answers before making decisions.
        </p>
      </div>
    </section>
  );
}

function Block({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#767f8c]">{title}</h3>
      <p className="whitespace-pre-wrap text-[#18191c]">{text}</p>
    </div>
  );
}
