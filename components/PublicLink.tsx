'use client';

import { useId, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** Shows the full public URL (origin resolved in the browser). */
export function PublicLink({ slug }: { slug: string }) {
  const id = useId();
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );
  const url = `${origin}/p/${slug}`;

  return (
    <div className='flex flex-col gap-1'>
      <label htmlFor={id} className='text-sm font-medium'>
        Public link
      </label>
      <input
        id={id}
        type='text'
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className='rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900'
      />
    </div>
  );
}
