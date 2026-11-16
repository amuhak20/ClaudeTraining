import { describe, expect, test } from 'vitest';
import { authErrorMessage } from '@/lib/auth-errors';

describe('authErrorMessage', () => {
  test('maps known codes to fixed wording', () => {
    expect(authErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(
      'Incorrect email or password.',
    );
    expect(authErrorMessage({ code: 'PASSWORD_TOO_SHORT' })).toContain('8');
  });

  test('does not reveal whether an email is registered', () => {
    expect(authErrorMessage({ code: 'USER_ALREADY_EXISTS' })).toBe(
      authErrorMessage({ code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' }),
    );
  });

  test('handles rate limiting', () => {
    expect(authErrorMessage({ status: 429 })).toMatch(/too many attempts/i);
  });

  test('falls back to a generic message for unknown or prototype keys', () => {
    const generic = authErrorMessage({});
    expect(authErrorMessage({ code: 'SOMETHING_ELSE', status: 500 })).toBe(generic);
    expect(authErrorMessage({ code: 'toString' })).toBe(generic);
  });
});
