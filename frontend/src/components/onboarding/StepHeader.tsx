import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/types/auth';
import { stepProgress } from '@/utils/routes';
import type { ProgressStep } from '@/utils/routes';

interface StepHeaderProps {
  role: UserRole;
  step: ProgressStep;
  title?: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
}

export function StepHeader({ role, step, title, subtitle, backHref, backLabel = 'Back' }: StepHeaderProps) {
  const { current, total, percent, isLast } = stepProgress(role, step);

  return (
    <>
      <Link href={backHref} className="jp-auth-back">
        <ArrowLeft size={16} aria-hidden />
        {backLabel}
      </Link>

      <div className="jp-onboard-progress" aria-label={`Step ${current} of ${total}`}>
        <span className="jp-onboard-progress-label">
          Step {current} of {total}
          {isLast ? ' (Final Step)' : ''}
        </span>
        <div className="jp-onboard-progress-track">
          <div className="jp-onboard-progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {title ? (
        <header className="jp-auth-heading">
          <h1>{title}</h1>
          <p className="jp-auth-subtitle">{subtitle}</p>
        </header>
      ) : null}
    </>
  );
}
