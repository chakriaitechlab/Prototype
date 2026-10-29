import { ArrowLeft, ArrowRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export function Pagination({ currentPage, totalPages, onPageChange, label = 'Pagination' }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="jp-pagination" aria-label={label}>
      <button
        type="button"
        className="jp-page-btn"
        aria-label="Previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ArrowLeft size={18} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          className={`jp-page-btn${page === currentPage ? ' is-active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {String(page).padStart(2, '0')}
        </button>
      ))}
      <button
        type="button"
        className="jp-page-btn is-arrow"
        aria-label="Next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ArrowRight size={18} />
      </button>
    </nav>
  );
}
