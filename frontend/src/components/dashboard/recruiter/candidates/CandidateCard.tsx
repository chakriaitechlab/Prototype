import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { TalentCandidate } from '@/types/talent';
import { candidateProfilePath } from '@/utils/routes';
import { SaveCandidateButton } from './SaveCandidateButton';

export function CandidateCard({ candidate }: { candidate: TalentCandidate }) {
  const { id, username, name, title, location, avatarUrl, phoneVerified, isSaved } = candidate;

  return (
    <div className="group relative flex flex-col items-center border border-[#e4e5e8] bg-white px-4 pb-4 pt-5 text-center transition-all duration-200 hover:border-[#0a65cc] hover:shadow-md">
      <SaveCandidateButton candidateId={id} name={name} initialSaved={isSaved} />

      <Link href={candidateProfilePath(username)} className="flex w-full flex-col items-center">
        <div className="mb-2.5 transition-transform group-hover:scale-105">
          <UserAvatar
            src={avatarUrl}
            name={name}
            className="h-16 w-16 rounded-full text-lg font-bold"
            fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
          />
        </div>

        <div className="flex max-w-full items-center justify-center gap-1.5 px-1">
          <h3 className="truncate text-sm font-bold text-[#18191c] transition-colors group-hover:text-[#0a65cc]">
            {name}
          </h3>
          {phoneVerified && <VerifiedBadge size={15} title="Phone Verified" />}
        </div>

        <p className="mt-1 line-clamp-1 max-w-full px-1 text-xs font-medium text-[#5e6670]">{title}</p>

        <div className="mt-2 flex max-w-full items-center justify-center gap-1 text-xs text-[#767f8c]">
          <MapPin size={12} className="shrink-0 text-[#9199a3]" aria-hidden />
          <span className="truncate">{location}</span>
        </div>

        <div className="mt-3 flex w-full items-center justify-center gap-1 border-t border-[#f1f2f4] pt-2.5 text-xs font-semibold text-[#0a65cc] group-hover:underline">
          <span>View Profile</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
      </Link>
    </div>
  );
}
