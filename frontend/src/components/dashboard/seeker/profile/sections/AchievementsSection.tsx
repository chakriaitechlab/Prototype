'use client';

import { newId } from '@/utils/profile';
import { EmptyList, EntryCard, ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function AchievementsSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  return (
    <>
      <ListHeader
        title="Honors & Achievements"
        addLabel="Add Achievement"
        onAdd={() => addItem('achievements', { id: newId(), title: '' })}
      />

      {draft.achievements.length === 0 && <EmptyList>Add awards, competition results, or recognitions.</EmptyList>}

      <div className="space-y-4">
        {draft.achievements.map((achievement, i) => (
          <EntryCard key={achievement.id} onRemove={() => removeItem('achievements', i)}>
            <div className="space-y-3">
              <div>
                <label className="cset-label" htmlFor={`ach-title-${achievement.id}`}>Title</label>
                <input
                  id={`ach-title-${achievement.id}`}
                  className="cset-input"
                  value={achievement.title}
                  maxLength={160}
                  onChange={(e) => updateItem('achievements', i, { title: e.target.value })}
                  placeholder="e.g. 1st Place - National Hackathon 2024"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`ach-desc-${achievement.id}`}>Description</label>
                <textarea
                  id={`ach-desc-${achievement.id}`}
                  className="cset-input min-h-[80px]"
                  value={achievement.description ?? ''}
                  maxLength={1000}
                  onChange={(e) => updateItem('achievements', i, { description: e.target.value })}
                  rows={2}
                  placeholder="Details about the award or project…"
                />
              </div>
            </div>
          </EntryCard>
        ))}
      </div>
    </>
  );
}
