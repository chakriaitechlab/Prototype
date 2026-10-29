'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Mail, Search } from 'lucide-react';
import type { FrameListener } from '@/hooks/useAgentSession';
import type { AgentStep, AgentStepKind } from '@/types/agent';

const BROWSER_KINDS: AgentStepKind[] = ['NAVIGATE', 'CLICK', 'TYPE', 'SCROLL', 'BACK'];

interface AgentToolCardProps {
  steps: AgentStep[];
  active: boolean;
  showPreview: boolean;
  subscribeFrames: (listener: FrameListener) => () => void;
  onOpenBrowser: () => void;
}

export function AgentToolCard({ steps, active, showPreview, subscribeFrames, onOpenBrowser }: AgentToolCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [hasFrame, setHasFrame] = useState(false);

  const browser = steps.some(({ kind }) => BROWSER_KINDS.includes(kind));
  const gmail = !browser && steps.some(({ kind }) => kind === 'GMAIL');
  const latest = steps.at(-1);
  const failed = latest?.kind === 'ERROR';
  const Icon = browser ? Globe : gmail ? Mail : Search;
  const preview = browser && showPreview;

  useEffect(() => {
    if (!preview) return;
    let pending: string | null = null;
    let raf = 0;

    const unsubscribe = subscribeFrames((frame) => {
      setHasFrame(Boolean(frame));
      if (!frame) return;
      pending = frame.image;
      raf ||= requestAnimationFrame(() => {
        raf = 0;
        if (imageRef.current && pending) imageRef.current.src = pending;
      });
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [preview, subscribeFrames]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#e4e5e8] bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#e7f0fa] text-[#0a65cc]' : failed ? 'bg-[#fdecec] text-[#e05151]' : 'bg-[#e7f6ea] text-[#0ba02c]'}`}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#18191c]">{browser ? 'Browser' : gmail ? 'Gmail' : 'Web search'}</p>
          <p className="truncate text-[13px] text-[#5e6670]">
            {active ? 'Working' : failed ? 'Stopped' : `Completed${latest ? ` · ${latest.note}` : ''}`}
          </p>
        </div>
      </div>

      {preview && (
        <div className={`relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-lg border border-[#e4e5e8] bg-[#f7f8f9] ${hasFrame ? '' : 'hidden'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            alt="Live preview of the agent's browser"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top select-none"
          />
        </div>
      )}

      {browser && (
        <button
          type="button"
          onClick={onOpenBrowser}
          className="cursor-pointer disabled:cursor-not-allowed mt-3 h-10 w-full rounded-full bg-[#f1f2f4] text-[14px] font-medium text-[#18191c] transition-colors hover:bg-[#e4e5e8]"
        >
          Open browser
        </button>
      )}
    </div>
  );
}
