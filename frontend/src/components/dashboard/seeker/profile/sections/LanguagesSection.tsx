'use client';

import { Trash2 } from 'lucide-react';
import type { LanguageProficiency } from '@/types/profile';
import { LANGUAGE_PROFICIENCY_OPTIONS, newId } from '@/utils/profile';
import { ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function LanguagesSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  return (
    <>
      <ListHeader
        title="Languages"
        addLabel="Add Language"
        onAdd={() => addItem('languages', { id: newId(), name: '', proficiency: 'conversational' })}
      />

      <div className="space-y-4">
        {draft.languages.map((language, i) => (
          <div
            key={language.id}
            className="flex flex-wrap items-end gap-4 p-4 border border-[#e5e7eb] rounded-[4px] bg-[#fafafa]"
          >
            <div className="flex-1 min-w-[220px]">
              <label className="cset-label" htmlFor={`lang-name-${language.id}`}>Language</label>
              <input
                id={`lang-name-${language.id}`}
                className="cset-input"
                value={language.name}
                maxLength={60}
                onChange={(e) => updateItem('languages', i, { name: e.target.value })}
                placeholder="e.g. English, Bengali"
              />
            </div>
            <div className="w-[220px]">
              <label className="cset-label" htmlFor={`lang-level-${language.id}`}>Proficiency</label>
              <select
                id={`lang-level-${language.id}`}
                className="cset-input cset-select"
                value={language.proficiency ?? 'conversational'}
                onChange={(e) => updateItem('languages', i, { proficiency: e.target.value as LanguageProficiency })}
              >
                {LANGUAGE_PROFICIENCY_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeItem('languages', i)}
              className="inline-flex items-center gap-[0.4rem] h-12 px-4 border border-[#fee2e2] rounded-[4px] bg-white text-[#ef4444] text-sm cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
