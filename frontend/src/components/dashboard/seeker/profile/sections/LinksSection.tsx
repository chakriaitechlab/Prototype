'use client';

import { Plus, X } from 'lucide-react';
import type { LinkPlatform, LinkRow } from '@/types/profile';
import { LINK_PLATFORMS, newId, nextLinkPlatform } from '@/utils/profile';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { ProfileEditor } from '../use-profile-editor';

export function LinksSection({ editor }: { editor: ProfileEditor }) {
  const { draft, addItem, updateItem, removeItem } = editor;

  const placeholderFor = (platform: LinkPlatform) =>
    LINK_PLATFORMS.find(({ id }) => id === platform)?.placeholder ?? 'https://yourwebsite.com';

  const addLink = () => {
    const row: LinkRow = { id: newId(), platform: nextLinkPlatform(draft.links), url: '' };
    addItem('links', row);
  };

  return (
    <>
      <h3 className="cset-section-title">Links</h3>
      <div className="cset-social-list">
        {draft.links.map((link, i) => (
          <div key={link.id} className="cset-social-row">
            <label className="cset-label" htmlFor={`link-url-${link.id}`}>Link {i + 1}</label>
            <div className="cset-social-field">
              <div className="cset-social-platform">
                <span className="cset-social-mark">
                  <SocialIcon platform={link.platform} />
                </span>
                <select
                  className="cset-social-select"
                  aria-label={`Link ${i + 1} platform`}
                  value={link.platform}
                  onChange={(e) => updateItem('links', i, { platform: e.target.value as LinkPlatform })}
                >
                  {LINK_PLATFORMS.map(({ id, label }) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
                <svg className="cset-social-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                id={`link-url-${link.id}`}
                className="cset-social-url"
                type="url"
                maxLength={500}
                placeholder={placeholderFor(link.platform)}
                value={link.url}
                onChange={(e) => updateItem('links', i, { url: e.target.value })}
              />
              <button
                type="button"
                className="cset-social-remove"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => removeItem('links', i)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="cset-social-add" onClick={addLink}>
        <Plus className="w-[1.125rem] h-[1.125rem]" />
        Add New Link
      </button>
    </>
  );
}
