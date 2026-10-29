'use client';

import { newId } from '@/utils/profile';
import { EmptyList, EntryCard, ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function ExperienceSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  return (
    <>
      <ListHeader
        title="Work Experience"
        addLabel="Add Role"
        onAdd={() => addItem('experience', { id: newId(), title: '', company: '', current: false, highlights: [] })}
      />

      {draft.experience.length === 0 && (
        <EmptyList>Add your previous or current positions so recruiters can evaluate your background.</EmptyList>
      )}

      <div className="space-y-4">
        {draft.experience.map((exp, i) => (
          <EntryCard
            key={exp.id}
            onRemove={() => removeItem('experience', i)}
            footerStart={
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(exp.current)}
                  onChange={(e) => updateItem('experience', i, { current: e.target.checked })}
                  className="rounded border-slate-300 text-[#0a65cc] focus:ring-[#0a65cc]"
                />
                Currently working here
              </label>
            }
          >
            <div className="cset-fields-grid">
              <div>
                <label className="cset-label" htmlFor={`exp-title-${exp.id}`}>Job Title</label>
                <input
                  id={`exp-title-${exp.id}`}
                  className="cset-input"
                  value={exp.title ?? ''}
                  maxLength={120}
                  onChange={(e) => updateItem('experience', i, { title: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`exp-company-${exp.id}`}>Company</label>
                <input
                  id={`exp-company-${exp.id}`}
                  className="cset-input"
                  value={exp.company ?? ''}
                  maxLength={120}
                  onChange={(e) => updateItem('experience', i, { company: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`exp-start-${exp.id}`}>Start Date</label>
                <input
                  id={`exp-start-${exp.id}`}
                  className="cset-input"
                  value={exp.start_date ?? ''}
                  maxLength={40}
                  onChange={(e) => updateItem('experience', i, { start_date: e.target.value })}
                  placeholder="e.g. Jan 2022"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`exp-end-${exp.id}`}>End Date</label>
                <input
                  id={`exp-end-${exp.id}`}
                  className="cset-input"
                  value={exp.end_date ?? ''}
                  maxLength={40}
                  onChange={(e) => updateItem('experience', i, { end_date: e.target.value })}
                  placeholder="e.g. Present"
                  disabled={exp.current}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="cset-label" htmlFor={`exp-desc-${exp.id}`}>Role Description</label>
              <textarea
                id={`exp-desc-${exp.id}`}
                className="cset-input min-h-[90px]"
                value={exp.description ?? ''}
                maxLength={2000}
                onChange={(e) => updateItem('experience', i, { description: e.target.value })}
                rows={3}
                placeholder="Outline key achievements, projects delivered, or technologies used…"
              />
            </div>
          </EntryCard>
        ))}
      </div>
    </>
  );
}
