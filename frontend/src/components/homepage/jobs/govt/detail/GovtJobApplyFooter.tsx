'use client';

import { useState } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';

const APPLY_BUTTON =
  'inline-flex items-center gap-2.5 rounded-[10px] border-0 bg-[#6366f1] px-8 py-3.5 text-base font-bold !text-white no-underline shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all duration-200 hover:bg-[#4f46e5]';

type GovtJobApplyFooterProps = {
  applicationSite: string | null;
  isExpired: boolean;
  publishedText: string | null;
};

export function GovtJobApplyFooter({ applicationSite, isExpired, publishedText }: GovtJobApplyFooterProps) {
  const [missingLink, setMissingLink] = useState<object>();

  return (
    <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-[#e2e8f0] pt-6">
      <div className="flex flex-col gap-1.5">
        {publishedText && (
          <div className="flex items-center gap-1.5 text-[0.85rem] text-[#64748b]">
            <Clock size={15} />
            <span>{publishedText} প্রকাশিত</span>
          </div>
        )}
        <div className="text-[0.8rem] text-[#94a3b8]">
          হিসাব চুক্তি: চাকরিটি সম্পূর্ণ অফিসিয়াল তথ্যের ভিত্তিতে প্রদর্শিত হচ্ছে। কোনো ফি সরাসরি চাকুরি এআই গ্রহণ করে না।
        </div>
      </div>

      {isExpired ? (
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-[10px] border-0 bg-[#e2e8f0] px-7 py-3.5 text-[0.95rem] font-semibold text-[#94a3b8]"
        >
          আবেদনের সময় শেষ
        </button>
      ) : applicationSite ? (
        <a href={applicationSite} target="_blank" rel="noopener noreferrer" className={APPLY_BUTTON}>
          আবেদন করুন <ExternalLink size={18} />
        </a>
      ) : (
        <button type="button" onClick={() => setMissingLink({})} className={`${APPLY_BUTTON} cursor-pointer`}>
          আবেদন করুন <ExternalLink size={18} />
        </button>
      )}

      <FormAlert
        message={missingLink ? 'এই চাকরির জন্য নির্দিষ্ট আবেদন লিংক পাওয়া যায়নি' : undefined}
        trigger={missingLink}
      />
    </div>
  );
}
