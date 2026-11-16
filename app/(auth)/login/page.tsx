import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthForm, type AuthMode } from '@/components/AuthForm';
import { getSession } from '@/lib/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  if (await getSession()) redirect('/dashboard');

  const { mode } = await searchParams;
  const current: AuthMode = mode === 'signup' ? 'signup' : 'signin';

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4 py-12'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold'>
          {current === 'signup' ? 'Create an account' : 'Sign in'}
        </h1>
        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
          {current === 'signup' ? (
            <>
              Already have an account?{' '}
              <Link href='/login?mode=signin' className='underline'>
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link href='/login?mode=signup' className='underline'>
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>

      <AuthForm mode={current} />
    </main>
  );
}
