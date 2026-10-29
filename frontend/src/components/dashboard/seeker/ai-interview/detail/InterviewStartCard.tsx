'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, Headphones, Laptop, Wifi } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { InterviewSession } from '@/types/interviews';
import { formatDateTime } from '@/utils/format';
import { canTakeInterview, daysLeft, INTERVIEWER, QUESTIONS_PER_SKILL } from '@/utils/interviews';
import { interviewLobbyPath } from '@/utils/routes';

export function InterviewStartCard({ interview }: { interview: InterviewSession }) {
  const now = useNow();
  const remaining = daysLeft(interview.expiresAt, now);
  const available = canTakeInterview(interview) && remaining > 0;
  const rows = [
    ['Duration', '15–20 min'],
    ['Format', 'Voice + camera'],
    ['Questions', `Intro + ${interview.skills.length * QUESTIONS_PER_SKILL} max`],
    ['Interviewer', `${INTERVIEWER.name} · ${INTERVIEWER.role}`],
  ];

  return (
    <div className="grid content-start gap-5">
      <section className="border border-[#e4e5e8] bg-white p-5">
        <p className={`flex items-center gap-2 text-sm font-bold ${available ? 'text-[#d97706]' : 'text-[#e05151]'}`} suppressHydrationWarning>
          <Clock3 size={18} aria-hidden />
          {available ? `${remaining} day${remaining === 1 ? '' : 's'} left` : 'Invite expired'}
        </p>
        <p className="mt-1 text-[13px] text-[#767f8c]" suppressHydrationWarning>
          Expires {formatDateTime(interview.expiresAt)}
        </p>
        <dl className="mt-3.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-[#f1f2f4] py-2 text-[13.5px] last:border-b-0">
              <dt className="text-[#767f8c]">{label}</dt>
              <dd className="font-semibold text-[#18191c]">{value}</dd>
            </div>
          ))}
        </dl>
        {available ? (
          <Link href={interviewLobbyPath(interview.id)} className="jp-btn jp-btn--primary mt-4 h-12! w-full">
            {interview.status === 'IN_PROGRESS' ? 'Continue interview' : 'Go to lobby'}
            <ArrowRight size={17} aria-hidden />
          </Link>
        ) : (
          <p className="mt-4 border border-[#e4e5e8] bg-[#f8fafc] p-3 text-center text-[13px] text-[#767f8c]">This invite is no longer available.</p>
        )}
      </section>

      <section className="border border-[#e4e5e8] bg-white p-5">
        <p className="mb-2 text-sm font-bold text-[#18191c]">Before you start</p>
        {[
          { icon: Laptop, text: 'Use a laptop or desktop with Chrome or Edge.' },
          { icon: Headphones, text: 'Find a quiet place. Headphones help.' },
          { icon: Wifi, text: 'Use a stable internet connection.' },
        ].map(({ icon: Icon, text }) => (
          <p key={text} className="flex gap-2.5 py-1 text-[13.5px] text-[#5e6670]">
            <Icon size={17} className="mt-px shrink-0 text-[#5e6670]" aria-hidden />
            {text}
          </p>
        ))}
      </section>
    </div>
  );
}
