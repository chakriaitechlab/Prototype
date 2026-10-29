'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Clock, Mic, Search, Sparkles, XCircle } from 'lucide-react';
import { MatchScoreButton } from '@/components/jobs/MatchScoreButton';
import { Pagination } from '@/components/ui/Pagination';
import { useMatchScores } from '@/hooks/useMatchScores';
import type { ApplicationStatus, SeekerApplication } from '@/types/jobs';
import { companyInitials, formatDate } from '@/utils/format';
import { ApplicationsEmpty } from './ApplicationsEmpty';

const PER_PAGE = 8;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'SUBMITTED', label: 'Applied' },
  { value: 'CV_SCREENING', label: 'Screening' },
  { value: 'VOICE_INTERVIEW', label: 'Interview' },
  { value: 'RECRUITER_REVIEW', label: 'Shortlisted' },
  { value: 'ASSIGNED', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
] as const;

const LOGO_COLORS = ['#22c55e', '#ec4899', '#111827', '#0a65cc', '#f59e0b', '#8b5cf6'];

type StatusTone = 'ok' | 'warn' | 'bad';

function statusMeta(status: ApplicationStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case 'REJECTED':
      return { label: 'Rejected', tone: 'bad' };
    case 'ASSIGNED':
      return { label: 'Offer', tone: 'ok' };
    case 'RECRUITER_REVIEW':
      return { label: 'Shortlisted', tone: 'ok' };
    case 'VOICE_INTERVIEW':
    case 'INTERVIEW_SUBMITTED':
      return { label: 'Interview', tone: 'warn' };
    case 'CV_SCREENING':
      return { label: 'Screening', tone: 'warn' };
    case 'SUBMITTED':
    default:
      return { label: 'Active', tone: 'ok' };
  }
}

function typeBadge(employmentType?: string | null) {
  const emp = (employmentType || '').toLowerCase();
  if (emp.includes('part')) return 'Part-Time';
  if (emp.includes('intern')) return 'Internship';
  if (emp.includes('contract')) return 'Contract';
  return 'Full Time';
}

function StatusIcon({ tone }: { tone: StatusTone }) {
  if (tone === 'bad') {
    return <XCircle size={15} className="shrink-0" aria-hidden />;
  }
  if (tone === 'warn') {
    return <Clock size={15} className="shrink-0" aria-hidden />;
  }
  return <CheckCircle2 size={15} className="shrink-0" aria-hidden />;
}

type ApplicationsViewProps = {
  applications: SeekerApplication[];
};

export function ApplicationsView({ applications }: ApplicationsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const total = applications.length;

  const appliedCount = total;
  const interviewCount = applications.filter((a) =>
    ['VOICE_INTERVIEW', 'INTERVIEW_SUBMITTED', 'CV_SCREENING'].includes(a.status),
  ).length;
  const offerCount = applications.filter((a) => ['ASSIGNED', 'RECRUITER_REVIEW'].includes(a.status)).length;

  // Search strictly by job title or company
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        !deferredSearch ||
        (app.job.title || '').toLowerCase().includes(deferredSearch) ||
        (app.job.company?.name || '').toLowerCase().includes(deferredSearch);
      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, deferredSearch, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const matchScores = useMatchScores(pageItems.map((app) => app.job.id));

  const hasSearchOrFilter = search.trim().length > 0 || statusFilter !== 'all';

  return (
    <>
      {/* Greeting Header */}
      <section className="cdash-greeting">
        <h1>Applications</h1>
        <p>{total === 1 ? '1 application' : `${total} applications`} tracked across your pipeline</p>
      </section>

      {/* Metrics Cards */}
      <section className="cdash-metrics" data-purpose="application-stats">
        <div className="cdash-metric cdash-metric--applied">
          <div>
            <div className="cdash-metric-value">{appliedCount}</div>
            <div className="cdash-metric-label">Applied jobs</div>
          </div>
          <div className="cdash-metric-icon">
            <Briefcase size={22} className="cdash-metric-svg cdash-brand" />
          </div>
        </div>
        <div className="cdash-metric cdash-metric--favorite">
          <div>
            <div className="cdash-metric-value">{interviewCount}</div>
            <div className="cdash-metric-label">Interviews</div>
          </div>
          <div className="cdash-metric-icon">
            <Mic size={22} className="cdash-metric-svg cdash-orange" />
          </div>
        </div>
        <div className="cdash-metric cdash-metric--alerts">
          <div>
            <div className="cdash-metric-value">{offerCount}</div>
            <div className="cdash-metric-label">Offers</div>
          </div>
          <div className="cdash-metric-icon">
            <Sparkles size={22} className="cdash-metric-svg cdash-green" />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="cdash-filter-bar" role="search" aria-label="Filter applications">
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
            placeholder="Search company or role..."
            className="cset-input cset-input--with-icon"
            aria-label="Search applications by company or role"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="cset-input cdash-filter-select"
          aria-label="Filter by application status"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table & Data Area */}
      <div className="cdash-table-wrap">
        {total === 0 ? (
          <ApplicationsEmpty />
        ) : filtered.length === 0 && hasSearchOrFilter ? (
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
            No applications match your search or filter.
          </div>
        ) : (
          <>
            <table className="cdash-table">
              <thead>
                <tr>
                  <th>Jobs</th>
                  <th className="is-center">Status</th>
                  <th className="is-center">Match</th>
                  <th className="is-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((app, idx) => {
                  const absoluteIdx = (currentPage - 1) * PER_PAGE + idx;
                  const meta = statusMeta(app.status);
                  const companyName = app.job.company?.name || 'Company';

                  return (
                    <tr key={app.id}>
                      <td>
                        <div className="cdash-job-cell">
                          <div
                            className="cdash-job-logo"
                            style={{ background: LOGO_COLORS[absoluteIdx % LOGO_COLORS.length] }}
                          >
                            {companyInitials(companyName)}
                          </div>
                          <div>
                            <div className="cdash-job-title">
                              <Link href={`/jobs/${app.job.id}`} className="hover:text-[#0a65cc] transition-colors">
                                {app.job.title || 'Untitled role'}
                              </Link>
                              <span className="cdash-job-badge">{typeBadge(app.job.employmentType)}</span>
                            </div>
                            <div className="cdash-job-meta">
                              <span>{companyName}</span>
                              <span aria-hidden>·</span>
                              <span>{app.job.location || 'Remote'}</span>
                              <span aria-hidden>·</span>
                              <span>Applied {formatDate(app.appliedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="is-center">
                        <div
                          className={`cdash-status${meta.tone === 'bad' ? ' is-bad' : ''}${
                            meta.tone === 'warn' ? ' is-warn' : ''
                          }`}
                        >
                          <StatusIcon tone={meta.tone} />
                          <span>{meta.label}</span>
                        </div>
                      </td>

                      <td className="is-center">
                        <MatchScoreButton opportunityId={app.job.id} matchScore={matchScores[app.job.id]} />
                      </td>

                      <td className="is-right">
                        <div className="cdash-row-actions">
                          <Link href={`/jobs/${app.job.id}`} className="cdash-row-btn">
                            View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
