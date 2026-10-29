'use client';

import { newId } from '@/utils/profile';
import { EmptyList, EntryCard, ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

export function CertificationsSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  return (
    <>
      <ListHeader
        title="Certifications"
        addLabel="Add Certification"
        onAdd={() => addItem('certifications', { id: newId(), name: '' })}
      />

      {draft.certifications.length === 0 && <EmptyList>Add certifications earned from accredited providers.</EmptyList>}

      <div className="space-y-4">
        {draft.certifications.map((cert, i) => (
          <EntryCard key={cert.id} onRemove={() => removeItem('certifications', i)}>
            <div className="cset-fields-grid">
              <div>
                <label className="cset-label" htmlFor={`cert-name-${cert.id}`}>Certification Name</label>
                <input
                  id={`cert-name-${cert.id}`}
                  className="cset-input"
                  value={cert.name}
                  maxLength={160}
                  onChange={(e) => updateItem('certifications', i, { name: e.target.value })}
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className="cset-label" htmlFor={`cert-issuer-${cert.id}`}>Issuer</label>
                <input
                  id={`cert-issuer-${cert.id}`}
                  className="cset-input"
                  value={cert.issuer ?? ''}
                  maxLength={120}
                  onChange={(e) => updateItem('certifications', i, { issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
            </div>
          </EntryCard>
        ))}
      </div>
    </>
  );
}
