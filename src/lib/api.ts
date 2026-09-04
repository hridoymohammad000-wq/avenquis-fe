const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export interface ApiError extends Error {
  code?: string;
  status?: number;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = (await response.json().catch(() => ({}))) as { data?: T; error?: { code?: string; message?: string } };
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Request failed') as ApiError;
    error.code = body.error?.code;
    error.status = response.status;
    throw error;
  }
  return (body.data ?? body) as T;
}

export const authApi = {
  login: (email: string, password: string) => apiRequest<{ user: BackendUser; requireMfa: boolean }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, fullName: string) => apiRequest<{ user: BackendUser }>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ email, password, fullName }) }),
  me: () => apiRequest<{ user: BackendUser; aal: 'aal1' | 'aal2' }>('/api/v1/auth/me'),
  logout: () => apiRequest<{ message: string }>('/api/v1/auth/logout', { method: 'POST' }),
  challengeMfa: (token: string) => apiRequest<{ message: string }>('/api/v1/auth/mfa/challenge', { method: 'POST', body: JSON.stringify({ token }) }),
  setupMfa: () => apiRequest<{ secret: string; qrCode: string }>('/api/v1/auth/mfa/setup', { method: 'POST' }),
  verifyMfa: (token: string) => apiRequest<{ message: string }>('/api/v1/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ token }) }),
};

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  mfaEnabled: boolean;
  avatarUrl?: string | null;
}

export interface BackendTenant {
  membershipId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  status: string;
}

export const tenantApi = {
  list: () => apiRequest<BackendTenant[]>('/api/v1/tenants'),
  current: (tenantId: string) => apiRequest<{ tenant: { id: string; name: string; slug: string }; membership: { id: string }; permissions: string[] }>('/api/v1/tenants/current', { headers: { 'X-Tenant-Id': tenantId } }),
  switch: (tenantId: string) => apiRequest<{ tenant: { id: string; name: string; slug: string }; membership: { id: string } }>('/api/v1/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId }) }),
};
