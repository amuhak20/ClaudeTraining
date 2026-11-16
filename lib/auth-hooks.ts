import { APIError } from 'better-auth/api';
import { nameSchema } from '@/lib/validation';

type HookCtx = { path: string; body?: Record<string, unknown> } & Record<string, unknown>;

/** Server-side backstop: the form validates too, but requests can bypass the UI. */
export function signUpNameHook<T extends HookCtx>(ctx: T) {
  if (ctx.path !== '/sign-up/email') return;

  const name = nameSchema.safeParse(ctx.body?.name);
  if (!name.success) {
    throw new APIError('BAD_REQUEST', { message: 'Invalid name.', code: 'INVALID_NAME' });
  }
  return { context: { ...ctx, body: { ...ctx.body, name: name.data } } };
}
