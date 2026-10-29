import { Briefcase, Building2, Users } from 'lucide-react';
import type { HomepageStat } from '@/types/jobs';
import { DEFAULT_STATS } from '@/utils/homepage';

const STAT_ICONS = {
  briefcase: Briefcase,
  buildings: Building2,
  users: Users,
  'briefcase-new': Briefcase,
} as const;

export function PlatformStatsSection({ stats = DEFAULT_STATS }: { stats?: HomepageStat[] }) {
  return (
    <section className="jp-stats-band" aria-label="Platform stats">
      <div className="jp-container">
        <div className="jp-stats">
          {stats.map((stat) => {
            const Icon = STAT_ICONS[stat.icon];
            return (
              <article key={stat.label} className={`jp-stat${stat.highlight ? ' is-highlight' : ''}`}>
                <div className="jp-stat-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
