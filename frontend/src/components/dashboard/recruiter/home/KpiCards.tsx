import Link from 'next/link';
import { Bookmark, Sparkles, Users } from 'lucide-react';
import { favoritesApi } from '@/lib/favorites';
import { talentApi } from '@/lib/talent';
import { formatCount } from '@/utils/format';

type KpiVariant = 'applicants' | 'hired' | 'saved';

const KPIS: Record<
  KpiVariant,
  { href: string; label: string; tone: string; iconClass: string; Icon: typeof Users }
> = {
  applicants: {
    href: '/dashboard/recruiter/candidates',
    label: 'Total applicants',
    tone: 'cdash-metric--applied',
    iconClass: 'cdash-brand',
    Icon: Users,
  },
  hired: {
    href: '/dashboard/recruiter/analytics',
    label: 'Hires made',
    tone: 'cdash-metric--applied',
    iconClass: 'cdash-brand',
    Icon: Sparkles,
  },
  saved: {
    href: '/dashboard/recruiter/favorites',
    label: 'Saved Candidates',
    tone: 'cdash-metric--favorite',
    iconClass: 'cdash-brand',
    Icon: Bookmark,
  },
};

export async function KpiCards() {
  const [stats, favorites] = await Promise.all([
    talentApi.stats().catch(() => null),
    favoritesApi.list().catch(() => null),
  ]);

  return (
    <KpiGrid
      applicants={stats ? formatCount(stats.applicants) : '—'}
      hired={stats ? formatCount(stats.hired) : '—'}
      saved={favorites ? formatCount(favorites.total) : '—'}
    />
  );
}

export function KpiGrid({ applicants, hired, saved }: Record<KpiVariant, React.ReactNode>) {
  return (
    <div className="cdash-metrics" data-purpose="stats-overview">
      <KpiCard variant="applicants" value={applicants} />
      <KpiCard variant="hired" value={hired} />
      <KpiCard variant="saved" value={saved} />
    </div>
  );
}

function KpiCard({ variant, value }: { variant: KpiVariant; value: React.ReactNode }) {
  const { href, label, tone, iconClass, Icon } = KPIS[variant];

  return (
    <Link href={href} className={`cdash-metric ${tone}`}>
      <div>
        <div className="cdash-metric-value">{value}</div>
        <div className="cdash-metric-label">{label}</div>
      </div>
      <div className="cdash-metric-icon">
        <Icon className={`cdash-metric-svg ${iconClass}`} size={22} aria-hidden />
      </div>
    </Link>
  );
}
