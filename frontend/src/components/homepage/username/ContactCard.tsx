import { Calendar, MapPin, Send } from 'lucide-react';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { PublicProfile } from '@/types/profile';
import { availabilityLabel } from '@/utils/profile';
import type { PublicProfileSummary } from '@/utils/public-profile';

const AVATAR_FALLBACK = 'bg-[#e7f0fa] text-[#0a65cc] font-bold';

export function ContactButton({ href, className = '' }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      className={`bg-[#222325] hover:bg-black active:scale-[0.99] !text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs no-underline hover:no-underline ${className}`}
    >
      <Send className="w-4 h-4 text-white" />
      <span className="text-white">Contact me</span>
    </a>
  );
}

export function OnlineStatus({ labelClassName = '' }: { labelClassName?: string }) {
  return (
    <>
      <span className="w-2 h-2 rounded-full bg-[#0ba02c] shrink-0" />
      <span className={labelClassName}>Online</span>
    </>
  );
}

interface ContactCardProps {
  profile: PublicProfile;
  summary: PublicProfileSummary;
}

export function ContactCard({ profile, summary }: ContactCardProps) {
  const { displayName, avatarUrl, languages, availability } = profile;

  return (
    <div className="w-full rounded-[8px] border border-[#dadbdd] bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={avatarUrl}
          name={displayName}
          className="w-11 h-11 rounded-full border border-[#e4e5e7] text-sm"
          fallbackClassName={AVATAR_FALLBACK}
        />
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#222325] leading-snug">{displayName}</h3>
          <p className="text-xs text-[#74767e] flex items-center gap-1.5 mt-0.5">
            <OnlineStatus />
          </p>
        </div>
      </div>

      <ContactButton href={summary.contactHref} className="w-full py-3 px-4 rounded-[6px]" />

      <div className="pt-5 border-t border-[#e4e5e7] space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-[#74767e]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#9199a3]" />
            <span>From</span>
          </div>
          <span className="font-semibold text-[#222325]">{summary.location}</span>
        </div>

        <div className="flex items-center justify-between text-[#74767e]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#9199a3]" />
            <span>Member since</span>
          </div>
          <span className="font-semibold text-[#222325]">{summary.memberSince}</span>
        </div>

        <div className="flex items-center justify-between text-[#74767e]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ba02c]" />
            <span>Availability</span>
          </div>
          <span className="font-semibold text-[#0ba02c]">{availabilityLabel(availability)}</span>
        </div>

        {languages.length > 0 && (
          <div className="pt-2 border-t border-[#f1f2f4]">
            <p className="text-xs text-[#9199a3] font-medium uppercase tracking-wider mb-1.5">Languages</p>
            <div className="space-y-1">
              {languages.map(({ id, name, proficiency }) => (
                <div key={id} className="flex items-center justify-between text-xs">
                  <span className="text-[#222325] font-medium">{name}</span>
                  <span className="text-[#74767e] capitalize">{proficiency ?? 'Fluent'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.links.length > 0 && (
          <div className="pt-2 border-t border-[#f1f2f4]">
            <p className="text-xs text-[#9199a3] font-medium uppercase tracking-wider mb-2">Connected Accounts</p>
            <div className="flex flex-wrap gap-2">
              {summary.links.map(({ platform, label, href }) => (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#404145] text-xs font-medium transition-colors"
                >
                  <SocialIcon platform={platform} />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
