import Link from 'next/link';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { talentApi } from '@/lib/talent';

const RECENT_CANDIDATES_LIMIT = 5;
const VISIBLE_CANDIDATES = 4;

export async function RecentCandidates() {
  const data = await talentApi.candidates({ limit: RECENT_CANDIDATES_LIMIT }).catch(() => null);
  if (!data || data.items.length === 0) return null;

  const candidates = data.items.slice(0, VISIBLE_CANDIDATES);

  return (
    <section data-purpose="recent-candidates" className="mb-7">
      <div className="cdash-section-head">
        <h2>Recent candidates</h2>
        <Link href="/dashboard/recruiter/candidates">
          View all
          <svg className="cdash-ico-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
      <div className="rhub-candidates">
        {candidates.map((candidate) => (
          <Link
            key={candidate.id}
            href={`/dashboard/recruiter/candidates?candidate=${candidate.id}&source=application`}
            className="rhub-candidate"
          >
            <UserAvatar src={candidate.avatarUrl} name={candidate.name} className="rhub-candidate-avatar" />
            <div className="min-w-0 flex-1">
              <p className="rhub-candidate-name truncate">{candidate.name}</p>
              <p className="rhub-candidate-title truncate">{candidate.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
