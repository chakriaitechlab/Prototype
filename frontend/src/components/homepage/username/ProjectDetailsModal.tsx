'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Calendar, Code2, ExternalLink, Layers, X } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ProjectEntry } from '@/types/profile';
import { formatDateRange, safeExternalUrl } from '@/utils/public-profile';

interface BottomSheetProps {
  onClose: () => void;
  width: string;
  sheetClassName: string;
  children: ReactNode;
}

export function BottomSheet({ onClose, width, sheetClassName, children }: BottomSheetProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300" onClick={onClose} aria-hidden />

      <div className={`relative z-10 w-full ${width} mx-auto px-4 sm:px-8 py-3 flex items-center justify-end`}>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-white/90 hover:text-white font-medium text-sm sm:text-base cursor-pointer px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
          <span>Close</span>
        </button>
      </div>

      <div
        className={`relative z-10 w-full bg-white rounded-t-[20px] sm:rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 ease-out ${sheetClassName}`}
      >
        <div className="overflow-y-auto max-h-full px-6 sm:px-10 lg:px-12 py-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}

export function ProjectBanner({ project, iconClassName }: { project: ProjectEntry; iconClassName: string }) {
  const tag = project.tags?.[0];

  return (
    <>
      {project.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.image_url} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7f8f9] via-white to-[#e7f0fa]/50 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-[8px] bg-[#f5f5f5] border border-[#dadbdd] text-[#222325] mb-2 shadow-xs">
            <Code2 className={iconClassName} />
          </div>
          <span className="text-xs font-mono text-[#5e6670] tracking-wide uppercase font-semibold">
            {tag || 'Web & Software'}
          </span>
        </div>
      )}

      {tag && (
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-white/95 text-[#222325] border border-[#dadbdd] shadow-xs backdrop-blur-md">
            {tag}
          </span>
        </div>
      )}
    </>
  );
}


interface ProjectDetailsModalProps {
  project: ProjectEntry;
  displayName: string;
  avatarUrl: string | null;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, displayName, avatarUrl, onClose }: ProjectDetailsModalProps) {
  const [missing, setMissing] = useState<{ error: string } | null>(null);
  const liveUrl = safeExternalUrl(project.url);
  const repoUrl = safeExternalUrl(project.repo_url);
  const tags = project.tags ?? [];
  const dates = formatDateRange(project.start_date, project.end_date);

  const open = (url: string, error: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    else setMissing({ error });
  };

  return (
    <BottomSheet onClose={onClose} width="max-w-5xl" sheetClassName="h-[88vh] sm:h-[92vh] max-h-[94vh]">
      <FormAlert message={missing?.error} trigger={missing} />

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dadbdd]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#f5f5f5] text-[#222325] text-xs font-semibold uppercase tracking-wider border border-[#dadbdd]">
                Project / Service
              </span>
              {dates && (
                <span className="text-xs text-[#74767e] inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9199a3]" />
                  <span>{dates}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#222325] leading-snug">{project.title}</h2>
            <div className="flex items-center gap-2 pt-0.5">
              <UserAvatar
                src={avatarUrl}
                name={displayName}
                className="w-6 h-6 rounded-full border border-[#dadbdd] text-[10px]"
                fallbackClassName="bg-[#e7f0fa] text-[#0a65cc] font-bold"
              />
              <p className="text-xs sm:text-sm text-[#74767e]">
                Created by <span className="font-semibold text-[#222325]">{displayName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => open(liveUrl, 'No live demo link provided for this project')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#0a65cc] hover:bg-[#084b99] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demo</span>
            </button>
            <button
              type="button"
              onClick={() => open(repoUrl, 'No repository link provided for this project')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#222325] hover:bg-black active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            >
              <span className="inline-flex [&_svg]:fill-white">
                <SocialIcon platform="github" />
              </span>
              <span>Repository</span>
            </button>
          </div>
        </div>

        <div className="relative aspect-[16/9] w-full rounded-[10px] overflow-hidden border border-[#dadbdd] bg-[#f7f8f9] shadow-xs">
          <ProjectBanner project={project} iconClassName="w-10 h-10" />
        </div>

        {tags.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#74767e] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#74767e]" />
              <span>Skills &amp; Technologies</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-[#dadbdd] bg-[#f8f9fa] text-xs sm:text-sm font-medium text-[#404145]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-[#222325]">Project Details</h3>
          <div className="text-sm sm:text-base text-[#404145] leading-relaxed whitespace-pre-line bg-[#fafafa] p-5 sm:p-6 rounded-[8px] border border-[#e4e5e7]">
            {project.description || 'No detailed description provided for this project.'}
          </div>
        </div>

        {(liveUrl || repoUrl) && (
          <div className="rounded-[8px] border border-[#dadbdd] bg-white p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#74767e]">Available Resources</h4>
            <div className="space-y-2 text-sm">
              {liveUrl && (
                <ResourceRow icon={<ExternalLink className="w-4 h-4 text-[#0a65cc]" />} label="Live Production / Demo" href={liveUrl} />
              )}
              {repoUrl && (
                <ResourceRow icon={<SocialIcon platform="github" />} label="Source Code Repository" href={repoUrl} />
              )}
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

function ResourceRow({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded bg-[#f9fafb] border border-[#e4e5e7]">
      <span className="font-semibold text-[#222325] flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0a65cc] hover:underline font-mono text-xs truncate max-w-sm">
        {href}
      </a>
    </div>
  );
}
