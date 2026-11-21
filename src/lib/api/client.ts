/**
 * ZoolGo admin API client (API_CONVENTIONS.md).
 * - Unwraps the success envelope; throws ApiError (with the backend `code`) on failures.
 * - Access token lives in memory only (never localStorage). The refresh token is an HttpOnly
 *   cookie scoped to /api/v1/auth, so a page reload restores the session via POST /auth/refresh.
 * - On 401 the request is retried once after a single shared refresh.
 */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId?: string;

  constructor(init: { status: number; code: string; message: string; details?: unknown; requestId?: string }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.requestId = init.requestId;
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const sessionListeners = new Set<(event: 'refreshed' | 'expired', payload?: unknown) => void>();

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function onSessionChange(listener: (event: 'refreshed' | 'expired', payload?: unknown) => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: { code?: string; message?: string; details?: unknown; requestId?: string } = {};
  try {
    body = await res.json();
  } catch {
    // non-JSON error (proxy/network)
  }
  return new ApiError({
    status: res.status,
    code: body.code ?? (res.status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR'),
    message: body.message ?? res.statusText ?? 'Request failed',
    details: body.details,
    requestId: body.requestId,
  });
}

/** Single shared refresh: concurrent 401s wait for the same attempt. */
export function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), { method: 'POST', credentials: 'include' });
        if (!res.ok) {
          accessToken = null;
          return false;
        }
        const body = (await res.json()) as { data: { accessToken: string; admin?: unknown } };
        accessToken = body.data.accessToken;
        sessionListeners.forEach((l) => l('refreshed', body.data));
        return true;
      } catch {
        return false;
      } finally {
        // Callers already awaiting keep their reference; later 401s must start a fresh attempt.
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
  /** Skip the automatic refresh-and-retry (used by auth endpoints). */
  noRetry?: boolean;
};

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
    signal: opts.signal,
  });
}

async function sendWithRefresh(path: string, opts: RequestOptions): Promise<Response> {
  let res = await send(path, opts);
  if (res.status === 401 && !opts.noRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await send(path, opts);
    } else {
      sessionListeners.forEach((l) => l('expired'));
    }
  }
  return res;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<{ data: T; meta?: PageMeta & Record<string, unknown> }> {
  const res = await sendWithRefresh(path, opts);
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return { data: undefined as T };
  const body = (await res.json()) as { data: T; meta?: PageMeta & Record<string, unknown> };
  return { data: body.data, meta: body.meta };
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => apiRequest<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, opts: Pick<RequestOptions, 'noRetry'> = {}) => apiRequest<T>(path, { method: 'POST', body: body ?? {}, ...opts }),
  patch: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};

/** Authenticated file download (CSV / PDF) without exposing the token in a URL. */
export async function downloadFile(path: string, query: Query | undefined, fallbackName: string): Promise<void> {
  const res = await sendWithRefresh(path, { query });
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = match?.[1] ?? fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
