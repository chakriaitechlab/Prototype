'use client';

import { Trash2 } from 'lucide-react';
import type { SkillLevel } from '@/types/profile';
import { SKILL_LEVEL_OPTIONS, newId } from '@/utils/profile';
import { ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function SkillsSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;
  const named = draft.skills.filter(({ name }) => name.trim());

  return (
    <>
      <ListHeader
        title="Skills & Expertise"
        addLabel="Add Skill"
        onAdd={() => addItem('skills', { id: newId(), name: '', level: 'intermediate' })}
      />
      <p className="text-xs text-slate-500 mb-6">Add at least 3 skills to reach 100% completion.</p>

      {named.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {named.map(({ id, name, level }) => (
            <span
              key={id}
              className="inline-flex items-center gap-2 bg-[#e8eef6] text-[#0a65cc] px-3 py-[0.35rem] rounded-[4px] text-[0.8125rem] font-medium"
            >
              {name}
              {level && <span className="text-[0.6875rem] font-bold uppercase opacity-75">{level}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {draft.skills.map((skill, i) => (
          <div key={skill.id} className="p-4 border border-[#e5e7eb] rounded-[4px] bg-[#fafafa] flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="cset-label !mb-0" htmlFor={`skill-${skill.id}`}>Skill Name</label>
                <button
                  type="button"
                  onClick={() => removeItem('skills', i)}
                  className="inline-flex items-center gap-1 text-xs text-[#ef4444] hover:text-[#dc2626] font-medium transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
              <input
                id={`skill-${skill.id}`}
                className="cset-input"
                value={skill.name}
                maxLength={60}
                onChange={(e) => updateItem('skills', i, { name: e.target.value })}
                placeholder="e.g. TypeScript, React, Python"
              />
            </div>
            <div>
              <label className="cset-label" htmlFor={`skill-level-${skill.id}`}>Proficiency</label>
              <select
                id={`skill-level-${skill.id}`}
                className="cset-input cset-select"
                value={skill.level ?? 'intermediate'}
                onChange={(e) => updateItem('skills', i, { level: e.target.value as SkillLevel })}
              >
                {SKILL_LEVEL_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
