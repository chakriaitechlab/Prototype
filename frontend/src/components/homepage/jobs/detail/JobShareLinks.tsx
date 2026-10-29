'use client';

import { useState } from 'react';
import { Link2, Mail } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import { SocialIcon } from '@/components/ui/SocialIcon';

interface JobShareLinksProps {
  url: string;
  title: string;
}

type Notice = { message: string; type: 'success' | 'error'; trigger: number };

export function JobShareLinks({ url, title }: JobShareLinksProps) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const encodedUrl = encodeURIComponent(url);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(
      () => setNotice({ message: 'Link copied', type: 'success', trigger: Date.now() }),
      () => setNotice({ message: 'Could not copy link', type: 'error', trigger: Date.now() }),
    );
  };

  return (
    <div className="jp-jd-share">
      <button type="button" className="jp-jd-social" onClick={copyLink} aria-label="Copy link">
        <Link2 size={17} aria-hidden />
      </button>
      <a
        className="jp-jd-social"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on LinkedIn"
      >
        <SocialIcon platform="linkedin" />
      </a>
      <a
        className="jp-jd-social"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Facebook"
      >
        <SocialIcon platform="facebook" />
      </a>
      <a
        className="jp-jd-social"
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X"
      >
        <SocialIcon platform="x" />
      </a>
      <a
        className="jp-jd-social"
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodedUrl}`}
        aria-label="Share by email"
      >
        <Mail size={17} aria-hidden />
      </a>

      <FormAlert message={notice?.message} type={notice?.type} trigger={notice?.trigger} />
    </div>
  );
}
