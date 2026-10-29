'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getSocketTokenAction } from '@/actions/messages.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const RELEASE_DELAY_MS = 1_500;
const RECONNECT_DELAY_MS = 3_000;
const ACK_TIMEOUT_MS = 10_000;

let socket: Socket | null = null;
let holders = 0;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

function createSocket() {
  const instance = io(`${API_URL}/messages`, {
    transports: ['websocket'],
    autoConnect: false,
    reconnectionDelayMax: 10_000,
    auth: (send) => {
      getSocketTokenAction()
        .then((result) => send({ token: result.data?.token ?? '' }))
        .catch(() => send({ token: '' }));
    },
  });

  const retry = () => {
    setTimeout(() => {
      if (socket === instance && holders > 0 && !instance.active) instance.connect();
    }, RECONNECT_DELAY_MS);
  };

  instance.on('connect', notify);
  instance.on('connect_error', retry);
  instance.on('disconnect', (reason) => {
    notify();
    if (reason === 'io server disconnect') retry();
  });

  instance.connect();
  return instance;
}

function acquire() {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  holders += 1;
  socket ??= createSocket();
  notify();
}

function release() {
  holders -= 1;
  if (holders > 0) return;

  releaseTimer = setTimeout(() => {
    socket?.disconnect();
    socket = null;
    notify();
  }, RELEASE_DELAY_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const connectedSnapshot = () => Boolean(socket?.connected);
const serverSnapshot = () => false;

export function useMessengerSocket() {
  useEffect(() => {
    acquire();
    return release;
  }, []);

  return useSyncExternalStore(subscribe, connectedSnapshot, serverSnapshot);
}

export function useSocketEvent<T>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const connected = useMessengerSocket();

  useEffect(() => {
    const current = socket;
    if (!current) return;

    const listener = (payload: T) => handlerRef.current(payload);
    current.on(event, listener);
    return () => {
      current.off(event, listener);
    };
  }, [event, connected]);

  return connected;
}

export async function emitWithAck<T>(event: string, payload: unknown): Promise<T> {
  if (!socket?.connected) throw new Error('offline');
  const response = (await socket.timeout(ACK_TIMEOUT_MS).emitWithAck(event, payload)) as T & { error?: string };
  if (response?.error) throw new Error(response.error);
  return response;
}

export function emitEvent(event: string, payload: unknown) {
  if (socket?.connected) socket.emit(event, payload);
}
