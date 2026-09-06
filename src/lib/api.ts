const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const CSRF_PATH = '/api/v1/auth/csrf-token';
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
export interface ApiError extends Error { code?: string; status?: number; }
type ApiBody<T> = { data?: T; error?: { code?: string; message?: string } | string };
let csrfToken: string | null = null; let csrfInFlight: Promise<string> | null = null; let refreshInFlight: Promise<void> | null = null; let sessionExpiredHandler: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) { sessionExpiredHandler = handler; }
export function clearCsrfToken() { csrfToken = null; }
async function readBody<T>(response: Response): Promise<ApiBody<T>> { return (await response.json().catch(() => ({}))) as ApiBody<T>; }
function apiError<T>(response: Response, body: ApiBody<T>, fallback = 'Request failed'): ApiError { const message = typeof body.error === 'string' ? body.error : body.error?.message; const error = new Error(message || fallback) as ApiError; error.code = typeof body.error === 'string' ? undefined : body.error?.code; error.status = response.status; return error; }
function isAuthPath(path: string) { return path === '/api/v1/auth/login' || path === '/api/v1/auth/register' || path === '/api/v1/auth/refresh' || path === CSRF_PATH; }
async function fetchCsrfToken(): Promise<string> { if (csrfToken) return csrfToken; if (!csrfInFlight) csrfInFlight = fetch(`${API_URL}${CSRF_PATH}`, { credentials: 'include', headers: { Accept: 'application/json' } }).then(async (response) => { const body = await readBody<{ csrfToken?: string; token?: string }>(response); const token = response.headers.get('X-CSRF-Token') || body.data?.csrfToken || body.data?.token; if (!response.ok || !token) throw apiError(response, body, 'Unable to obtain a CSRF token from the backend.'); csrfToken = token; return token; }).finally(() => { csrfInFlight = null; }); return csrfInFlight; }
async function performRefresh(csrfRetried: boolean): Promise<void> { const token = await fetchCsrfToken(); const response = await fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token } }); const body = await readBody(response); const csrfFailure = response.status === 403 && (typeof body.error === 'string' ? body.error.toLowerCase().includes('csrf') : body.error?.message?.toLowerCase().includes('csrf')); if (csrfFailure && !csrfRetried) { clearCsrfToken(); return performRefresh(true); } if (!response.ok) throw apiError(response, body, 'Session expired.'); }
async function refreshSession(): Promise<void> { if (!refreshInFlight) refreshInFlight = performRefresh(false).finally(() => { refreshInFlight = null; }); return refreshInFlight; }
export async function apiRequest<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> { const method = (init.method || 'GET').toUpperCase(); const unsafeCookieRequest = UNSAFE.has(method) && (!isAuthPath(path) || path === '/api/v1/auth/login'); const headers = new Headers(init.headers); if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json'); if (unsafeCookieRequest) headers.set('X-CSRF-Token', await fetchCsrfToken()); const response = await fetch(`${API_URL}${path}`, { ...init, method, credentials: 'include', headers }); const body = await readBody<T>(response); if (response.status === 401 && !retried && !isAuthPath(path)) { try { await refreshSession(); } catch (error) { sessionExpiredHandler?.(); throw error; } return apiRequest<T>(path, init, true); } if (response.status === 403 && unsafeCookieRequest && !retried) { clearCsrfToken(); return apiRequest<T>(path, init, true); } if (!response.ok) throw apiError(response, body); return (body.data ?? body) as T; }
export const authApi = { login: (email: string, password: string) => apiRequest<{ user: BackendUser; requireMfa: boolean }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), me: () => apiRequest<{ user: BackendUser; aal: 'aal1' | 'aal2' }>('/api/v1/auth/me'), refresh: () => refreshSession(), logout: () => apiRequest<{ message: string }>('/api/v1/auth/logout', { method: 'POST' }), challengeMfa: (token: string) => apiRequest<{ message: string }>('/api/v1/auth/mfa/challenge', { method: 'POST', body: JSON.stringify({ token }) }), setupMfa: () => apiRequest<{ secret: string; qrCode: string }>('/api/v1/auth/mfa/setup', { method: 'POST' }), verifyMfa: (token: string) => apiRequest<{ message: string }>('/api/v1/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ token }) }) };
export interface BackendUser { id: string; email: string; fullName: string; status: string; mfaEnabled: boolean; avatarUrl?: string | null; platformRoles?: PlatformRole[]; }
export interface BackendTenant { membershipId: string; tenantId: string; tenantName: string; tenantSlug: string; status: string; }
export const tenantApi = { list: () => apiRequest<BackendTenant[]>('/api/v1/tenants'), current: (tenantId: string) => apiRequest<{ tenant: { id: string; name: string; slug: string }; membership: { id: string }; permissions: string[] }>('/api/v1/tenants/current', { headers: { 'X-Tenant-Id': tenantId } }), switch: (tenantId: string) => apiRequest<{ tenant: { id: string; name: string; slug: string }; membership: { id: string } }>('/api/v1/tenants/switch', { method: 'POST', body: JSON.stringify({ tenantId }) }) };

export type PlatformRole = 'PLATFORM_SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'SALES' | 'MARKETING' | 'SUPPORT' | 'FINANCE' | 'OPS';
export interface AdminOverview { activeFirms: number; onboardingFirms: number; provisionedFirms: number; leads: number; demoRequests: number; accessRequests: number; conversions: number; subscriptions: number; overdueInvoices: number; collections: number; mrr: number | null; arr: number | null; churnIndicators: { cancelledSubscriptions: number } | null; }
export interface AdminFirm { id: string; tenantId: string; legalName: string; displayName: string; workspaceSubdomain: string; ownerUserId: string | null; planCode: string | null; planName: string | null; seatLimit: number; onboardingState: string; provisioningState: string; activationState: string; billingState: string; tenantStatus: string; createdAt: string; }
export interface AdminLead { id: string; email: string; contactName: string; companyName: string | null; phone: string | null; source: string | null; status: string; assignedToUserId: string | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface AdminDemoRequest { id: string; leadId: string | null; email: string; contactName: string; requestedAt: string; status: string; source: string | null; assignedToUserId: string | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface AdminAccessRequest { id: string; leadId: string | null; email: string; requestedFirmName: string; requestedPlanCode: string | null; status: string; source: string | null; reviewedByUserId: string | null; reviewedAt: string | null; notes: string | null; createdAt: string; updatedAt: string; }
export interface AdminPlan { id: string; code: string; displayName: string; proprietorSeats: number; studentSeats: number; seatRules: Record<string, number>; isActive: boolean; }
export interface AdminSubscription { id: string; tenantId: string; planId: string; status: string; seatCount: number; provider: string; providerSubscriptionId: string | null; startedAt: string | null; currentPeriodStart: string | null; currentPeriodEnd: string | null; cancelledAt: string | null; createdAt: string; updatedAt: string; }
export interface AdminInvoice { id: string; tenantId: string; subscriptionId: string | null; invoiceNumber: string; amount: string; currency: string; status: string; dueDate: string; collectionState: string; issuedAt: string | null; createdAt: string; updatedAt: string; }
export interface AdminSupportCase { id: string; tenantId: string | null; subject: string; description?: string; priority: string; status: string; assignedToUserId: string | null; resolutionMetadata?: Record<string, unknown> | null; createdAt: string; updatedAt: string; }
export interface AdminSetting { id: string; key: string; value: unknown; description: string | null; updatedAt: string; }
export interface AdminAuditLog { id: string; actorUserId: string | null; platformRole: string; action: string; targetType: string; targetId: string | null; beforeMetadata: Record<string, unknown> | null; afterMetadata: Record<string, unknown> | null; requestId: string | null; createdAt: string; }
export interface AdminAiAgent { id: string; code: string; name: string; purpose: string; allowedTools: string[]; autonomyLevel: string; riskLevel: string; provider: string | null; model: string | null; enabled: boolean; }
export interface AdminAiRun { id: string; agentId: string; status: string; requestedByUserId: string; requestSummary: string; rationale: string | null; errorCode: string | null; createdAt: string; }
export interface AdminAiApproval { id: string; runId: string; agentId: string; requestedAction: string; riskLevel: string; requestedByUserId: string; rationale: string; status: string; createdAt: string; }
export interface AdminAiUsage { id: string; runId: string; agentId: string; provider: string; model: string; inputTokens: number | null; outputTokens: number | null; estimatedCost: string | null; latencyMs: number | null; createdAt: string; }
export interface AdminAiPolicy { id: string; policyKey: string; value: unknown; updatedAt: string; }
export interface AdminAiSummary { agents: Array<Pick<AdminAiAgent, 'id' | 'code' | 'enabled' | 'autonomyLevel' | 'provider' | 'model'>>; runCount: number; pendingApprovalCount: number; usageRecordCount: number; providerConfigured: boolean; }

export const adminApi = {
  overview: () => apiRequest<AdminOverview>('/api/v1/admin/overview'),
  firms: () => apiRequest<AdminFirm[]>('/api/v1/admin/firms'),
  firm: (id: string) => apiRequest<AdminFirm>(`/api/v1/admin/firms/${id}`),
  updateFirm: (id: string, payload: { onboardingState?: string; billingState?: string }) => apiRequest<AdminFirm>(`/api/v1/admin/firms/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  provisionFirm: (id: string) => apiRequest<AdminFirm>(`/api/v1/admin/firms/${id}/provision`, { method: 'POST', body: '{}' }),
  leads: () => apiRequest<AdminLead[]>('/api/v1/admin/leads'),
  demoRequests: () => apiRequest<AdminDemoRequest[]>('/api/v1/admin/demo-requests'),
  accessRequests: () => apiRequest<AdminAccessRequest[]>('/api/v1/admin/access-requests'),
  plans: () => apiRequest<AdminPlan[]>('/api/v1/admin/plans'),
  subscriptions: () => apiRequest<AdminSubscription[]>('/api/v1/admin/billing/subscriptions'),
  invoices: () => apiRequest<AdminInvoice[]>('/api/v1/admin/billing/invoices'),
  collections: () => apiRequest<AdminInvoice[]>('/api/v1/admin/collections'),
  growth: () => apiRequest<AdminOverview>('/api/v1/admin/growth'),
  support: () => apiRequest<AdminSupportCase[]>('/api/v1/admin/support'),
  settings: () => apiRequest<AdminSetting[]>('/api/v1/admin/settings'),
  auditLogs: () => apiRequest<AdminAuditLog[]>('/api/v1/admin/audit-logs'),
};
export const adminAiApi = {
  summary: () => apiRequest<AdminAiSummary>('/api/v1/admin/ai/summary'),
  agents: () => apiRequest<AdminAiAgent[]>('/api/v1/admin/ai/agents'),
  updateAgent: (id: string, payload: { enabled?: boolean; autonomyLevel?: string }) => apiRequest<AdminAiAgent>(`/api/v1/admin/ai/agents/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  runs: () => apiRequest<AdminAiRun[]>('/api/v1/admin/ai/runs'),
  approvals: () => apiRequest<AdminAiApproval[]>('/api/v1/admin/ai/approvals'),
  approve: (id: string) => apiRequest<AdminAiApproval>(`/api/v1/admin/ai/approvals/${id}/approve`, { method: 'POST', body: '{}' }),
  reject: (id: string) => apiRequest<AdminAiApproval>(`/api/v1/admin/ai/approvals/${id}/reject`, { method: 'POST', body: '{}' }),
  automations: () => apiRequest<unknown[]>('/api/v1/admin/ai/automations'),
  policies: () => apiRequest<AdminAiPolicy[]>('/api/v1/admin/ai/policies'),
  usage: () => apiRequest<AdminAiUsage[]>('/api/v1/admin/ai/usage'),
};
