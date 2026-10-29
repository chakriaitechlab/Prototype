import type { HiringCompany, HomepageStat, PrivateJobItem } from '@/types/jobs';

export const DEFAULT_STATS: HomepageStat[] = [
  { value: 'Live', label: 'Bangladesh jobs', icon: 'briefcase', highlight: false },
  { value: 'Hiring', label: 'Companies', icon: 'buildings', highlight: true },
  { value: 'AI', label: 'Job matching', icon: 'users', highlight: false },
  { value: 'Apply', label: 'On Chakri.ai', icon: 'briefcase-new', highlight: false },
];

/** Companies with open positions, in the order their first job appears. */
export function hiringCompanies(jobs: PrivateJobItem[]): HiringCompany[] {
  const byName = new Map<string, HiringCompany>();

  for (const job of jobs) {
    const key = job.company.toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      existing.positions += 1;
      existing.featured ||= Boolean(job.featured);
      continue;
    }
    byName.set(key, {
      name: job.company,
      location: job.location,
      positions: 1,
      featured: Boolean(job.featured),
      logoUrl: job.logoUrl,
    });
  }

  return [...byName.values()];
}

export function homepageStats(jobTotal: number, companyCount: number): HomepageStat[] {
  return DEFAULT_STATS.map((stat) => {
    if (stat.icon === 'briefcase' && jobTotal > 0) return { ...stat, value: `${jobTotal.toLocaleString()}+` };
    if (stat.icon === 'buildings') {
      if (companyCount > 0) {
        return { ...stat, value: String(companyCount), label: companyCount === 1 ? 'Hiring Company' : 'Hiring Companies' };
      }
      return { ...stat, label: 'Hiring Companies' };
    }
    return stat;
  });
}

/** Featured jobs first; falls back to the latest jobs when too few are flagged. */
export function featuredJobs(jobs: PrivateJobItem[], limit = 6): PrivateJobItem[] {
  const flagged = jobs.filter((job) => job.featured);
  return (flagged.length >= limit ? flagged : jobs).slice(0, limit);
}

/** Open jobs whose title or category matches each vacancy title (or any word of it). */
export function vacancyCounts(jobs: PrivateJobItem[], titles: readonly string[]): number[] {
  return titles.map((title) => {
    const needle = title.toLowerCase();
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.category ?? ''}`.toLowerCase();
      return haystack.includes(needle) || needle.split(' ').some((part) => haystack.includes(part));
    }).length;
  });
}
