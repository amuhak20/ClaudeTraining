'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseNoteForm, SAVE_ERROR, type NoteFormState } from '@/lib/note-input';
import { createNote } from '@/lib/notes';
import { requireSession } from '@/lib/session';

export async function createNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  // Server Actions are reachable via direct POST, so authorize here too.
  const { user } = await requireSession();

  const input = parseNoteForm(formData);
  if (!input.ok) return input.state;

  let id: string;
  try {
    id = createNote(user.id, {
      title: input.title,
      contentJson: input.contentJson,
      isPublic: input.isPublic,
    });
  } catch (error) {
    // Full details go to the server log only; the client gets a generic message.
    console.error('Creating note failed:', error);
    return { formError: SAVE_ERROR, values: input.values };
  }

  revalidatePath('/dashboard');
  redirect(`/notes/${id}`);
}
