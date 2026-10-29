import Link from 'next/link';
import { jobsApi } from '@/lib/jobs';
import { notificationsApi } from '@/lib/notifications';
import { FavoriteJobsMetric } from './FavoriteJobsMetric';

type MetricVariant = 'applied' | 'favorite' | 'alerts';

const METRICS: Record<MetricVariant, { href: string; label: string; iconClass: string; path: string }> = {
  applied: {
    href: '/dashboard/seeker/applications',
    label: 'Applied jobs',
    iconClass: 'cdash-brand',
    path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  favorite: {
    href: '/dashboard/seeker/saved',
    label: 'Favorite jobs',
    iconClass: 'cdash-orange',
    path: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  },
  alerts: {
    href: '/dashboard/seeker/notifications',
    label: 'Job Alerts',
    iconClass: 'cdash-green',
    path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
};

export async function MetricCards() {
  const [applications, unread] = await Promise.all([
    jobsApi.applications().catch(() => null),
    notificationsApi.unreadCount().catch(() => null),
  ]);

  return (
    <MetricGrid
      applied={applications ? applications.length : '—'}
      favorite={<FavoriteJobsMetric />}
      alerts={unread ? unread.unreadCount : '—'}
    />
  );
}

type MetricValue = React.ReactNode;

export function MetricGrid({ applied, favorite, alerts }: Record<MetricVariant, MetricValue>) {
  return (
    <div className="cdash-metrics" data-purpose="stats-overview">
      <MetricCard variant="applied" value={applied} />
      <MetricCard variant="favorite" value={favorite} />
      <MetricCard variant="alerts" value={alerts} />
    </div>
  );
}

function MetricCard({ variant, value }: { variant: MetricVariant; value: MetricValue }) {
  const { href, label, iconClass, path } = METRICS[variant];

  return (
    <Link href={href} className={`cdash-metric cdash-metric--${variant}`}>
      <div>
        <div className="cdash-metric-value">{value}</div>
        <div className="cdash-metric-label">{label}</div>
      </div>
      <div className="cdash-metric-icon">
        <svg className={`cdash-metric-svg ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
        </svg>
      </div>
    </Link>
  );
}
