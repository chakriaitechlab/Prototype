'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

const COPIED_MS = 1800;

interface CodeBlockProps {
  language: string | null;
  code: string;
  children: React.ReactNode;
}

export function CodeBlock({ language, code, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => setCopied(true));
  };

  return (
    <div className="learning-codeblock" data-lang={language ?? 'text'}>
      <div className="learning-codeblock__bar">
        <span className="learning-codeblock__lang mono">{language ?? 'text'}</span>
        <button type="button" onClick={copy} className="learning-codeblock__copy" aria-label={copied ? 'Copied' : 'Copy code'}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="learning-codeblock__pre">{children}</pre>
    </div>
  );
}
