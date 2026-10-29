'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Brain, Check, ChevronDown, GraduationCap, Zap } from 'lucide-react';
import type { LearnMode } from '@/types/learn';

const MODES = [
  { id: 'fast', label: 'Fast', hint: 'Concise, quick replies', icon: Zap },
  { id: 'thinking', label: 'Thinking', hint: 'Step-by-step reasoning', icon: Brain },
  { id: 'expert', label: 'Expert', hint: 'Deep, thorough answers', icon: GraduationCap },
] as const;

interface ModeSelectorProps {
  value: LearnMode;
  onChange: (mode: LearnMode) => void;
  disabled: boolean;
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const active = MODES.find((mode) => mode.id === value) ?? MODES[0];
  const ActiveIcon = active.icon;

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

  const onMenuKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className="learning-mode-selector" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="learning-mode-selector__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={active.hint}
      >
        <ActiveIcon size={13} />
        <span className="learning-mode-selector__label">{active.label}</span>
        <ChevronDown size={13} data-open={open ? 'true' : 'false'} />
      </button>

      {open && (
        <div ref={menuRef} className="learning-mode-selector__menu" role="listbox" aria-label="Reply mode" onKeyDown={onMenuKeyDown}>
          {MODES.map(({ id, label, hint, icon: Icon }) => {
            const selected = id === value;
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(id);
                  setOpen(false);
                }}
                className="learning-mode-selector__option"
                data-active={selected ? 'true' : 'false'}
              >
                <span className="learning-mode-selector__option-icon">
                  <Icon size={13} />
                </span>
                <span className="learning-mode-selector__option-meta">
                  <span className="learning-mode-selector__option-label">{label}</span>
                  <span className="learning-mode-selector__option-desc">{hint}</span>
                </span>
                {selected && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
