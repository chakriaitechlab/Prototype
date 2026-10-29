'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Globe, Lock, X } from 'lucide-react';
import type { FrameListener } from '@/hooks/useAgentSession';

interface LiveBrowserPanelProps {
  subscribeFrames: (listener: FrameListener) => () => void;
  live: boolean;
  onClose: () => void;
}

export function LiveBrowserPanel({ subscribeFrames, live, onClose }: LiveBrowserPanelProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let pending: string | null = null;
    let raf = 0;

    const unsubscribe = subscribeFrames((frame) => {
      setUrl(frame?.url ?? null);
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
  }, [subscribeFrames]);

  return (
    <aside className="fixed inset-0 z-50 flex flex-col bg-[#f7f8f9] lg:static lg:z-auto lg:w-[48%] lg:max-w-[760px] lg:border-l lg:border-[#e4e5e8]">
      <div className="flex items-center gap-2 border-b border-[#e4e5e8] bg-white px-3 py-2.5">
        <div className="flex shrink-0 gap-1.5 pr-1" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-[#f1f2f4] px-2.5 py-1.5 text-xs text-[#5e6670]">
          {url?.startsWith('https:') ? <Lock size={12} className="shrink-0" /> : <Globe size={12} className="shrink-0" />}
          <span className="truncate">{url ?? 'about:blank'}</span>
        </div>
        {live && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#fdecec] px-2 py-1 text-[11px] font-semibold text-[#e05151]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e05151]" />
            LIVE
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close live browser"
          className="cursor-pointer disabled:cursor-not-allowed flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#5e6670] hover:bg-[#f1f2f4]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-4">
        <div className={`relative aspect-[16/10] max-h-full w-full ${url ? '' : 'hidden'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            alt="Live view of the agent's browser"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full rounded-md border border-[#e4e5e8] bg-white object-contain shadow-sm select-none"
          />
        </div>
        {!url && (
          <div className="max-w-xs text-center text-sm text-[#767f8c]">
            <Globe size={28} className="mx-auto mb-3 text-[#9199a3]" />
            The browser opens when the agent visits a website. You will watch it move, click and type here live.
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-[#e4e5e8] bg-white py-2 text-xs text-[#767f8c]">
        <Eye size={13} />
        View only. The agent is in control of this browser.
      </div>
    </aside>
  );
}
