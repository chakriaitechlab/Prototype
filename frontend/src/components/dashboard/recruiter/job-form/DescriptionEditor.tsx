'use client';

import { useRef } from 'react';

const MARKS = [
  { label: 'B', className: 'is-bold', open: '**', close: '**' },
  { label: 'I', className: 'is-italic', open: '*', close: '*' },
  { label: 'U', className: 'is-underline', open: '<u>', close: '</u>' },
  { label: 'S', className: 'is-strike', open: '~~', close: '~~' },
] as const;

function wrapSelection(el: HTMLTextAreaElement, before: string, after: string, fallback: string) {
  const { selectionStart: start, selectionEnd: end, value } = el;
  return `${value.slice(0, start)}${before}${value.slice(start, end) || fallback}${after}${value.slice(end)}`;
}

interface DescriptionEditorProps {
  value: string;
  onChange: (next: string) => void;
}

export function DescriptionEditor({ value, onChange }: DescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after: string, fallback = 'text') => {
    const el = textareaRef.current;
    if (el) onChange(wrapSelection(el, before, after, fallback));
  };

  return (
    <div className="cpost-editor">
      <textarea
        id="cpost-desc"
        ref={textareaRef}
        className="cpost-textarea"
        required
        rows={10}
        maxLength={10000}
        placeholder="Add your job description, requirements, responsibilities..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="cpost-editor-toolbar" aria-label="Formatting">
        {MARKS.map(({ label, className, open, close }) => (
          <button key={label} type="button" className={`cpost-editor-tool ${className}`} onClick={() => wrap(open, close)}>
            {label}
          </button>
        ))}
        <button
          type="button"
          className="cpost-editor-tool"
          aria-label="Bullet list"
          onClick={() => wrap('- ', '', 'List item')}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
