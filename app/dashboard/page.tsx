import Link from 'next/link';
import { listNotesByUser } from '@/lib/notes';
import { requireSession } from '@/lib/session';

export default async function Page() {
  const { user } = await requireSession();
  const notes = listNotesByUser(user.id);

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold'>Your notes</h1>
          <p className='text-sm text-neutral-600 dark:text-neutral-400'>Signed in as {user.name}</p>
        </div>
        <Link
          href='/notes/new'
          className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300'
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
          You have no notes yet. Create your first one.
        </p>
      ) : (
        <ul className='flex flex-col gap-2'>
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className='flex items-center justify-between gap-4 rounded-md border border-foreground/20 px-4 py-3 hover:bg-foreground/10'
              >
                <span className='min-w-0 truncate font-medium'>{note.title}</span>
                {note.isPublic && (
                  <span className='shrink-0 rounded-full border border-foreground/20 px-2 py-0.5 text-xs'>
                    Public
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
