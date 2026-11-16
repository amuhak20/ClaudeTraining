import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/** Per-request memoized session lookup (deduped across the render tree). */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Returns the session or redirects unauthenticated users to /login. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
