'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/** Ambient launch glow & cosmic particles visual */
function BlackHoleVisual({ className = '' }: { className?: string }) {
  return (
    <div className={`jp-blackhole jp-launch-glow${className ? ` ${className}` : ''}`} aria-hidden>
      <span className="jp-launch-glow__wash" />
      <span className="jp-launch-glow__bloom" />
      <span className="jp-launch-glow__ring jp-launch-glow__ring--outer" />
      <span className="jp-launch-glow__ring jp-launch-glow__ring--inner" />
      <span className="jp-launch-glow__flare" />
      <span className="jp-launch-glow__core" />
      <span className="jp-launch-glow__particles">
        {Array.from({ length: 8 }, (_, index) => (
          <i key={index} />
        ))}
      </span>
    </div>
  );
}

/** Modal dialog displayed on clicking the Beta badge */
export function ChakriBetaLaunchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="jp-beta-launch-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jp-beta-launch-title"
    >
      <div className="jp-beta-launch-scene" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="jp-beta-launch-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>

        <BlackHoleVisual className="jp-beta-launch-blackhole" />

        <div className="jp-beta-launch-copy">
          <p className="jp-beta-launch-eyebrow">Chakri.ai · Beta</p>
          <h2 id="jp-beta-launch-title" className="jp-beta-launch-title">
            We are launching soon
          </h2>
          <p className="jp-beta-launch-lead">
            You&apos;re early — step closer to the edge and we&apos;ll pull you in when we go live.
          </p>
          <button type="button" className="jp-beta-launch-cta" onClick={onClose}>
            I&apos;ll wait
          </button>
        </div>
      </div>
    </div>
  );
}

type BadgeProps = {
  inverted?: boolean;
  className?: string;
};

/** Interactive Beta Badge Button that triggers the launch dialog */
export function ChakriBetaBadgeButton({ inverted = false, className = '' }: BadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`jp-logo-beta jp-logo-beta--interactive${inverted ? ' jp-logo-beta--inverted' : ''}${className ? ` ${className}` : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Beta — launching soon"
      >
        Beta
      </button>
      <ChakriBetaLaunchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
