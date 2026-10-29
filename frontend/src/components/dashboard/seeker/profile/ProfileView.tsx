'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfileAction } from '@/actions/profile.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState, AuthUser } from '@/types/auth';
import type { ProfileCompletion, ProfileTab, SeekerProfile } from '@/types/profile';
import { useProfileEditor } from './use-profile-editor';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs } from './ProfileTabs';
import { PersonalSection } from './sections/PersonalSection';
import { AboutSection } from './sections/AboutSection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { AchievementsSection } from './sections/AchievementsSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { LinksSection } from './sections/LinksSection';
import { PreferencesSection } from './sections/PreferencesSection';
import { ResumeSection } from './sections/ResumeSection';

interface ProfileViewProps {
  user: AuthUser;
  profile: SeekerProfile;
  completion: ProfileCompletion | null;
  initialTab: ProfileTab;
}

export function ProfileView({ user, profile, completion, initialTab }: ProfileViewProps) {
  const router = useRouter();
  const editor = useProfileEditor(profile);
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [alert, setAlert] = useState<ActionState>({});
  const [saving, startSaving] = useTransition();

  const notify = (state: ActionState) => {
    setAlert(state);
    if (!state.error) router.refresh();
  };

  const save = () =>
    startSaving(async () => {
      const result = await saveProfileAction(editor.changes);
      if (result.profile) editor.markSaved(result.profile);
      notify(result);
    });

  const sections: Record<ProfileTab, ReactNode> = {
    personal: <PersonalSection editor={editor} user={user} completion={completion} onNotify={notify} />,
    about: <AboutSection editor={editor} />,
    skills: <SkillsSection editor={editor} />,
    experience: <ExperienceSection editor={editor} />,
    education: <EducationSection editor={editor} />,
    projects: <ProjectsSection editor={editor} onNotify={setAlert} />,
    certifications: <CertificationsSection editor={editor} />,
    achievements: <AchievementsSection editor={editor} />,
    languages: <LanguagesSection editor={editor} />,
    links: <LinksSection editor={editor} />,
    preferences: <PreferencesSection editor={editor} />,
    resume: <ResumeSection editor={editor} onNotify={notify} />,
  };

  return (
    <div className="w-full pb-16">
      <FormAlert message={alert.error ?? alert.message} type={alert.error ? 'error' : 'success'} trigger={alert} />

      <div className="sticky top-[-1.25rem] lg:top-[-2rem] z-20 bg-white -mt-5 lg:-mt-8 pt-5 lg:pt-8 -mx-4 px-4 lg:-mx-10 lg:px-10 mb-6 border-b border-[#e4e5e8]">
        <ProfileHeader
          completion={completion}
          username={user.username}
          saving={saving}
          dirty={editor.dirty}
          onSave={save}
        />
        <ProfileTabs active={tab} onChange={setTab} />
      </div>

      <section id="profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${tab}`} className="cset-section">
        {sections[tab]}
      </section>
    </div>
  );
}
