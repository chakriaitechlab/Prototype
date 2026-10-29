'use client';

import { Plus, X } from 'lucide-react';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { DraftSocialLink, SocialPlatform } from '@/types/company';
import { newLinkId, SOCIAL_PLATFORMS } from '@/utils/company-profile';
import type { CompanyEditor } from '../use-company-editor';

export function SocialLinksSection({ editor }: { editor: CompanyEditor }) {
  const { draft, patch } = editor;
  const links = draft.socialLinks;

  const updateLink = (id: string, next: Partial<DraftSocialLink>) =>
    patch({ socialLinks: links.map((link) => (link.id === id ? { ...link, ...next } : link)) });

  const addLink = () => {
    const used = new Set(links.map(({ platform }) => platform));
    const platform = SOCIAL_PLATFORMS.find(({ id }) => !used.has(id))?.id ?? 'website';
    patch({ socialLinks: [...links, { id: newLinkId(), platform, url: '' }] });
  };

  return (
    <section className="cset-section">
      <h3 className="cset-section-title">Links</h3>
      <div className="cset-social-list">
        {links.map((link, idx) => (
          <div key={link.id} className="cset-social-row">
            <label className="cset-label">Link {idx + 1}</label>
            <div className="cset-social-field">
              <div className="cset-social-platform">
                <span className="cset-social-mark">
                  <SocialIcon platform={link.platform} />
                </span>
                <select
                  className="cset-social-select"
                  value={link.platform}
                  onChange={(e) => updateLink(link.id, { platform: e.target.value as SocialPlatform })}
                >
                  {SOCIAL_PLATFORMS.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <svg className="cset-social-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                className="cset-social-url"
                type="url"
                placeholder={SOCIAL_PLATFORMS.find(({ id }) => id === link.platform)?.placeholder}
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
              />
              <button
                type="button"
                className="cset-social-remove"
                aria-label={`Remove link ${idx + 1}`}
                onClick={() => patch({ socialLinks: links.filter(({ id }) => id !== link.id) })}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="cset-social-add" onClick={addLink}>
        <Plus size={16} /> Add New Link
      </button>
    </section>
  );
}
