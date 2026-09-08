import type { BackendUser } from './api';

export function shouldEnterAdmin(user: Pick<BackendUser, 'platformRoles'>): boolean {
  return (user.platformRoles?.length ?? 0) > 0;
}
