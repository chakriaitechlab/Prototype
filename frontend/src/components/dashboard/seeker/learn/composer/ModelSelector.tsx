'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Cpu } from 'lucide-react';

const MODEL = { label: 'Auto', description: 'Default model for all users' };

export function ModelSelector({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="learning-model-selector" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="learning-model-selector__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Switch model"
      >
        <Cpu size={13} />
        <span className="learning-model-selector__label">{MODEL.label}</span>
        <ChevronDown size={13} data-open={open ? 'true' : 'false'} />
      </button>

      {open && (
        <div className="learning-model-selector__menu" role="listbox" aria-label="Model">
          <div className="learning-model-selector__group">
            <div className="learning-model-selector__group-label">{MODEL.label}</div>
            <button
              type="button"
              role="option"
              aria-selected
              onClick={() => setOpen(false)}
              className="learning-model-selector__option"
              data-active="true"
              data-locked="false"
            >
              <span className="learning-model-selector__option-meta">
                <span className="learning-model-selector__option-label">
                  {MODEL.label}
                  <span className="learning-model-selector__free-badge">Free</span>
                </span>
                <span className="learning-model-selector__option-desc">{MODEL.description}</span>
              </span>
              <Check size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
