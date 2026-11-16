import { beforeEach, describe, expect, test, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({ headers: m.headers }));
vi.mock('next/navigation', () => ({ redirect: m.redirect }));
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: m.getSession } } }));

import { requireSession } from '@/lib/session';

beforeEach(() => {
  vi.resetAllMocks();
  m.headers.mockResolvedValue(new Headers());
  m.redirect.mockImplementation((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  });
});

describe('requireSession', () => {
  test('returns the session when signed in', async () => {
    const session = { user: { id: 'u1' } };
    m.getSession.mockResolvedValue(session);
    await expect(requireSession()).resolves.toBe(session);
  });

  test('redirects to /login when signed out', async () => {
    m.getSession.mockResolvedValue(null);
    await expect(requireSession()).rejects.toThrow('REDIRECT:/login');
  });
});
