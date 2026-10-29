'use client';

import { useEffect, useRef, useState } from 'react';
import type { DragEvent, MouseEvent, TouchEvent } from 'react';
import { Camera, Check, Loader2, Move, X } from 'lucide-react';
import { BANNER_ACCEPT } from '@/utils/company-profile';

const FALLBACK_HEIGHT = 260;

interface CompanyCoverProps {
  bannerUrl: string | null;
  position: number;
  uploading: boolean;
  onPositionChange: (position: number) => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onRepositioned: () => void;
}

export function CompanyCover({
  bannerUrl,
  position,
  uploading,
  onPositionChange,
  onUpload,
  onRemove,
  onRepositioned,
}: CompanyCoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ y: 0, position });
  const [repositioning, setRepositioning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState(position);
  const hasBanner = Boolean(bannerUrl);

  useEffect(() => {
    if (!dragging) return;

    const move = (clientY: number) => {
      const height = containerRef.current?.clientHeight || FALLBACK_HEIGHT;
      const delta = ((clientY - dragStart.current.y) / height) * 100;
      onPositionChange(Math.round(Math.min(100, Math.max(0, dragStart.current.position - delta))));
    };
    const onMouseMove = (e: globalThis.MouseEvent) => move(e.clientY);
    const onTouchMove = (e: globalThis.TouchEvent) => {
      if (e.touches.length) move(e.touches[0].clientY);
    };
    const stop = () => setDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, onPositionChange]);

  const beginDrag = (clientY: number) => {
    dragStart.current = { y: clientY, position };
    setDragging(true);
  };

  const startReposition = () => {
    setInitialPosition(position);
    setRepositioning(true);
  };

  const cancelReposition = () => {
    onPositionChange(initialPosition);
    setRepositioning(false);
    setDragging(false);
  };

  const saveReposition = () => {
    setRepositioning(false);
    setDragging(false);
    onRepositioned();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!repositioning && file) onUpload(file);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-48 w-full select-none overflow-hidden bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 transition-colors sm:h-64 md:h-72 ${
        repositioning ? (dragging ? 'cursor-grabbing' : 'cursor-grab ring-2 ring-[#0a65cc]') : 'group cursor-pointer'
      }`}
      onMouseDown={(e: MouseEvent) => {
        if (!repositioning) return;
        e.preventDefault();
        beginDrag(e.clientY);
      }}
      onTouchStart={(e: TouchEvent) => {
        if (repositioning && e.touches.length) beginDrag(e.touches[0].clientY);
      }}
      onClick={() => {
        if (!repositioning && !hasBanner) inputRef.current?.click();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      title={repositioning ? 'Drag up or down to reposition cover' : 'Click to change cover photo or drag and drop image'}
    >
      <input
        ref={inputRef}
        type="file"
        accept={BANNER_ACCEPT}
        className="cset-hidden-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />

      {bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerUrl}
          alt="Company cover banner"
          className="cco-drop-preview cco-drop-preview--cover"
          style={{ objectPosition: `center ${position}%` }}
          draggable={false}
        />
      )}

      {repositioning && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-30 flex -translate-x-1/2 animate-pulse items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
          <Move className="h-3.5 w-3.5" />
          <span>Drag photo up or down to align position</span>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-xs font-semibold text-[#18191c] shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-[#0a65cc]" />
            <span>Uploading cover photo...</span>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-3 right-3 z-10 flex items-center gap-2 sm:bottom-4 sm:right-4"
        onClick={(e) => e.stopPropagation()}
      >
        {repositioning ? (
          <>
            <button
              type="button"
              onClick={cancelReposition}
              className="flex cursor-pointer items-center gap-1 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur transition hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={saveReposition}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0a65cc] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#084f9e]"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Position</span>
            </button>
          </>
        ) : (
          <>
            {hasBanner && (
              <>
                <button
                  type="button"
                  onClick={startReposition}
                  title="Reposition cover photo"
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-black/10 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#18191c] shadow-md backdrop-blur transition hover:bg-white"
                >
                  <Move className="h-3.5 w-3.5 text-[#18191c]" />
                  <span className="hidden sm:inline">Reposition</span>
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  title="Remove cover photo"
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur transition hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-black/10 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#18191c] shadow-md backdrop-blur transition hover:bg-white"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0a65cc]" />
              ) : (
                <Camera className="h-4 w-4 text-[#18191c]" />
              )}
              <span>{hasBanner ? 'Change Photo' : 'Add Cover Photo'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
