'use client';

import { useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import type { ProjectEntry } from '@/types/profile';
import { ProjectBanner, ProjectDetailsModal } from './ProjectDetailsModal';

interface ServicesListProps {
  projects: ProjectEntry[];
  displayName: string;
  avatarUrl: string | null;
}

export function ServicesList({ projects, displayName, avatarUrl }: ServicesListProps) {
  const [selected, setSelected] = useState<ProjectEntry | null>(null);

  return (
    <section className="pt-6 scroll-mt-36 space-y-6" id="services">
      <h2 className="pb-2 text-xl sm:text-2xl font-bold text-[#222325] tracking-tight">See my services</h2>

      {projects.length === 0 ? (
        <div className="p-10 rounded-[8px] bg-white border border-dashed border-[#dadbdd] text-center">
          <FolderGit2 className="w-10 h-10 text-[#9199a3] mx-auto mb-3" />
          <p className="text-base font-semibold text-[#222325]">No services listed yet</p>
          <p className="text-xs text-[#74767e] mt-1">Contact the creator directly for custom requirements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col justify-between rounded-[8px] bg-white border border-[#dadbdd] hover:border-[#222325] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div>
                <div className="relative aspect-[16/9] w-full bg-[#f7f8f9] overflow-hidden border-b border-[#e4e5e7] [&>img]:group-hover:scale-105 [&>img]:transition-transform [&>img]:duration-300">
                  <ProjectBanner project={project} iconClassName="w-8 h-8" />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm sm:text-base font-semibold text-[#222325] group-hover:text-[#0a65cc] line-clamp-2 leading-snug mb-2 transition-colors">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-xs sm:text-sm text-[#62646a] line-clamp-3 leading-relaxed">{project.description}</p>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#e4e5e7] bg-white flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setSelected(project)}
                  className="px-3.5 py-1.5 rounded-[4px] border border-[#dadbdd] hover:border-[#222325] hover:bg-[#f5f5f5] text-[#222325] font-semibold text-xs transition-colors cursor-pointer"
                >
                  More details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ProjectDetailsModal
          project={selected}
          displayName={displayName}
          avatarUrl={avatarUrl}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
