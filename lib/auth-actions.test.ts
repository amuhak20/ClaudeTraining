import { beforeEach, describe, expect, test, vi } from 'vitest';

const m = vi.hoisted(() => ({ signOut: vi.fn(), redirect: vi.fn() }));

vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('next/navigation', () => ({ redirect: m.redirect }));
vi.mock('@/lib/auth', () => ({ auth: { api: { signOut: m.signOut } } }));

import { signOutAction } from '@/lib/auth-actions';

beforeEach(() => vi.resetAllMocks());

describe('signOutAction', () => {
  test('signs out then redirects to /login', async () => {
    m.signOut.mockResolvedValue(undefined);
    await signOutAction();
    expect(m.signOut).toHaveBeenCalledOnce();
    expect(m.redirect).toHaveBeenCalledWith('/login');
  });

  test('still redirects (and logs) when sign-out fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    m.signOut.mockRejectedValue(new Error('boom'));
    await signOutAction();
    expect(log).toHaveBeenCalled();
    expect(m.redirect).toHaveBeenCalledWith('/login');
  });
});
