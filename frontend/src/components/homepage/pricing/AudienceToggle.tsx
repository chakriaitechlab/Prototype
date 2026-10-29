'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { PlanAudience } from '@/types/diamonds';

interface AudienceToggleProps {
  seeker: ReactNode;
  recruiter: ReactNode;
}

export function AudienceToggle({ seeker, recruiter }: AudienceToggleProps) {
  const [audience, setAudience] = useState<PlanAudience>('seeker');

  return (
    <>
      <div className="flex justify-center mb-10">
        <div className="jp-seg" role="tablist" aria-label="Choose audience">
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'seeker'}
            className={audience === 'seeker' ? 'is-active' : undefined}
            onClick={() => setAudience('seeker')}
          >
            For job seekers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === 'recruiter'}
            className={audience === 'recruiter' ? 'is-active' : undefined}
            onClick={() => setAudience('recruiter')}
          >
            For recruiters
          </button>
        </div>
      </div>

      {audience === 'seeker' ? seeker : recruiter}
    </>
  );
}
