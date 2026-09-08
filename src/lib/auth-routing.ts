import type { BackendUser } from './api';

export const publicMarketingPaths = ['/', '/platform', '/security', '/pricing', '/demo'];

export function shouldEnterAdmin(user: Pick<BackendUser, 'platformRoles'>): boolean {
  return (user.platformRoles?.length ?? 0) > 0;
}

export function postAuthenticationDestination(user: Pick<BackendUser, 'platformRoles'>): 'admin' | 'workspace' {
  return shouldEnterAdmin(user) ? 'admin' : 'workspace';
}

export function bootstrapDestination(
  path: string,
  user: Pick<BackendUser, 'platformRoles'>,
  isAdminRoute: boolean,
): 'public' | 'admin' | 'workspace' {
  if (publicMarketingPaths.includes(path) && shouldEnterAdmin(user)) return 'public';
  if (isAdminRoute) return 'admin';
  return postAuthenticationDestination(user);
}
