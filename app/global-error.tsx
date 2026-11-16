'use client';

// @ts-expect-error Next.js processes CSS imports without TypeScript declarations.
import './globals.css';

// Replaces the root layout when it fails (e.g. the session lookup). Shows no error details.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang='en'>
      <body>
        <main className='mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-4 py-12'>
          <h1 className='text-2xl font-semibold'>Something went wrong</h1>
          <p className='text-sm text-foreground/70'>
            NextNotes ran into a problem. Please try again in a moment.
          </p>
          <div>
            <button
              type='button'
              onClick={reset}
              className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300'
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
