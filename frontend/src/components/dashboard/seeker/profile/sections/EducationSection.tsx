'use client';

import { newId } from '@/utils/profile';
import { EmptyList, EntryCard, ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function EducationSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  return (
    <>
      <ListHeader
        title="Education"
        addLabel="Add Education"
        onAdd={() => addItem('education', { id: newId(), degree: '', school: '' })}
      />

      {draft.education.length === 0 && <EmptyList>Add degrees, certifications, or schools attended.</EmptyList>}

      <div className="space-y-4">
        {draft.education.map((edu, i) => (
          <EntryCard key={edu.id} onRemove={() => removeItem('education', i)}>
            <div className="cset-fields-grid">
              <div>
                <label className="cset-label" htmlFor={`edu-degree-${edu.id}`}>Degree / Program</label>
                <input
                  id={`edu-degree-${edu.id}`}
                  className="cset-input"
                  value={edu.degree ?? ''}
                  maxLength={160}
                  onChange={(e) => updateItem('education', i, { degree: e.target.value })}
                  placeholder="e.g. B.Sc in Computer Science"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`edu-school-${edu.id}`}>Institution / University</label>
                <input
                  id={`edu-school-${edu.id}`}
                  className="cset-input"
                  value={edu.school ?? ''}
                  maxLength={160}
                  onChange={(e) => updateItem('education', i, { school: e.target.value })}
                  placeholder="e.g. University of Dhaka"
                />
              </div>
            </div>
          </EntryCard>
        ))}
      </div>
    </>
  );
}
