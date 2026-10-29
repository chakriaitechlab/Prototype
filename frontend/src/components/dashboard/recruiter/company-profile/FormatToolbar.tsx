'use client';

import type { RefObject } from 'react';

const MARKS = [
  { label: 'B', className: 'is-bold', open: '**', close: '**' },
  { label: 'I', className: 'is-italic', open: '_', close: '_' },
  { label: 'U', className: 'is-underline', open: '<u>', close: '</u>' },
  { label: 'S', className: 'is-strike', open: '~~', close: '~~' },
] as const;

function wrapSelection(el: HTMLTextAreaElement, before: string, after: string) {
  const { selectionStart: start, selectionEnd: end, value } = el;
  return `${value.slice(0, start)}${before}${value.slice(start, end) || 'text'}${after}${value.slice(end)}`;
}

interface FormatToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}

export function FormatToolbar({ textareaRef, value, onChange }: FormatToolbarProps) {
  const wrap = (before: string, after: string) => {
    const el = textareaRef.current;
    if (el) onChange(wrapSelection(el, before, after));
  };
  const appendLine = (prefix: string) => onChange(`${value}${value ? '\n' : ''}${prefix}`);

  return (
    <div className="cset-bio-toolbar" aria-label="Formatting">
      {MARKS.map(({ label, className, open, close }) => (
        <button key={label} type="button" className={`cset-bio-tool ${className}`} onClick={() => wrap(open, close)}>
          {label}
        </button>
      ))}
      <button type="button" className="cset-bio-tool" aria-label="Link" onClick={() => wrap('[', '](https://)')}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </button>
      <button type="button" className="cset-bio-tool" aria-label="Bullet list" onClick={() => appendLine('- ')}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button type="button" className="cset-bio-tool" aria-label="Numbered list" onClick={() => appendLine('1. ')}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </button>
    </div>
  );
}
