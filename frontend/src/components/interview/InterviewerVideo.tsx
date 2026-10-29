'use client';

import { useEffect, useRef, useState } from 'react';
import { INTERVIEWER } from '@/utils/interviews';

function restart(video: HTMLVideoElement | null) {
  if (!video) return;
  try {
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  } catch {
    void 0;
  }
}

export function InterviewerVideo({ speaking, className = '' }: { speaking: boolean; className?: string }) {
  const silentRef = useRef<HTMLVideoElement>(null);
  const speakingRef = useRef<HTMLVideoElement>(null);
  const [silentReady, setSilentReady] = useState(false);
  const [speakingReady, setSpeakingReady] = useState(false);

  useEffect(() => {
    restart(speaking ? speakingRef.current : silentRef.current);
  }, [speaking]);

  return (
    <div className={`overflow-hidden bg-black ${className}`} role="img" aria-label={`${INTERVIEWER.name}, ${INTERVIEWER.role}`}>
      <video
        ref={silentRef}
        src={INTERVIEWER.silentVideo}
        className={`absolute inset-0 h-full w-full object-cover ${speaking || !silentReady ? 'opacity-0' : 'opacity-100'}`}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onLoadedData={(event) => {
          setSilentReady(true);
          if (!speaking) restart(event.currentTarget);
        }}
        onPlaying={() => setSilentReady(true)}
      />
      <video
        ref={speakingRef}
        src={INTERVIEWER.speakingVideo}
        className={`absolute inset-0 h-full w-full object-cover ${speaking && speakingReady ? 'opacity-100' : 'opacity-0'}`}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onLoadedData={(event) => {
          setSpeakingReady(true);
          if (speaking) restart(event.currentTarget);
        }}
        onPlaying={() => setSpeakingReady(true)}
      />
    </div>
  );
}
