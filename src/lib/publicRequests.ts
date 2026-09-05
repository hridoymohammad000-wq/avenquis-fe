/**
 * Public request adapter reserved for a future approved backend endpoint.
 * It deliberately does not create users, tenants, or send requests today.
 */
export type PublicRequestKind = 'access' | 'demo';

export const publicRequestApi = {
  available: false,
  async submit(_kind: PublicRequestKind, _payload: Record<string, string>): Promise<never> {
    throw new Error('Public request submission is not available until an approved backend endpoint is provided.');
  },
};
