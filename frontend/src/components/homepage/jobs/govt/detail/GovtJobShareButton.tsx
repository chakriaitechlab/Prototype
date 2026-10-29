'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';

export function GovtJobShareButton({ title, url }: { title: string; url: string }) {
  const [notice, setNotice] = useState<{ message: string; type: 'error' | 'success' }>();

  const copyLink = () =>
    navigator.clipboard.writeText(url).then(
      () => setNotice({ message: 'লিংক কপি করা হয়েছে', type: 'success' }),
      () => setNotice({ message: 'লিংক কপি সম্ভব হয়নি', type: 'error' }),
    );

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }
    await copyLink();
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        title="শেয়ার করুন"
        aria-label="শেয়ার করুন"
        className="grid size-10 cursor-pointer place-items-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b]"
      >
        <Share2 size={19} />
      </button>
      <FormAlert message={notice?.message} type={notice?.type} trigger={notice} />
    </>
  );
}
