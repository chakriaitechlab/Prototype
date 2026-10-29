import { Layers, User } from 'lucide-react';
import type { PublicProfile } from '@/types/profile';

export function AboutSkills({ profile }: { profile: PublicProfile }) {
  const { skills } = profile;
  const about = profile.about.trim();

  return (
    <>
      <section className="space-y-3 scroll-mt-36" id="about-me">
        <h2 className="text-base sm:text-lg font-bold text-[#222325]">About me</h2>
        {about ? (
          <p className="text-sm sm:text-base text-[#404145] leading-relaxed whitespace-pre-line max-w-4xl">{about}</p>
        ) : (
          <div className="p-8 sm:p-10 rounded-[8px] bg-white border border-dashed border-[#dadbdd] text-center">
            <User className="w-10 h-10 text-[#9199a3] mx-auto mb-3" />
            <p className="text-base font-semibold text-[#222325]">No bio added yet</p>
            <p className="text-xs text-[#74767e] mt-1">This creator hasn&apos;t written an about section yet.</p>
          </div>
        )}
      </section>

      <section className="space-y-3 pt-2 scroll-mt-36" id="skills">
        <h2 className="text-base sm:text-lg font-bold text-[#222325]">Skills</h2>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map(({ id, name }) => (
              <span
                key={id}
                className="rounded-full border border-[#dadbdd] hover:border-[#222325] bg-white px-4 py-2 text-xs sm:text-sm text-[#404145] font-medium transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-[8px] bg-white border border-dashed border-[#dadbdd] text-center">
            <Layers className="w-10 h-10 text-[#9199a3] mx-auto mb-3" />
            <p className="text-base font-semibold text-[#222325]">No skills listed yet</p>
            <p className="text-xs text-[#74767e] mt-1">This creator hasn&apos;t added any skills yet.</p>
          </div>
        )}
      </section>
    </>
  );
}
