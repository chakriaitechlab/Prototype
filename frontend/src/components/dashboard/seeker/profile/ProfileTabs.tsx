'use client';

import type { ComponentType } from 'react';
import { Award, Briefcase, FileText, Folder, Globe, GraduationCap, Link2, Sparkles, Target, Trophy, User } from 'lucide-react';
import type { ProfileTab } from '@/types/profile';

const TABS: { id: ProfileTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'about', label: 'About', icon: FileText },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'preferences', label: 'Job Prefs', icon: Target },
  { id: 'resume', label: 'Resume', icon: FileText },
];

interface ProfileTabsProps {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export function ProfileTabs({ active, onChange }: ProfileTabsProps) {
  return (
    <div className="cset-tabs cset-tabs--scroll no-scrollbar" role="tablist">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            id={`profile-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls="profile-panel"
            className={`cset-tab whitespace-nowrap${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon className="cset-tab-ico" aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
