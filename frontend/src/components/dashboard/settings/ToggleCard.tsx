import type { ReactNode } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onToggle, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`cset-toggle${checked ? ' is-on' : ''}`}
      onClick={onToggle}
    >
      <span className="cset-toggle-knob" />
      <span className="cset-toggle-label">{checked ? 'YES' : 'NO'}</span>
    </button>
  );
}

interface ToggleCardProps {
  title: string;
  note: string;
  className?: string;
  children: ReactNode;
}

export function ToggleCard({ title, note, className = '', children }: ToggleCardProps) {
  return (
    <div className={`cset-privacy-card ${className}`.trim()}>
      <div>
        <h4 className="cset-privacy-title">{title}</h4>
        <p className="cset-privacy-note">{note}</p>
      </div>
      {children}
    </div>
  );
}
