import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, onSessionChange, setAccessToken } from './client';

type Call = { url: string; init: RequestInit };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('api client', () => {
  let calls: Call[];
  let responder: (url: string, init: RequestInit) => Response;

  beforeEach(() => {
    calls = [];
    setAccessToken('old-token');
    vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
      calls.push({ url, init });
      return responder(url, init);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it('unwraps the envelope and sends the bearer token', async () => {
    responder = () => json(200, { success: true, data: { ok: 1 }, meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } });
    const res = await api.get<{ ok: number }>('/thing', { page: 1, q: '', skip: undefined });
    expect(res.data).toEqual({ ok: 1 });
    expect(res.meta?.total).toBe(1);
    expect(calls[0]!.url).toBe('/api/v1/thing?page=1');
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer old-token');
  });

  it('throws ApiError carrying the backend code', async () => {
    responder = () => json(409, { success: false, code: 'VEHICLE_BUSY', message: 'busy', requestId: 'r1' });
    await expect(api.post('/x', {})).rejects.toMatchObject({ status: 409, code: 'VEHICLE_BUSY', requestId: 'r1' });
  });

  it('refreshes once on 401 and retries with the new token; concurrent 401s share one refresh', async () => {
    responder = (url, init) => {
      if (url.endsWith('/auth/refresh')) return json(200, { data: { accessToken: 'new-token' } });
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === 'Bearer new-token' ? json(200, { data: 'ok' }) : json(401, { code: 'AUTH_TOKEN_EXPIRED', message: 'expired' });
    };
    const [a, b] = await Promise.all([api.get<string>('/a'), api.get<string>('/b')]);
    expect(a.data).toBe('ok');
    expect(b.data).toBe('ok');
    expect(calls.filter((c) => c.url.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('signals session expiry when the refresh also fails', async () => {
    responder = (url) => (url.endsWith('/auth/refresh') ? json(401, { code: 'SESSION_INVALID' }) : json(401, { code: 'AUTH_TOKEN_EXPIRED' }));
    const events: string[] = [];
    const off = onSessionChange((e) => events.push(e));
    await expect(api.get('/private')).rejects.toBeInstanceOf(ApiError);
    off();
    expect(events).toEqual(['expired']);
  });
});
