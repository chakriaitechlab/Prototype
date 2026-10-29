import { Loader2, Save } from 'lucide-react';
import { CompletionRing } from '@/components/ui/CompletionRing';

interface CompanyProfileHeaderProps {
  percent: number;
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
}

export function CompanyProfileHeader({ percent, saving, dirty, onSave }: CompanyProfileHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex flex-nowrap items-center gap-3.5">
          <h1 className="cset-title !m-0 leading-[1.2]">Company Profile</h1>
          <CompletionRing percent={percent} />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Manage your company identity, founding details, office locations, and public branding.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className={`cset-btn-primary !px-6 !py-2.5 !text-sm transition-all duration-200 ${
            dirty
              ? '!cursor-pointer !bg-[#0a65cc] shadow-sm hover:!bg-[#084f9e]'
              : '!cursor-not-allowed !bg-[#0a65cc]/50 !text-white/70 !shadow-none'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
