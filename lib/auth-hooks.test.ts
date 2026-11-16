import { describe, expect, test } from 'vitest';
import { signUpNameHook } from '@/lib/auth-hooks';

describe('signUpNameHook', () => {
  test('ignores other paths', () => {
    expect(signUpNameHook({ path: '/sign-in/email', body: {} })).toBeUndefined();
  });

  test('sanitizes the name on sign-up', () => {
    const out = signUpNameHook({
      path: '/sign-up/email',
      body: { name: '  Ada   L ', email: 'a@b.c' },
    });
    expect(out?.context.body).toEqual({ name: 'Ada L', email: 'a@b.c' });
  });

  test.each([undefined, '', '   ', 'x'.repeat(101), 42])('rejects invalid name %j', (name) => {
    expect(() => signUpNameHook({ path: '/sign-up/email', body: { name } })).toThrow();
  });
});
