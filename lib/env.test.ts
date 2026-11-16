import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const valid = {
  DB_PATH: 'data/app.db',
  BETTER_AUTH_SECRET: 's'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
};

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

function stub(overrides: Record<string, string> = {}) {
  for (const [k, v] of Object.entries({ ...valid, ...overrides })) vi.stubEnv(k, v);
}

describe('env', () => {
  test('resolves DB_PATH against the working directory', async () => {
    stub();
    const { env } = await import('@/lib/env');
    expect(env.DB_PATH).toBe(resolve(process.cwd(), 'data/app.db'));
  });

  test('throws a names-only error and never leaks values', async () => {
    stub({ BETTER_AUTH_SECRET: 'short-secret-value', BETTER_AUTH_URL: 'not a url' });
    const error = await import('@/lib/env').then(
      () => null,
      (e: Error) => e,
    );
    expect(error?.message).toContain('BETTER_AUTH_SECRET');
    expect(error?.message).toContain('BETTER_AUTH_URL');
    expect(error?.message).not.toContain('short-secret-value');
    expect(error?.message).not.toContain('DB_PATH');
  });
});
