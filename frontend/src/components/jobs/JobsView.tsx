'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Crosshair, Landmark, Layers, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import type { GovtJobFilters, GovtJobItem, GovtOrganization, JobTab, PrivateJobItem } from '@/types/jobs';
import { DEFAULT_GOVT_FILTERS, DEFAULT_PRIVATE_FILTERS, POPULAR_SEARCHES, hasGovtFilters, hasPrivateFilters, jobsUrl, matchesPrivateFilters, type JobsUrlState, type PrivateJobFilters } from '@/utils/job-filters';
import { AppLoader } from '@/components/ui/AppLoader';
import { useMatchScores } from '@/hooks/useMatchScores';
import { getSavedJobIds, getServerSavedJobIds, subscribeSavedJobs } from '@/utils/saved-jobs';
import { GovtJobCard } from './GovtJobCard';
import { Pagination } from '@/components/ui/Pagination';
import { PrivateJobCard } from './PrivateJobCard';
import { UnifiedJobFiltersDrawer } from './UnifiedJobFiltersDrawer';

const PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

const TABS: { value: JobTab; label: string; icon: ReactNode }[] = [
  { value: 'all', label: 'All Jobs', icon: <Layers size={18} aria-hidden /> },
  { value: 'private', label: 'Private Jobs', icon: <Briefcase size={18} aria-hidden /> },
  { value: 'govt', label: 'Govt Jobs', icon: <Landmark size={18} aria-hidden /> },
];

type CombinedJob =
  | { kind: 'private'; id: string; job: PrivateJobItem; timestamp: number }
  | { kind: 'govt'; id: string; job: GovtJobItem; timestamp: number };

interface JobsViewProps {
  urlState: JobsUrlState;
  privateJobs: PrivateJobItem[];
  govtJobs: GovtJobItem[];
  govtTotal: number;
  govtTotalPages: number;
  organizations: GovtOrganization[];
  /** Server render time, so deadline badges match between server and client. */
  now: number;
  /** Route the search/filter URL is built on (`/jobs` or the seeker dashboard). */
  basePath?: string;
  /** Seeker dashboard extras: save buttons and match scores. */
  seekerTools?: boolean;
}

function matchesGovtSearch(job: GovtJobItem, query: string, location: string) {
  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  const org = `${job.organizationName} ${job.organizationNameBn ?? ''}`.toLowerCase();

  if (q && !`${job.title} ${job.titleBn}`.toLowerCase().includes(q) && !org.includes(q)) return false;
  if (loc && !org.includes(loc) && !'bangladesh বাংলাদেশ dhaka ঢাকা'.includes(loc)) return false;
  return true;
}

function StatusCard({ children }: { children: ReactNode }) {
  return (
    <div className="jp-filter-card jp-jobs-status">{children}</div>
  );
}

