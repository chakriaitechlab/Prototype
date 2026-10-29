'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import { Mic } from 'lucide-react';

interface SelfViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  initials: string;
  onCameraChange: (on: boolean) => void;
}

export function SelfView({ videoRef, initials, onCameraChange }: SelfViewProps) {
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        if (videoRef.current) videoRef.current.srcObject = media;
        onCameraChange(true);
      })
      .catch(() => onCameraChange(false));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onCameraChange, videoRef]);

  return (
    <div className="absolute right-4 top-[76px] z-[3] aspect-[4/3] w-[130px] overflow-hidden border-2 border-white/25 bg-[#1e293b] sm:right-6 sm:w-[220px]">
      <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-slate-300">{initials}</span>
      <video ref={videoRef} className="relative h-full w-full -scale-x-100 object-cover" muted playsInline autoPlay />
      <span className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-slate-900/70 px-2 py-0.5 text-[11.5px] font-semibold text-slate-100">
        <Mic size={12} aria-hidden />
        You
      </span>
    </div>
  );
}
