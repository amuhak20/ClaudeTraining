import { notFound } from 'next/navigation';
import { getNoteById, type Note } from '@/lib/notes';
import { requireSession } from '@/lib/session';
import { noteIdSchema } from '@/lib/validation';

/**
 * Loads a note for its owner. Redirects signed-out users to /login and shows the same
 * 404 for malformed ids, missing notes and other people's notes, so existence isn't leaked.
 */
export async function requireOwnedNote(id: string): Promise<Note> {
  const { user } = await requireSession();
  const parsedId = noteIdSchema.safeParse(id);
  const note = parsedId.success ? getNoteById(user.id, parsedId.data) : null;
  if (!note) notFound();
  return note;
}
