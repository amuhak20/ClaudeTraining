import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { PASSWORD_MIN, PASSWORD_MAX } from '@/lib/validation';
import { signUpNameHook } from '@/lib/auth-hooks';

export const auth = betterAuth({
  database: db,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
  },
  hooks: {
    // Server-side backstop: the form validates too, but requests can bypass the UI.
    before: createAuthMiddleware(async (ctx) => signUpNameHook(ctx)),
  },
  plugins: [nextCookies()], // must be the last plugin
});

export type Session = typeof auth.$Infer.Session;
