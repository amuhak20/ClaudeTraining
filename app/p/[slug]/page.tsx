import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NoteViewer } from '@/components/NoteViewer';
import { getPublicNoteBySlug } from '@/lib/notes';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const SLUG_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = SLUG_PATTERN.test(slug) ? getPublicNoteBySlug(slug) : null;
  if (!note) notFound();

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8'>
      <h1 className='break-words text-2xl font-semibold'>{note.title}</h1>
      <NoteViewer contentJson={note.contentJson} />
    </main>
  );
}
