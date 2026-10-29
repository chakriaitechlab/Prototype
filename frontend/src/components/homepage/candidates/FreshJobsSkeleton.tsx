import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FreshJobsSkeleton() {
  return (
    <section className="jp-section">
      <div className="jp-container">
        <div className="jp-section-head">
          <h2 className="jp-section-title">Fresh jobs for you</h2>
          <Link href="/jobs" className="jp-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="jp-find-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="jp-fcard"
              style={{ minHeight: 160, opacity: 0.6 }}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
