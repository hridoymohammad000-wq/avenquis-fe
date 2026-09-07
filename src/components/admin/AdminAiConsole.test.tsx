import { describe, expect, it } from 'vitest';
import { confirmAiAction, isAdminAiPath } from './AdminAiConsole';

describe('admin AI console guards', () => {
  it('recognizes only admin AI routes', () => {
    expect(isAdminAiPath('/admin/ai')).toBe(true);
    expect(isAdminAiPath('/admin/ai/approvals')).toBe(true);
    expect(isAdminAiPath('/admin/overview')).toBe(false);
  });
  it('does not auto-confirm privileged actions outside a browser', () => {
    expect(confirmAiAction('approve')).toBe(false);
  });
});
