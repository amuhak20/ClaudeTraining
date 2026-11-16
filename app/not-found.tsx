import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-4 px-4 py-12'>
      <h1 className='text-2xl font-semibold'>Page not found</h1>
      <p className='text-sm text-foreground/70'>
        The page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <div>
        <Link
          href='/dashboard'
          className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300'
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
