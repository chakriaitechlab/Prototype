import { ArrowRight, Loader2 } from 'lucide-react';

interface CompanyProfileSaveBarProps {
  isFirstTab: boolean;
  isLastTab: boolean;
  saving: boolean;
  dirty: boolean;
  onPrevious: () => void;
  onSave: () => void;
}

export function CompanyProfileSaveBar({ isFirstTab, isLastTab, saving, dirty, onPrevious, onSave }: CompanyProfileSaveBarProps) {
  const disabled = saving || (isLastTab && !dirty);

  return (
    <div className="cset-save-row mt-8">
      {!isFirstTab && (
        <button type="button" className="cset-btn-secondary !px-6 !py-2.5 !text-sm !text-[#111827]" onClick={onPrevious}>
          Previous
        </button>
      )}
      <button
        type="button"
        className={`cset-btn-primary !px-6 !py-2.5 !text-sm transition-all duration-200 ${
          isLastTab && !dirty
            ? '!cursor-not-allowed !bg-[#0a65cc]/50 !text-white/70 !shadow-none'
            : '!cursor-pointer !bg-[#0a65cc] shadow-sm hover:!bg-[#084f9e]'
        }`}
        disabled={disabled}
        onClick={onSave}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving…
          </>
        ) : (
          <>
            {isLastTab ? 'Save Changes' : 'Save & Next'} <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}
