import { NoteForm } from '@/components/NoteForm';
import { requireSession } from '@/lib/session';
import { createNoteAction } from './actions';

export default async function Page() {
  await requireSession();

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <h1 className='text-2xl font-semibold'>New note</h1>
      <NoteForm
        action={createNoteAction}
        submitLabel='Create note'
        pendingLabel='Saving…'
        cancelHref='/dashboard'
      />
    </main>
  );
}
