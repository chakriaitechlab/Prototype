'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getAgentSocketTokenAction, sendAgentMessageAction, startAgentAction, stopAgentAction } from '@/actions/agent.actions';
import type { AgentJoinResult, AgentScreenshot, AgentSessionDetail, AgentSessionStatus, AgentStep } from '@/types/agent';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const ACK_TIMEOUT_MS = 10_000;
const SESSION_QUERY = 'session';

function mergeSteps(current: AgentStep[], incoming: AgentStep[]) {
  const byIndex = new Map(current.map((step) => [step.index, step]));
  incoming.forEach((step) => byIndex.set(step.index, step));
  return [...byIndex.values()].sort((a, b) => a.index - b.index);
}

export type FrameListener = (frame: AgentScreenshot | null) => void;

function syncUrl(sessionId: string | null) {
  const url = new URL(window.location.href);
  if (sessionId) url.searchParams.set(SESSION_QUERY, sessionId);
  else url.searchParams.delete(SESSION_QUERY);
  window.history.replaceState(window.history.state, '', url);
}

export function useAgentSession(initialSession: AgentSessionDetail | null, watchingBrowser: boolean) {
  const [session, setSession] = useState<AgentSessionDetail | null>(initialSession);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const frameRef = useRef<AgentScreenshot | null>(null);
  const frameListenersRef = useRef(new Set<FrameListener>());
  const sessionId = session?.id ?? null;
  const browsing =
    (session?.status === 'RUNNING' || session?.status === 'WAITING_INPUT') && Boolean(session.steps.some(({ kind }) => kind === 'NAVIGATE'));
  const watching = watchingBrowser || browsing;

  const publishFrame = useCallback((frame: AgentScreenshot | null) => {
    frameRef.current = frame;
    frameListenersRef.current.forEach((listener) => listener(frame));
  }, []);

  useEffect(() => {
    const socket = io(`${API_URL}/agent`, {
      transports: ['websocket'],
      auth: (send) => {
        getAgentSocketTokenAction()
          .then((result) => send({ token: result.data?.token ?? '' }))
          .catch(() => send({ token: '' }));
      },
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('agent:step', (step: AgentStep) => {
      if (step.kind === 'ASSISTANT') setDraft('');
      setSession((current) => current && { ...current, steps: mergeSteps(current.steps, [step]) });
    });
    socket.on('agent:draft', ({ content }: { content: string }) => setDraft(content));
    socket.on('agent:frame', publishFrame);
    socket.on('agent:status', ({ status }: { status: AgentSessionStatus }) => {
      setSession((current) => current && { ...current, status });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [publishFrame]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!connected || !socket || !sessionId) return;

    socket
      .timeout(ACK_TIMEOUT_MS)
      .emitWithAck('session:join', { sessionId })
      .then((result: AgentJoinResult & { error?: string }) => {
        if (result.error) return;
        setSession((current) =>
          current?.id === sessionId ? { ...result.session, steps: mergeSteps(current.steps, result.session.steps) } : current,
        );
        if (result.screenshot) publishFrame(result.screenshot);
      })
      .catch(() => {});

    return () => {
      socket.emit('session:leave', { sessionId });
    };
  }, [connected, sessionId, publishFrame]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!connected || !socket || !sessionId || !watching) return;

    socket.emit('browser:watch', { sessionId, watching: true });
    return () => {
      socket.emit('browser:watch', { sessionId, watching: false });
    };
  }, [connected, sessionId, watching]);

  const send = useCallback(
    async (message: string) => {
      if (!session) {
        const { data, error: startError } = await startAgentAction(message);
        if (!data) {
          setError({ message: startError });
          return false;
        }
        publishFrame(null);
        setSession(data);
        syncUrl(data.id);
        return true;
      }

      const result = await sendAgentMessageAction(session.id, message);
      if (result.error) {
        setError({ message: result.error });
        return false;
      }
      setSession((current) => (current && current.status !== 'WAITING_INPUT' ? { ...current, status: 'RUNNING' } : current));
      return true;
    },
    [session, publishFrame],
  );

  const stop = useCallback(async () => {
    if (!session) return;
    const { data, error: stopError } = await stopAgentAction(session.id);
    if (!data) setError({ message: stopError });
    else setSession((current) => current && { ...data, steps: mergeSteps(current.steps, data.steps) });
  }, [session]);

  const reset = useCallback(() => {
    setSession(null);
    publishFrame(null);
    setDraft('');
    syncUrl(null);
  }, [publishFrame]);

  const subscribeFrames = useCallback((listener: FrameListener) => {
    const listeners = frameListenersRef.current;
    listeners.add(listener);
    listener(frameRef.current);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { session, draft, connected, error, send, stop, reset, subscribeFrames };
}
