'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getInterviewSocketTokenAction } from '@/actions/interviews.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const WORKLET_URL = '/interview/stt-pcm-worklet.js';
const WORKLET_NAME = 'chakri-stt-pcm-processor';
const CAPTURE_SAMPLE_RATE = 16000;
const ACK_TIMEOUT_MS = 10_000;
const STOP_TIMEOUT_MS = 4_000;
const VOICE_RMS_THRESHOLD = 0.015;
const CONNECT_TIMEOUT_MS = 8_000;

interface TranscriberOptions {
  interviewId: string;
  onSpeech: () => void;
}

function toPcm16(samples: Float32Array) {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return pcm.buffer;
}

function connectSocket() {
  return new Promise<Socket>((resolve, reject) => {
    const socket = io(`${API_URL}/interviews`, {
      transports: ['websocket'],
      reconnection: false,
      timeout: CONNECT_TIMEOUT_MS,
      auth: (send) => {
        getInterviewSocketTokenAction()
          .then((result) => send({ token: 'data' in result ? result.data.token : '' }))
          .catch(() => send({ token: '' }));
      },
    });
    socket.once('connect', () => resolve(socket));
    socket.once('connect_error', (error) => {
      socket.close();
      reject(error);
    });
  });
}

export function useInterviewTranscriber({ interviewId, onSpeech }: TranscriberOptions) {
  const [transcript, setTranscript] = useState({ final: '', interim: '' });
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const onSpeechRef = useRef(onSpeech);

  useEffect(() => {
    onSpeechRef.current = onSpeech;
  }, [onSpeech]);

  const releaseAudio = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
  }, []);

  const ensureSocket = useCallback(async () => {
    if (socketRef.current?.connected) return socketRef.current;
    socketRef.current?.close();
    const socket = await connectSocket();
    socket.on('stt:interim', ({ text }: { text: string }) => {
      interimRef.current = text;
      setTranscript({ final: finalRef.current, interim: text });
      if (text.trim()) onSpeechRef.current();
    });
    socket.on('stt:error', ({ message }: { message: string }) => console.warn(`Live transcription error: ${message}`));
    socket.on('stt:final', ({ text }: { text: string }) => {
      finalRef.current = `${finalRef.current} ${text}`.trim();
      interimRef.current = '';
      setTranscript({ final: finalRef.current, interim: '' });
      if (text.trim()) onSpeechRef.current();
    });
    socketRef.current = socket;
    return socket;
  }, []);

  const start = useCallback(async () => {
    finalRef.current = '';
    interimRef.current = '';
    setTranscript({ final: '', interim: '' });
    releaseAudio();

    const socket = await ensureSocket();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: CAPTURE_SAMPLE_RATE, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;

    const context = new AudioContext({ sampleRate: CAPTURE_SAMPLE_RATE });
    contextRef.current = context;
    if (context.state === 'suspended') await context.resume();
    await context.audioWorklet.addModule(WORKLET_URL);

    // Audio streams right away; the backend buffers it until the provider connects.
    const ack = socket.timeout(ACK_TIMEOUT_MS).emitWithAck('stt:start', { interviewId, sampleRate: context.sampleRate }) as Promise<{ error?: string }>;
    const worklet = new AudioWorkletNode(context, WORKLET_NAME, { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
    worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      const samples = new Float32Array(event.data);
      socket.emit('stt:audio', toPcm16(samples));
      if (!finalRef.current && !interimRef.current) return;
      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      if (Math.sqrt(sum / samples.length) > VOICE_RMS_THRESHOLD) onSpeechRef.current();
    };
    context.createMediaStreamSource(stream).connect(worklet);
    worklet.connect(context.destination);

    const { error } = (await ack) ?? {};
    if (error) throw new Error(error);
  }, [ensureSocket, interviewId, releaseAudio]);

  const stop = useCallback(async () => {
    releaseAudio();
    await socketRef.current?.timeout(STOP_TIMEOUT_MS).emitWithAck('stt:stop').catch(() => undefined);
    return (finalRef.current || interimRef.current).trim();
  }, [releaseAudio]);

  const reset = useCallback(() => {
    finalRef.current = '';
    interimRef.current = '';
    setTranscript({ final: '', interim: '' });
  }, []);

  useEffect(
    () => () => {
      releaseAudio();
      socketRef.current?.close();
      socketRef.current = null;
    },
    [releaseAudio],
  );

  return { start, stop, reset, transcript };
}
