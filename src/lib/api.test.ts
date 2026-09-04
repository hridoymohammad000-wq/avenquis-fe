import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, authApi } from './api';

afterEach(() => vi.restoreAllMocks());

describe('backend auth client', () => {
  it('uses credentialed requests so HttpOnly sessions are sent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { message: 'ok' } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await authApi.logout();

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/logout'), expect.objectContaining({ credentials: 'include', method: 'POST' }));
  });

  it('surfaces backend error codes for invalid credentials and expired sessions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }), { status: 401 })));

    await expect(authApi.login('user@example.com', 'wrong')).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('sends MFA codes to the real challenge endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { message: 'verified' } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await authApi.challengeMfa('123456');

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/auth/mfa/challenge'), expect.objectContaining({ body: JSON.stringify({ token: '123456' }) }));
  });
});

describe('apiRequest', () => {
  it('returns payload data for successful requests', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })));
    await expect(apiRequest<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
  });
});
