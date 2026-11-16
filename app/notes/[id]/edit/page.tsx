import { updateNoteAction } from '@/app/notes/[id]/actions';
import { NoteForm } from '@/components/NoteForm';
import { requireOwnedNote } from '@/lib/note-access';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await requireOwnedNote(id);

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <h1 className='text-2xl font-semibold'>Edit note</h1>
      <NoteForm
        action={updateNoteAction}
        note={{
          id: note.id,
          title: note.title,
          contentJson: note.contentJson,
          isPublic: note.isPublic,
          publicSlug: note.publicSlug,
        }}
        submitLabel='Save changes'
        pendingLabel='Saving…'
        cancelHref={`/notes/${note.id}`}
      />
    </main>
  );
}
