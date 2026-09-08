import { describe, expect, it } from 'vitest';
import { bootstrapDestination, postAuthenticationDestination } from './auth-routing';

describe('post-authentication routing', () => {
  it('routes a newly authenticated platform user to the admin flow', () => {
    expect(postAuthenticationDestination({ platformRoles: ['SUPPORT'] })).toBe('admin');
    expect(postAuthenticationDestination({ platformRoles: ['SUPPORT', 'OPS'] })).toBe('admin');
  });

  it('keeps an already authenticated platform user on the public landing page', () => {
    expect(bootstrapDestination('/', { platformRoles: ['SUPPORT'] }, false)).toBe('public');
  });

  it('loads the admin session when a platform user explicitly visits an admin route', () => {
    expect(bootstrapDestination('/admin/overview', { platformRoles: ['SUPPORT'] }, true)).toBe('admin');
  });

  it('keeps normal users in the tenant workspace flow', () => {
    expect(postAuthenticationDestination({ platformRoles: [] })).toBe('workspace');
    expect(bootstrapDestination('/', { platformRoles: [] }, false)).toBe('workspace');
    expect(bootstrapDestination('/sign-in', {}, false)).toBe('workspace');
  });
});
