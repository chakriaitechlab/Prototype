import type { ReactNode } from 'react';
import { Calendar, CalendarClock, GraduationCap, Layers, LayoutGrid, MapPin, TrendingUp, Users } from 'lucide-react';
import type { JobDetail } from '@/types/jobs';
import { formatDate } from '@/utils/format';
import { expiryLabel, jobLocation } from '@/utils/job-detail';

const ICON = { size: 18, 'aria-hidden': true } as const;

export function JobOverview({ job }: { job: JobDetail }) {
  const rows: { icon: ReactNode; label: string; value: string }[] = [
    { icon: <Calendar {...ICON} />, label: 'Posted', value: formatDate(job.createdAt) },
    { icon: <CalendarClock {...ICON} />, label: 'Deadline', value: expiryLabel(job.deadline) },
    { icon: <Layers {...ICON} />, label: 'Job level', value: job.jobLevel ?? '—' },
    { icon: <TrendingUp {...ICON} />, label: 'Experience', value: job.experience ?? '—' },
    { icon: <GraduationCap {...ICON} />, label: 'Education', value: job.education ?? '—' },
    { icon: <Users {...ICON} />, label: 'Vacancies', value: String(job.vacancies) },
    { icon: <MapPin {...ICON} />, label: 'Location', value: jobLocation(job) },
    { icon: <LayoutGrid {...ICON} />, label: 'Category', value: job.category ?? '—' },
  ];

  return (
    <div className="jp-jd-card">
      <h3>Job overview</h3>
      <dl className="jp-jd-overview">
        {rows.map(({ icon, label, value }) => (
          <div key={label}>
            {icon}
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
