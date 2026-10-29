import type { ReactNode } from 'react';
import { Banknote, CalendarClock, GraduationCap, TrendingUp } from 'lucide-react';
import type { JobDetail } from '@/types/jobs';
import { expiryLabel, type JobTimeline } from '@/utils/job-detail';

const ICON = { size: 20, 'aria-hidden': true } as const;

export function JobKeyFacts({ job, remaining }: { job: JobDetail; remaining: JobTimeline['remaining'] }) {
  const facts: { icon: ReactNode; label: string; value: string; note?: string | null }[] = [
    { icon: <Banknote {...ICON} />, label: 'Salary', value: job.salary ?? 'Not disclosed' },
    { icon: <TrendingUp {...ICON} />, label: 'Experience', value: job.experience ?? '—' },
    { icon: <GraduationCap {...ICON} />, label: 'Education', value: job.education ?? '—' },
    { icon: <CalendarClock {...ICON} />, label: 'Deadline', value: expiryLabel(job.deadline), note: remaining },
  ];

  return (
    <dl className="jp-jd-facts">
      {facts.map(({ icon, label, value, note }) => (
        <div key={label} className="jp-jd-fact">
          <span className="jp-jd-fact-icon">{icon}</span>
          <div>
            <dt>{label}</dt>
            <dd>{value}</dd>
            {note && <dd className="jp-jd-fact-note">{note}</dd>}
          </div>
        </div>
      ))}
    </dl>
  );
}
