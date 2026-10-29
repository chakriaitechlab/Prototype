'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Landmark } from 'lucide-react';
import { SaveJobButton } from '@/components/jobs/SaveJobButton';
import type { GovtJobDetail } from '@/types/jobs';
import { GovtJobShareButton } from './GovtJobShareButton';

type GovtJobHeaderProps = {
  job: GovtJobDetail;
  url: string;
  children: ReactNode;
};

export function GovtJobHeader({ job, url, children }: GovtJobHeaderProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)] sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#bbf7d0] bg-[#f0fdf4]">
            {job.organizationLogo && !logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.organizationLogo}
                alt={job.organizationName}
                className="size-[85%] object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <Landmark size={36} className="text-[#16a34a]" />
            )}
          </div>

          <div>
            <h1 className="mb-1.5 mt-0 text-[clamp(1.25rem,2.5vw,1.65rem)] font-bold leading-[1.3] text-[#0f172a]">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[0.95rem] font-semibold text-[#16a34a]">
              <span>{job.organizationName}</span>
              {job.advertisementNo && (
                <span className="text-[0.8rem] font-normal text-[#64748b]">(স্মারক: {job.advertisementNo})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center overflow-hidden rounded-full border border-[#e2e8f0] bg-white [&_.jp-fcard-save]:m-0 [&_.jp-fcard-save]:rounded-full">
            <SaveJobButton jobId={job.id} variant="icon" jobType="govt" />
          </span>
          <GovtJobShareButton title={`${job.title} - ${job.organizationName}`} url={url} />
        </div>
      </div>

      {children}
    </div>
  );
}
