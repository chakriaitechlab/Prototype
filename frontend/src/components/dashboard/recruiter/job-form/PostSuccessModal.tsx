'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { RECRUITER_MY_POSTS_PATH } from '@/utils/routes';

interface PostSuccessModalProps {
  title: string;
  onClose: () => void;
}

export function PostSuccessModal({ title, onClose }: PostSuccessModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="cpost-modal-scrim" role="presentation" onClick={onClose}>
      <div
        className="cpost-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cpost-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="cpost-modal-close" aria-label="Close" onClick={onClose}>
          <X size={14} strokeWidth={2.5} />
        </button>

        <div className="cpost-modal-head">
          <h2 id="cpost-success-title">
            <span aria-hidden>🎉</span> Congratulation, Your Job is successfully posted!
          </h2>
          <p>
            <strong>{title}</strong> is now live. You can manage your post from the My Posts section in your dashboard.
          </p>
          <Link href={RECRUITER_MY_POSTS_PATH} className="cpost-view-jobs">
            View My Posts <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
