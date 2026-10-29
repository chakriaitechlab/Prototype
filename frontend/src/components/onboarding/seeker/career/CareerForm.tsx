'use client';

import { startTransition, useActionState, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Briefcase, Loader2 } from 'lucide-react';
import { saveCareerAction, skipCareerAction } from '@/actions/onboarding.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

export function CareerForm({ initialHeadline, initialAbout }: { initialHeadline: string; initialAbout: string }) {
  const [state, formAction, saving] = useActionState(saveCareerAction, {});
  const [skipping, startSkip] = useTransition();
  const [skipResult, setSkipResult] = useState<ActionState>({});
  const [headline, setHeadline] = useState(initialHeadline);
  const [about, setAbout] = useState(initialAbout);

  const busy = saving || skipping;
  const alert = state.error ? state : skipResult;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const handleSkip = () => {
    startSkip(async () => {
      const result = await skipCareerAction();
      if (result?.error) setSkipResult(result);
    });
  };

  return (
    <>
      <FormAlert message={alert.error} trigger={alert} />

      <form onSubmit={handleSubmit} className="jp-auth-form" autoComplete="off">
        <div className="jp-field">
          <label htmlFor="seeker-headline">
            Professional Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="jp-input-wrap">
            <Briefcase size={18} className="jp-input-icon" aria-hidden />
            <input
              id="seeker-headline"
              name="headline"
              type="text"
              placeholder="e.g. React Developer, Full Stack Engineer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={120}
              required
              autoFocus
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <p className="jp-career-note">Your primary role or specialization (e.g. React Developer, Frontend Engineer).</p>
        </div>

        <div className="jp-field">
          <div className="jp-career-label-row">
            <label htmlFor="seeker-about">Professional Summary</label>
            <span className="jp-career-char-count">{about.length} characters</span>
          </div>
          <textarea
            id="seeker-about"
            name="about"
            rows={5}
            placeholder="Write a brief overview of your background, experience, technical skills, and what kind of projects or roles you excel at..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={2000}
            className="jp-career-textarea"
          />
          <p className="jp-career-note">
            Highlight your key skills, tech stack, and experience. This will appear at the top of your public profile.
          </p>
        </div>

        <div className="jp-career-actions">
          <button type="submit" className="jp-btn jp-btn--primary jp-btn--block" disabled={busy || !headline.trim()}>
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                <span>Saving Profile…</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Go to Dashboard</span>
                <ArrowRight size={18} aria-hidden />
              </>
            )}
          </button>

          <button type="button" className="jp-cv-skip-btn" onClick={handleSkip} disabled={busy}>
            <span>Skip for now</span>
            <ArrowRight size={16} aria-hidden />
          </button>
        </div>
      </form>
    </>
  );
}
