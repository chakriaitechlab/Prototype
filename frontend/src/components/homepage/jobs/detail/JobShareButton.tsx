'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';

type Notice = { message: string; type: 'success' | 'error'; trigger: number };

export function JobShareButton({ url, title }: { url: string; title: string }) {
  const [notice, setNotice] = useState<Notice | null>(null);

  const share = () => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url).then(
      () => setNotice({ message: 'Link copied', type: 'success', trigger: Date.now() }),
      () => setNotice({ message: 'Could not copy link', type: 'error', trigger: Date.now() }),
    );
  };

  return (
    <>
      <button type="button" className="jp-jd-icon-btn" onClick={share} aria-label="Share job">
        <Share2 size={20} aria-hidden />
      </button>
      <FormAlert message={notice?.message} type={notice?.type} trigger={notice?.trigger} />
    </>
  );
}
