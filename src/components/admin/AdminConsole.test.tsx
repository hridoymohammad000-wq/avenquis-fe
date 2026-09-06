import { describe, expect, it, vi } from 'vitest';
import { confirmPrivilegedAction, isAdminPath } from './AdminConsole';

describe('admin route guard boundary', () => {
  it('recognizes only the platform admin route family', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/overview')).toBe(true);
    expect(isAdminPath('/admin/settings')).toBe(true);
    expect(isAdminPath('/workspace/admin')).toBe(false);
    expect(isAdminPath('/administrator')).toBe(false);
  });

  it('requires explicit confirmation before privileged actions', () => {
    const confirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal('window', { confirm });
    expect(confirmPrivilegedAction('Provision?')).toBe(false);
    expect(confirm).toHaveBeenCalledWith('Provision?');
  });
});