function FilterChip({ label, removeLabel, onRemove }: { label: string; removeLabel: string; onRemove: () => void }) {
  return (
    <span className="jp-drawer-chip">
      {label}
      <button type="button" className="jp-drawer-chip-x" aria-label={removeLabel} onClick={onRemove}>
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
}

export function JobsView({
  urlState,
  privateJobs,
  govtJobs,
  govtTotal,
  govtTotalPages,
  organizations,
  now,
  basePath = '/jobs',
  seekerTools = false,
}: JobsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef<HTMLDivElement>(null);
  const savedIds = useSyncExternalStore(subscribeSavedJobs, getSavedJobIds, getServerSavedJobIds);

  const [query, setQuery] = useState(urlState.q);
  const [location, setLocation] = useState(urlState.location);
  const [jobTab, setJobTab] = useState(urlState.tab);
  const [page, setPage] = useState(urlState.page);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedPrivate, setAppliedPrivate] = useState<PrivateJobFilters>(DEFAULT_PRIVATE_FILTERS);
  const [sentSearch, setSentSearch] = useState({ q: urlState.q, location: urlState.location });
  const [prevUrlState, setPrevUrlState] = useState(urlState);

  const govtFilters: GovtJobFilters = {
    organization: urlState.organization,
    status: urlState.status,
    sortBy: urlState.sortBy,
  };

  // Follow URL changes we did not make ourselves (back/forward, links)
  if (urlState !== prevUrlState) {
    setPrevUrlState(urlState);
    setJobTab(urlState.tab);
    setPage(urlState.page);
    if (urlState.q !== sentSearch.q || urlState.location !== sentSearch.location) {
      setQuery(urlState.q);
      setLocation(urlState.location);
      setSentSearch({ q: urlState.q, location: urlState.location });
    }
  }

  const navigate = (next: Partial<JobsUrlState>) => {
    const state: JobsUrlState = { ...urlState, q: query, location, tab: jobTab, page, ...next };
    setSentSearch({ q: state.q, location: state.location });
    startTransition(() => router.replace(jobsUrl(state, basePath), { scroll: false }));
  };

  // Search the server once typing pauses
  useEffect(() => {
    if (query === sentSearch.q && location === sentSearch.location) return;
    const timer = setTimeout(() => {
      setSentSearch({ q: query, location });
      startTransition(() =>
        router.replace(jobsUrl({ ...urlState, q: query, location, tab: jobTab, page: 1 }, basePath), { scroll: false }),
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, location, sentSearch, urlState, jobTab, router, basePath]);

  const privateFiltersActive = hasPrivateFilters(appliedPrivate);
  const govtFiltersActive = hasGovtFilters(govtFilters);
  const filtersActive =
    jobTab === 'govt' ? govtFiltersActive : jobTab === 'private' ? privateFiltersActive : privateFiltersActive || govtFiltersActive;

  const filteredPrivateJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return privateJobs.filter(
      (job) =>
        (!urlState.savedOnly || savedIds.includes(job.id)) &&
        (!q || `${job.title} ${job.company}`.toLowerCase().includes(q)) &&
        (!loc || job.location.toLowerCase().includes(loc)) &&
        matchesPrivateFilters(job, appliedPrivate),
    );
  }, [privateJobs, urlState.savedOnly, savedIds, query, location, appliedPrivate]);

  const combinedJobs = useMemo<CombinedJob[]>(() => {
    const privateItems: CombinedJob[] = filteredPrivateJobs.map((job) => ({
      kind: 'private',
      id: job.id,
      job,
      timestamp: job.postedAt ? new Date(job.postedAt).getTime() : 0,
    }));
    const govtItems: CombinedJob[] = govtJobs
      .filter((job) => matchesGovtSearch(job, query, location))
      .map((job) => ({ kind: 'govt', id: job.id, job, timestamp: new Date(job.publishedDate).getTime() }));

    return [...privateItems, ...govtItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredPrivateJobs, govtJobs, query, location]);

  const totalPages =
    jobTab === 'govt'
      ? Math.max(1, govtTotalPages)
      : Math.max(1, Math.ceil((jobTab === 'all' ? combinedJobs.length : filteredPrivateJobs.length) / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = <T,>(items: T[]) => items.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const visiblePrivateIds =
    jobTab === 'govt'
      ? []
      : jobTab === 'all'
        ? pageSlice(combinedJobs).flatMap((item) => (item.kind === 'private' ? [item.id] : []))
        : pageSlice(filteredPrivateJobs).map((job) => job.id);
  const matchScores = useMatchScores(visiblePrivateIds, seekerTools);

  const goToPage = (next: number) => {
    setPage(next);
    if (jobTab === 'govt') {
      navigate({ page: next });
    } else {
      // All/private pages are sliced on the client; only the URL needs to follow
      window.history.replaceState(null, '', jobsUrl({ ...urlState, q: query, location, tab: jobTab, page: next }, basePath));
    }
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const switchTab = (tab: JobTab) => {
    setJobTab(tab);
    setPage(1);
    navigate({ tab, page: 1 });
  };

  const setGovtFilters = (filters: GovtJobFilters) => {
    setPage(1);
    navigate({ ...filters, page: 1 });
  };

  const clearAll = () => {
    setQuery('');
    setLocation('');
    setAppliedPrivate(DEFAULT_PRIVATE_FILTERS);
    setPage(1);
    navigate({ q: '', location: '', page: 1, ...DEFAULT_GOVT_FILTERS });
  };

  const totalLabel =
    jobTab === 'all'
      ? `Total Jobs: ${combinedJobs.length}`
      : jobTab === 'private'
        ? `Total Private Jobs: ${filteredPrivateJobs.length}`
        : `Total Govt Jobs: ${isPending ? '...' : govtTotal}`;

  const emptyState = (message: string) => (
    <StatusCard>
      <p>{message}</p>
      <button type="button" className="jp-btn jp-btn--primary" onClick={clearAll}>
        Reset search
      </button>
    </StatusCard>
  );

  const loadingState = (message: string) => (
    <StatusCard>
      <AppLoader />
      <p>{message}</p>
    </StatusCard>
  );

  let results: ReactNode;
  if (jobTab === 'all') {
    const items = pageSlice(combinedJobs);
    results = isPending
      ? loadingState('Loading all jobs…')
      : items.length
        ? (
            <div className="jp-find-grid">
              {items.map((item) =>
                item.kind === 'govt' ? (
                  <GovtJobCard key={`all-govt-${item.id}`} job={item.job} now={now} seekerTools={seekerTools} />
                ) : (
                  <PrivateJobCard
                    key={`all-private-${item.id}`}
                    job={item.job}
                    seekerTools={seekerTools}
                    matchScore={matchScores[item.id]}
                  />
                ),
              )}
            </div>
          )
        : emptyState('No jobs found matching your search.');
  } else if (jobTab === 'private') {
    const items = pageSlice(filteredPrivateJobs);
    results = items.length
      ? (
          <div className="jp-find-grid">
            {items.map((job) => (
              <PrivateJobCard key={job.id} job={job} seekerTools={seekerTools} matchScore={matchScores[job.id]} />
            ))}
          </div>
        )
      : emptyState('No jobs match your search.');
  } else {
    results = isPending
      ? loadingState('Loading government jobs…')
      : govtJobs.length
        ? (
            <div className="jp-find-grid">
              {govtJobs.map((job) => (
                <GovtJobCard key={`govt-${job.id}`} job={job} now={now} seekerTools={seekerTools} />
              ))}
            </div>
          )
        : emptyState('No government jobs found matching your search.');
  }

  return (
    <>
      <section className="jp-section jp-jobs-section">
        <div className="jp-container">
          <form className="jp-find-search" onSubmit={(event) => event.preventDefault()} role="search">
            <div className="jp-find-field">
              <Search size={20} color="#0a65cc" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by: Job title, Position, Keyword..."
                aria-label="Search jobs"
              />
            </div>
            <div className="jp-find-field">
              <MapPin size={20} color="#0a65cc" aria-hidden />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, state or zip code"
                aria-label="Location"
              />
              <button type="button" className="jp-find-locate" aria-label="Use my location" onClick={() => setLocation('Dhaka')}>
                <Crosshair size={18} />
              </button>
            </div>
            <button
              type="button"
              className={`jp-btn jp-btn--filters${filtersOpen || filtersActive ? ' is-active' : ''}`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button type="submit" className="jp-btn jp-btn--primary">
              Find Job
            </button>
          </form>

          <div className="flex items-center justify-between flex-wrap gap-3 my-4">
            <div className="inline-flex items-center gap-2.5 flex-wrap">
              {TABS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchTab(value)}
                  className={`jp-btn cursor-pointer ${
                    jobTab === value ? 'jp-btn--primary jp-btn--nav-signup' : 'jp-btn--outline jp-btn--nav-signin'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="jp-popular jp-jobs-popular">
              <span>Popular searches:</span>
              {POPULAR_SEARCHES.map((term) => {
                const active = query.toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    className={active ? 'is-active' : undefined}
                    onClick={() => setQuery(active ? '' : term)}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="jp-jobs-bar">
            <span className="jp-jobs-total">{totalLabel}</span>

            {filtersActive && (
              <div className="jp-jobs-chips">
                {jobTab !== 'private' && govtFilters.organization && (
                  <FilterChip
                    label={govtFilters.organization}
                    removeLabel="Remove organization"
                    onRemove={() => setGovtFilters({ ...govtFilters, organization: '' })}
                  />
                )}
                {jobTab !== 'private' && govtFilters.status !== 'active' && (
                  <FilterChip
                    label={`Status: ${govtFilters.status === 'all' ? 'All' : 'Expired'}`}
                    removeLabel="Remove status"
                    onRemove={() => setGovtFilters({ ...govtFilters, status: 'active' })}
                  />
                )}
                {jobTab !== 'private' && govtFilters.sortBy !== 'latest' && (
                  <FilterChip
                    label="Deadline Approaching"
                    removeLabel="Remove sort"
                    onRemove={() => setGovtFilters({ ...govtFilters, sortBy: 'latest' })}
                  />
                )}
                {jobTab !== 'govt' &&
                  appliedPrivate.industries.map((industry) => (
                    <FilterChip
                      key={industry}
                      label={industry}
                      removeLabel={`Remove ${industry}`}
                      onRemove={() =>
                        setAppliedPrivate((prev) => ({ ...prev, industries: prev.industries.filter((x) => x !== industry) }))
                      }
                    />
                  ))}
                {jobTab !== 'govt' && appliedPrivate.remote && (
                  <FilterChip
                    label="Remote Only"
                    removeLabel="Remove remote"
                    onRemove={() => setAppliedPrivate((prev) => ({ ...prev, remote: false }))}
                  />
                )}

                <button type="button" onClick={clearAll} className="jp-btn jp-btn--outline jp-jobs-reset">
                  <X size={12} /> Reset Filters
                </button>
              </div>
            )}
          </div>

          <div ref={gridRef}>{results}</div>

          <div className="jp-jobs-pagination">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} label="Jobs pagination" />
          </div>
        </div>
      </section>

      <UnifiedJobFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        jobTab={jobTab}
        searchQuery={query}
        location={location}
        organizations={organizations}
        onClearSearch={() => setQuery('')}
        onClearLocation={() => setLocation('')}
        appliedPrivate={appliedPrivate}
        appliedGovt={govtFilters}
        onApply={(privateFilters, nextGovtFilters) => {
          setAppliedPrivate(privateFilters);
          setGovtFilters(nextGovtFilters);
        }}
        onResetAll={clearAll}
      />
    </>
  );
}
