'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Pencil, RotateCcw } from 'lucide-react';

const COPIED_MS = 2000;

interface MessageActionsProps {
  content: string;
  visible: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
}

export function MessageActions({ content, visible, onEdit, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard.writeText(content).then(() => setCopied(true));
  };

  return (
    <div className={`learning-msg__footer${visible ? ' is-visible' : ''}`}>
      <div className="learning-msg__actions">
        <button
          type="button"
          className={`learning-msg__action${copied ? ' is-copied' : ''}`}
          aria-label={copied ? 'Copied to clipboard' : 'Copy'}
          title={copied ? 'Copied to clipboard' : 'Copy'}
          onClick={copy}
        >
          {copied ? <Check size={15} strokeWidth={2} className="text-emerald-600" /> : <Copy size={15} strokeWidth={1.75} />}
        </button>
        {onEdit && (
          <button type="button" className="learning-msg__action" aria-label="Edit message" title="Edit message" onClick={onEdit}>
            <Pencil size={15} strokeWidth={1.75} />
          </button>
        )}
        {onRegenerate && (
          <button type="button" className="learning-msg__action" aria-label="Regenerate response" title="Regenerate response" onClick={onRegenerate}>
            <RotateCcw size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}
