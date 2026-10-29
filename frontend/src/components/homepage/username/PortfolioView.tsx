import type { PublicProfile } from '@/types/profile';
import { publicProfileSummary } from '@/utils/public-profile';
import { StickyProfileNav } from './StickyProfileNav';
import { ProfileHero } from './ProfileHero';
import { AboutSkills } from './AboutSkills';
import { ServicesList } from './ServicesList';
import { MoreAboutMeButton } from './MoreAboutMeModal';
import { ContactCard } from './ContactCard';

export function PortfolioView({ profile }: { profile: PublicProfile }) {
  const summary = publicProfileSummary(profile);
  const { displayName, username, avatarUrl, skills, projects } = profile;

  return (
    <div className="min-h-screen bg-white text-[#18191c] selection:bg-[#0a65cc] selection:text-white">
      <StickyProfileNav
        displayName={displayName}
        username={username}
        avatarUrl={avatarUrl}
        contactHref={summary.contactHref}
        hasSkills={skills.length > 0}
        hasServices={projects.length > 0}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full min-w-0 space-y-10">
            <ProfileHero profile={profile} summary={summary} />
            <AboutSkills profile={profile} />
            <ServicesList projects={projects} displayName={displayName} avatarUrl={avatarUrl} />
            <div className="pt-6 pb-2">
              <MoreAboutMeButton
                profile={profile}
                summary={summary}
                className="w-full sm:w-auto px-6 py-3 rounded-[6px] border border-[#222325] hover:bg-[#222325] text-[#222325] hover:text-white font-bold text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          <aside className="w-full lg:w-[350px] shrink-0 space-y-4">
            <div className="flex justify-end pt-1 sm:pt-2">
              <MoreAboutMeButton
                profile={profile}
                summary={summary}
                className="px-5 py-2.5 rounded-[6px] border border-[#95979d] hover:border-[#222325] hover:bg-[#f5f5f5] text-[#222325] text-sm font-semibold transition-all duration-150 inline-flex items-center justify-center shadow-2xs cursor-pointer"
              />
            </div>
            <ContactCard profile={profile} summary={summary} />
          </aside>
        </div>
      </div>
    </div>
  );
}
