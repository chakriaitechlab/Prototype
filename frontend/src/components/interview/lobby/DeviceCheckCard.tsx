'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, Loader2, Mic, Power, Video, VideoOff, XCircle } from 'lucide-react';

const LEVEL_BARS = 5;
const LEVEL_SCALE = 12;

const noopSubscribe = () => () => {};

type DeviceState = 'off' | 'requesting' | 'on' | 'denied';

export function DeviceCheckCard({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef(0);
  const [state, setState] = useState<DeviceState>('off');
  const [level, setLevel] = useState(0);
  const fullscreen = useSyncExternalStore(noopSubscribe, () => Boolean(document.documentElement.requestFullscreen), () => true);

  const release = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLevel(0);
  }, []);

  const turnOn = async () => {
    setState('requesting');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (videoRef.current) videoRef.current.srcObject = media;

      const context = new AudioContext();
      contextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(media).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        setLevel(Math.min(LEVEL_BARS, Math.round(average / LEVEL_SCALE)));
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
      setState('on');
      onReadyChange(true);
    } catch {
      release();
      setState('denied');
      onReadyChange(false);
    }
  };

  const turnOff = () => {
    release();
    setState('off');
    onReadyChange(false);
  };

  useEffect(() => release, [release]);

  const on = state === 'on';
  const checks: [string, boolean][] = [
    ['Camera', on],
    ['Microphone', on],
    ['Fullscreen', fullscreen],
  ];

  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <Video size={18} className="text-[#0a65cc]" aria-hidden />
        Device check
      </h2>
      <div className="px-5 pb-4 pt-3.5">
        <div className="relative aspect-video overflow-hidden bg-[#1e293b]">
          <video ref={videoRef} className={`h-full w-full -scale-x-100 object-cover ${on ? '' : 'hidden'}`} muted playsInline autoPlay />
          {!on && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <VideoOff size={28} aria-hidden />
              <span className="text-[13px]">Camera off</span>
            </div>
          )}
          {on && (
            <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-slate-900/70 px-2.5 py-1 text-[12px] font-semibold text-slate-100">
              <Mic size={13} aria-hidden />
              You
              <span className="flex h-3 items-end gap-0.5" aria-hidden>
                {Array.from({ length: LEVEL_BARS }, (_, i) => (
                  <i key={i} className={`block w-[3px] ${i < level ? 'bg-[#4ade80]' : 'bg-slate-500'}`} style={{ height: `${4 + i * 2}px` }} />
                ))}
              </span>
            </span>
          )}
        </div>

        {checks.map(([label, ok]) => (
          <div key={label} className="flex items-center justify-between border-b border-[#f1f2f4] py-2.5 text-[13.5px] last:border-b-0">
            <span>{label}</span>
            {ok ? (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#28a745]">
                <CheckCircle2 size={15} aria-hidden />
                {label === 'Fullscreen' ? 'Supported' : 'Working'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#767f8c]">
                <XCircle size={15} aria-hidden />
                {label === 'Fullscreen' ? 'Not supported' : 'Off'}
              </span>
            )}
          </div>
        ))}

        {state === 'denied' && (
          <p className="mt-2 border border-[#f3c4c4] bg-[#fdf2f2] px-3 py-2 text-[12.5px] leading-snug text-[#c53030]">
            Camera or microphone access was blocked. Allow both in your browser&apos;s site settings, then try again.
          </p>
        )}

        {on ? (
          <button type="button" onClick={turnOff} className="jp-btn jp-btn--outline mt-3 h-11! w-full text-sm!">
            <Power size={16} aria-hidden />
            Turn off camera and microphone
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void turnOn()}
            disabled={state === 'requesting'}
            className="jp-btn jp-btn--soft mt-3 h-11! w-full text-sm! disabled:cursor-not-allowed disabled:opacity-70"
          >
            {state === 'requesting' ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Video size={16} aria-hidden />}
            {state === 'requesting' ? 'Waiting for permission…' : state === 'denied' ? 'Try again' : 'Turn on camera and microphone'}
          </button>
        )}
      </div>
    </section>
  );
}
