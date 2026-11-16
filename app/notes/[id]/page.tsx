import Link from 'next/link';
import { PublicLink } from '@/components/PublicLink';
import { DeleteNoteButton } from '@/components/DeleteNoteButton';
import { NoteViewer } from '@/components/NoteViewer';
import { requireOwnedNote } from '@/lib/note-access';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await requireOwnedNote(id);

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <Link href='/dashboard' className='text-sm text-foreground/70 hover:underline'>
        ← Back to dashboard
      </Link>

      <div className='flex items-start justify-between gap-4'>
        <h1 className='min-w-0 break-words text-2xl font-semibold'>{note.title}</h1>
        <div className='flex shrink-0 items-center gap-2'>
          <Link
            href={`/notes/${note.id}/edit`}
            className='rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium hover:bg-foreground/10'
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={note.id} title={note.title} />
        </div>
      </div>

      {note.isPublic && note.publicSlug && <PublicLink slug={note.publicSlug} />}

      <NoteViewer contentJson={note.contentJson} />
    </main>
  );
}
