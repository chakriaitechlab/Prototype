'use client';

import { ABOUT_MAX_LENGTH, ABOUT_MIN_LENGTH } from '@/utils/profile';
import type { ProfileEditor } from '../use-profile-editor';

export function AboutSection({ editor }: { editor: ProfileEditor }) {
  const { draft, update } = editor;
  const remaining = ABOUT_MIN_LENGTH - draft.about.trim().length;

  return (
    <>
      <h3 className="cset-section-title">Professional Summary</h3>
      <label className="cset-label" htmlFor="profile-about">About You</label>
      <textarea
        id="profile-about"
        className="cset-input min-h-[180px] !p-[0.875rem]"
        value={draft.about}
        onChange={(e) => update('about', e.target.value)}
        placeholder="Tell recruiters about your expertise, experience, and the roles you are interested in…"
        rows={8}
        maxLength={ABOUT_MAX_LENGTH}
      />
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        {remaining > 0 ? (
          <span className="text-amber-600 font-medium">{remaining} more characters needed for 100%</span>
        ) : (
          <span className="text-emerald-600 font-medium">Length requirement met</span>
        )}
        <span>
          {draft.about.length}/{ABOUT_MAX_LENGTH} characters
        </span>
      </div>
    </>
  );
}
