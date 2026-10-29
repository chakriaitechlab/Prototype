'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Bookmark, Compass, Search } from 'lucide-react';
import { PrivateJobCard } from '@/components/jobs/PrivateJobCard';
import { GovtJobCard } from '@/components/jobs/GovtJobCard';
import { Pagination } from '@/components/ui/Pagination';
import { useMatchScores } from '@/hooks/useMatchScores';
import type { GovtJobItem, PrivateJobItem, SavedJobsData } from '@/types/jobs';
import { getSavedJobIds, getServerSavedJobIds, subscribeSavedJobs, syncSavedJobIds } from '@/utils/saved-jobs';
import { SavedJobsEmpty } from './SavedJobsEmpty';

const PER_PAGE = 9;

type UnifiedSavedJob =
  | ({ kind: 'private' } & PrivateJobItem)
  | ({ kind: 'govt' } & GovtJobItem);

type SavedJobsViewProps = {
  data: SavedJobsData;
  now?: number;
};

export function SavedJobsView({ data, now: nowProp }: SavedJobsViewProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [now] = useState(() => nowProp ?? Date.now());

  // Sync server IDs into client localStorage store on load
  useEffect(() => {
    syncSavedJobIds(data.ids);
  }, [data.ids]);

  const liveSavedIds = useSyncExternalStore(subscribeSavedJobs, getSavedJobIds, getServerSavedJobIds);

  // Combine private and govt jobs and keep only currently saved ones
  const allSavedItems = useMemo<UnifiedSavedJob[]>(() => {
    const list: UnifiedSavedJob[] = [];

    for (const job of data.privateJobs) {
      if (liveSavedIds.includes(job.id)) {
        list.push({ ...job, kind: 'private' });
      }
    }

    for (const job of data.govtJobs) {
      if (liveSavedIds.includes(job.id)) {
        list.push({ ...job, kind: 'govt' });
      }
    }

    return list;
  }, [data.privateJobs, data.govtJobs, liveSavedIds]);

  // Search filtering strictly by job title
  const query = search.trim().toLowerCase();
  const searchFiltered = useMemo(() => {
    if (!query) return allSavedItems;
    return allSavedItems.filter((job) => {
      if (job.kind === 'private') {
        return (job.title || '').toLowerCase().includes(query);
      } else {
        const title = (job.title || '').toLowerCase();
        const titleBn = (job.titleBn || '').toLowerCase();
        return title.includes(query) || titleBn.includes(query);
      }
    });
  }, [allSavedItems, query]);

  const totalPages = Math.max(1, Math.ceil(searchFiltered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return searchFiltered.slice(start, start + PER_PAGE);
  }, [searchFiltered, currentPage]);
  const matchScores = useMatchScores(pageItems.flatMap((job) => (job.kind === 'private' ? [job.id] : [])));

  const totalCount = allSavedItems.length;
  const hasSearch = Boolean(query);

  return (
    <>
      {/* Hero Section */}
      <section
        className="bg-white border border-[#e4e5e8] rounded-lg p-5 sm:p-6 mb-6"
        data-purpose="saved-jobs-hero"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#e7f0fa] flex items-center justify-center text-[#0a65cc] shrink-0">
              <Bookmark size={20} className="text-[#0a65cc]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#18191c] tracking-tight">
                  Favorite Jobs
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e7f0fa] text-[#0a65cc]">
                  {totalCount} {totalCount === 1 ? 'job' : 'jobs'}
                </span>
              </div>
              <p className="text-sm text-[#767f8c] mt-1">
                {totalCount === 1 ? '1 favorite job' : `${totalCount} favorite jobs`} saved in your account
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/seeker/jobs"
            className="jp-btn jp-btn--primary"
            style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.875rem' }}
          >
            <Compass size={16} />
            <span>Find More Jobs</span>
          </Link>
        </div>
      </section>

      {/* Filter / Search Bar */}
      <div className="cdash-filter-bar" role="search" aria-label="Filter favorite jobs" style={{ marginBottom: '1.75rem' }}>
        <div className="cset-input-wrap cdash-filter-search">
          <span className="cset-input-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search company, role or location..."
            className="cset-input cset-input--with-icon"
            aria-label="Search favorite jobs"
          />
        </div>
      </div>

      {/* Content Area */}
      <div>
        {totalCount === 0 ? (
          <SavedJobsEmpty />
        ) : searchFiltered.length === 0 && hasSearch ? (
          <div
            className="cdash-empty"
            style={{
              background: '#fff',
              borderRadius: '0.75rem',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            No favorite jobs match your search.
          </div>
        ) : (
          <>
            <div className="jp-find-grid" style={{ marginBottom: '2rem' }}>
              {pageItems.map((job) =>
                job.kind === 'private' ? (
                  <PrivateJobCard key={job.id} job={job} seekerTools matchScore={matchScores[job.id]} />
                ) : (
                  <GovtJobCard key={job.id} job={job} now={now} seekerTools />
                ),
              )}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </>
  );
}
