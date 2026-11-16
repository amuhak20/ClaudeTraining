'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function signOutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    // Details stay in the server log; the user is simply sent to the login page.
    console.error('Sign out failed:', error);
  }
  redirect('/login');
}
