import 'server-only';
import { cookies, headers } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, DEVICE_ID_COOKIE } from '@/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const API_TIMEOUT_MS = 20_000;
const UPLOAD_TIMEOUT_MS = 120_000;
const GATEWAY_STATUSES = [502, 503, 504, 520, 521, 522, 523, 524, 530];
const UNREACHABLE_MESSAGE = 'Could not reach the server. Please try again.';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string>;
}

interface StreamOptions {
  method: 'POST' | 'PATCH';
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, { method = 'GET', body, query }: ApiOptions = {}): Promise<T> {
  const isForm = body instanceof FormData;
  const url = new URL(path, API_URL);
  if (query) url.search = new URLSearchParams(query).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: await authHeaders(body !== undefined && !isForm),
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(isForm ? UPLOAD_TIMEOUT_MS : API_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 503);
  }

  return parseResponse<T>(response);
}

export async function apiStream(path: string, { method, body, signal }: StreamOptions): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(new URL(path, API_URL), {
      method,
      headers: await authHeaders(body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal,
    });
  } catch {
    return Response.json({ message: UNREACHABLE_MESSAGE }, { status: 503 });
  }

  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store, no-transform',
    },
  });
}

async function authHeaders(json: boolean) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;

  const requestHeaders = new Headers({ Accept: 'application/json' });
  if (json) requestHeaders.set('Content-Type', 'application/json');
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
  if (deviceId) requestHeaders.set('X-Device-Id', deviceId);

  const clientIp = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerStore.get('x-real-ip');
  const userAgent = headerStore.get('user-agent');
  if (clientIp) requestHeaders.set('X-Forwarded-For', clientIp);
  if (userAgent) requestHeaders.set('User-Agent', userAgent);

  return requestHeaders;
}

export async function publicFetch<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL(path, API_URL), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, 503);
  }

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
    code?: string;
  };

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    const fallback = GATEWAY_STATUSES.includes(response.status)
      ? UNREACHABLE_MESSAGE
      : 'Something went wrong. Please try again.';
    throw new ApiError(message || fallback, response.status, data.code);
  }

  return data as T;
}

/** Drops empty filters and stringifies the rest for `apiFetch`'s `query`. */
export function toQuery(params: object): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query[key] = String(value);
  }
  return query;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  return err instanceof ApiError ? err.message : fallback;
}
