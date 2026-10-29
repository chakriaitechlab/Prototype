'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Briefcase, Check, User } from 'lucide-react';
import { updateRoleAction } from '@/actions/onboarding.actions';
import type { ActionState, UserRole } from '@/types/auth';
import { FormAlert } from '@/components/ui/FormAlert';

const ROLE_OPTIONS = [
  { id: 'SEEKER', title: 'Join as a job seeker', desc: 'Apply & track roles' },
  { id: 'RECRUITER', title: 'Join as a recruiter', desc: 'Post & hire talent' },
] as const;

export function RoleForm() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [alert, setAlert] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!role) {
      setAlert({ error: 'Please select an account type to continue.' });
      return;
    }
    setAlert({});
    startTransition(async () => {
      const result = await updateRoleAction(role);
      if (result?.error) setAlert(result);
    });
  };

  return (
    <>
      <FormAlert message={alert.error} trigger={alert} />

      <p className="jp-section-label">I want to</p>
      <div className="jp-choice-list" role="radiogroup" aria-label="Account type">
        {ROLE_OPTIONS.map(({ id, title, desc }) => {
          const selected = role === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`jp-choice${selected ? ' is-active' : ''}`}
              onClick={() => setRole(id)}
            >
              <span className="jp-choice-icon">
                {id === 'RECRUITER' ? <Briefcase size={20} strokeWidth={1.8} /> : <User size={20} strokeWidth={1.8} />}
              </span>
              <span className="jp-choice-copy">
                <strong>{title}</strong>
                <small>{desc}</small>
              </span>
              <span className="jp-choice-check" aria-hidden>
                {selected ? <Check size={14} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!role || pending}
        className="jp-btn jp-btn--primary jp-auth-submit"
      >
        {pending ? (
          <>Saving…</>
        ) : (
          <>
            Continue
            <ArrowRight size={16} aria-hidden />
          </>
        )}
      </button>
    </>
  );
}
