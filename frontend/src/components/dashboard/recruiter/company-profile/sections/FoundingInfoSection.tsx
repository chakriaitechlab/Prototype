'use client';

import { useRef } from 'react';
import { INDUSTRIES, ORGANIZATION_TYPES, TEAM_SIZES } from '@/utils/company-profile';
import type { CompanyDraft } from '@/types/company';
import { FormatToolbar } from '../FormatToolbar';
import type { CompanyEditor } from '../use-company-editor';

const SELECTS: { key: 'organizationType' | 'industry' | 'teamSize'; label: string; options: string[] }[] = [
  { key: 'organizationType', label: 'Organization Type', options: ORGANIZATION_TYPES },
  { key: 'industry', label: 'Industry Types', options: INDUSTRIES },
  { key: 'teamSize', label: 'Team Size', options: TEAM_SIZES },
];

export function FoundingInfoSection({ editor }: { editor: CompanyEditor }) {
  const { draft, patch } = editor;
  const visionRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  return (
    <section className="cset-section">
      <div className="cset-founding-top">
        {SELECTS.map(({ key, label, options }) => (
          <div key={key}>
            <label className="cset-label">{label}</label>
            <select
              className={`cset-input cset-select${draft[key] ? '' : ' is-placeholder'}`}
              value={draft[key]}
              onChange={(e) => patch({ [key]: e.target.value } as Partial<CompanyDraft>)}
            >
              <option value="">Select...</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="cset-founding-mid">
        <div>
          <label className="cset-label">Year of Establishment</label>
          <div className="cset-input-wrap">
            <input
              ref={dateRef}
              className="cset-input cset-input--with-trailing"
              type="date"
              value={draft.foundedOn}
              onChange={(e) => patch({ foundedOn: e.target.value })}
            />
            <button
              type="button"
              className="cset-input-trailing"
              aria-label="Open calendar"
              onClick={() => dateRef.current?.showPicker?.()}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <label className="cset-label">Company Website</label>
          <div className="cset-input-wrap">
            <span className="cset-input-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </span>
            <input
              className="cset-input cset-input--with-icon"
              type="url"
              placeholder="Website url..."
              value={draft.website}
              onChange={(e) => patch({ website: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="cset-bio">
        <label className="cset-label">Company Vision</label>
        <div className="cset-bio-box">
          <textarea
            ref={visionRef}
            className="cset-textarea"
            rows={5}
            placeholder="Tell us about your company vision..."
            value={draft.vision}
            onChange={(e) => patch({ vision: e.target.value })}
          />
          <FormatToolbar textareaRef={visionRef} value={draft.vision} onChange={(vision) => patch({ vision })} />
        </div>
      </div>
    </section>
  );
}
