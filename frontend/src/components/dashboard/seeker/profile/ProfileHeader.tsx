import Link from 'next/link';
import { CheckCircle2, Eye, Loader2, Save } from 'lucide-react';
import { CompletionRing } from '@/components/ui/CompletionRing';
import type { ProfileCompletion } from '@/types/profile';

interface ProfileHeaderProps {
  completion: ProfileCompletion | null;
  username: string | null;
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
}

export function ProfileHeader({ completion, username, saving, dirty, onSave }: ProfileHeaderProps) {
  const percent = Math.min(100, Math.max(0, completion?.percent ?? 0));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <div>
        <div className="flex items-center gap-3.5 flex-nowrap">
          <h1 className="cset-title !m-0 leading-[1.2]">Your Profile</h1>
          <CompletionRing percent={percent} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Build your professional profile step by step so recruiters can evaluate your background.
        </p>
        {percent >= 100 && (
          <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 size={14} /> Profile is 100% complete!
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {username ? (
          <Link
            href={`/${encodeURIComponent(username)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cset-btn-secondary cset-btn-sm"
            title="View public profile"
          >
            <Eye className="w-4 h-4" />
            View Profile
          </Link>
        ) : (
          <button type="button" disabled className="cset-btn-secondary cset-btn-sm" title="Choose a public username first">
            <Eye className="w-4 h-4" />
            View Profile
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="cset-btn-primary cset-btn-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
