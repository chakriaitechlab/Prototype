'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MatchScoreButton } from '@/components/jobs/MatchScoreButton';
import { useMatchScores } from '@/hooks/useMatchScores';
import { companyInitials, formatDateTime } from '@/utils/format';
import type { ApplicationStatus, SeekerApplication } from '@/types/jobs';

const PER_PAGE = 5;
const LOGO_COLORS = ['#22c55e', '#ec4899', '#111827', '#0a65cc', '#f59e0b', '#8b5cf6'];

function statusLabel(status: ApplicationStatus) {
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'ASSIGNED') return 'Offer';
  return 'Active';
}

export function RecentApplicationsTable({ applications }: { applications: SeekerApplication[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(applications.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = applications.slice(start, start + PER_PAGE);
  const matchScores = useMatchScores(pageItems.map(({ job }) => job.id));

  const goToPage = (next: number) => setPage(Math.min(totalPages, Math.max(1, next)));

  return (
    <>
      <table className="cdash-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Date Applied</th>
            <th className="is-center">Status</th>
            <th className="is-center">Match</th>
            <th className="is-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map(({ id, status, appliedAt, job }, idx) => {
            const label = statusLabel(status);
            const companyName = job.company?.name ?? '';

            return (
              <tr key={id}>
                <td>
                  <div className="cdash-job-cell">
                    <div className="cdash-job-logo" style={{ background: LOGO_COLORS[(start + idx) % LOGO_COLORS.length] }}>
                      {companyInitials(companyName)}
                    </div>
                    <div>
                      <div className="cdash-job-title">
                        {job.title}
                        {job.employmentType && <span className="cdash-job-badge">{job.employmentType}</span>}
                      </div>
                      <div className="cdash-job-meta">
                        <svg className="cdash-ico-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {companyName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="cdash-muted">{formatDateTime(appliedAt)}</td>
                <td className="is-center">
                  <div className={`cdash-status${label === 'Rejected' ? ' is-bad' : ''}`}>
                    {label !== 'Rejected' && (
                      <svg className="cdash-ico-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {label}
                  </div>
                </td>
                <td className="is-center">
                  <MatchScoreButton opportunityId={job.id} matchScore={matchScores[job.id]} />
                </td>
                <td className="is-right">
                  <Link href={`/jobs/${job.id}`} className="cdash-row-btn">
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <nav className="jp-pagination" aria-label="Recently applied pagination">
          <button
            type="button"
            className="jp-page-btn"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ArrowLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`jp-page-btn${p === currentPage ? ' is-active' : ''}`}
              aria-current={p === currentPage ? 'page' : undefined}
              onClick={() => goToPage(p)}
            >
              {String(p).padStart(2, '0')}
            </button>
          ))}
          <button
            type="button"
            className="jp-page-btn is-arrow"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ArrowRight size={18} />
          </button>
        </nav>
      )}
    </>
  );
}
