import { MapPin, MessageSquare } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { PublicProfile } from '@/types/profile';
import type { PublicProfileSummary } from '@/utils/public-profile';

interface ProfileHeroProps {
  profile: PublicProfile;
  summary: PublicProfileSummary;
}

export function ProfileHero({ profile, summary }: ProfileHeroProps) {
  const { displayName, username, avatarUrl, headline, phoneVerified } = profile;

  return (
    <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
      <div className="relative shrink-0" id="profile-main-avatar">
        <UserAvatar
          src={avatarUrl}
          name={displayName}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-[#e4e5e7] shadow-xs text-4xl"
          fallbackClassName="bg-[#e7f0fa] text-[#0a65cc] font-bold"
        />
      </div>

      <div className="space-y-2 pt-1 sm:pt-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222325] tracking-tight">{displayName}</h1>
          <span className="text-sm sm:text-base text-[#74767e] font-normal">@{username}</span>
          {phoneVerified && <VerifiedBadge size={18} title="Phone Verified Professional" />}
        </div>

        {headline.trim() && (
          <p className="text-base sm:text-lg text-[#404145] font-normal leading-snug max-w-2xl">{headline}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-[#74767e] pt-0.5">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#74767e] shrink-0" />
            <span>{summary.location}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#74767e] shrink-0" />
            <span>{summary.languagesText}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
