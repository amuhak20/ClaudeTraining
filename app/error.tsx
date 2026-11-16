'use client';

import Link from 'next/link';

// Deliberately ignores the `error` prop: its message must never reach the user.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className='mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-4 px-4 py-12'>
      <h1 className='text-2xl font-semibold'>Something went wrong</h1>
      <p className='text-sm text-foreground/70'>
        We couldn&apos;t complete that. Please try again. If it keeps happening, come back a little
        later.
      </p>
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={reset}
          className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300'
        >
          Try again
        </button>
        <Link
          href='/dashboard'
          className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/10'
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
