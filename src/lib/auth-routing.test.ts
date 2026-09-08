import { describe, expect, it } from 'vitest';
import { shouldEnterAdmin } from './auth-routing';

describe('post-authentication routing', () => {
  it('keeps users without platform roles in the tenant workspace flow', () => {
    expect(shouldEnterAdmin({ platformRoles: [] })).toBe(false);
    expect(shouldEnterAdmin({})).toBe(false);
  });

  it('routes users with one or more platform roles to the existing admin flow', () => {
    expect(shouldEnterAdmin({ platformRoles: ['SUPPORT'] })).toBe(true);
    expect(shouldEnterAdmin({ platformRoles: ['SUPPORT', 'OPS'] })).toBe(true);
  });
});
