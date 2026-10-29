'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { InterviewLanguage, SpeechKind } from '@/types/interviews';

const DEFAULT_SAMPLE_RATE = 24000;
const START_DELAY_SECONDS = 0.05;

function decodePcm(base64: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const samples = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
  return Float32Array.from(samples, (sample) => sample / 0x8000);
}

export function useInterviewSpeech(interviewId: string) {
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The question stays on screen until the answer is submitted; other lines show only while spoken.
  const questionRef = useRef<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stop = useCallback(() => {
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        void 0;
      }
    });
    sourcesRef.current = [];
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    async (kind: SpeechKind, language?: InterviewLanguage): Promise<boolean> => {
      stop();
      const controller = new AbortController();
      abortRef.current = controller;

      const context = contextRef.current ?? new AudioContext();
      contextRef.current = context;
      if (context.state === 'suspended') await context.resume();

      let sampleRate = DEFAULT_SAMPLE_RATE;
      let playAt = 0;
      let lastEnded: Promise<void> = Promise.resolve();
      let text = '';
      let captionShown = false;

      const play = (pcm: string) => {
        const samples = decodePcm(pcm);
        if (!samples.length) return;
        const buffer = context.createBuffer(1, samples.length, sampleRate);
        buffer.copyToChannel(samples, 0);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        playAt = Math.max(playAt, context.currentTime + START_DELAY_SECONDS);
        source.start(playAt);
        if (!captionShown) {
          captionShown = true;
          const delayMs = Math.max(0, (playAt - context.currentTime) * 1000);
          captionTimerRef.current = setTimeout(() => {
            setCaption(text);
            setSpeaking(true);
          }, delayMs);
        }
        playAt += buffer.duration;
        sourcesRef.current.push(source);
        lastEnded = new Promise((resolve) => {
          source.onended = () => resolve();
        });
      };

      try {
        const response = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}/speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, language }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return false;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let pending = '';
        let ok = true;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          pending += decoder.decode(value, { stream: true });
          const lines = pending.split('\n');
          pending = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as { event: string; text?: string; sampleRate?: number; pcm?: string; ok?: boolean };
            if (event.event === 'text' && event.text) text = event.text;
            if (event.event === 'start' && event.sampleRate) sampleRate = event.sampleRate;
            if (event.event === 'chunk' && event.pcm) play(event.pcm);
            if (event.event === 'end') ok = event.ok !== false;
          }
        }

        if (!captionShown && text) setCaption(text);
        if (kind === 'question') questionRef.current = text || null;
        await lastEnded;
        return ok;
      } catch {
        return false;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          sourcesRef.current = [];
          setSpeaking(false);
          setCaption(questionRef.current);
        }
      }
    },
    [interviewId, stop],
  );

  const clearCaption = useCallback(() => {
    questionRef.current = null;
    setCaption(null);
  }, []);

  useEffect(
    () => () => {
      stop();
      void contextRef.current?.close();
      contextRef.current = null;
    },
    [stop],
  );

  return { speak, stop, clearCaption, speaking, caption };
}
