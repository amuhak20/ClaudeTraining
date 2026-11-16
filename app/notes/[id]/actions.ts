'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getString } from '@/lib/form';
import { parseNoteForm, SAVE_ERROR, type NoteFormState } from '@/lib/note-input';
import { deleteNote, updateNote } from '@/lib/notes';
import { requireSession } from '@/lib/session';
import { noteIdSchema } from '@/lib/validation';

export type DeleteNoteState = { error?: string };

const GONE_ERROR = 'This note no longer exists.';
const DELETE_ERROR = "We couldn't delete this note. Please try again.";

export async function updateNoteAction(
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  // Server Actions are reachable via direct POST: authenticate, validate, and scope by user_id.
  const { user } = await requireSession();

  const input = parseNoteForm(formData);
  if (!input.ok) return input.state;

  const id = noteIdSchema.safeParse(getString(formData, 'id'));
  if (!id.success) return { formError: GONE_ERROR, values: input.values };

  let updated: boolean;
  try {
    updated = updateNote(user.id, id.data, {
      title: input.title,
      contentJson: input.contentJson,
      isPublic: input.isPublic,
    });
  } catch (error) {
    console.error('Updating note failed:', error);
    return { formError: SAVE_ERROR, values: input.values };
  }
  if (!updated) return { formError: GONE_ERROR, values: input.values };

  revalidatePath('/dashboard');
  revalidatePath(`/notes/${id.data}`);
  redirect(`/notes/${id.data}`);
}

export async function deleteNoteAction(
  _prev: DeleteNoteState,
  formData: FormData,
): Promise<DeleteNoteState> {
  const { user } = await requireSession();

  const id = noteIdSchema.safeParse(getString(formData, 'id'));
  if (id.success) {
    try {
      // A missing note counts as already deleted, so this is safe to repeat.
      deleteNote(user.id, id.data);
    } catch (error) {
      console.error('Deleting note failed:', error);
      return { error: DELETE_ERROR };
    }
    revalidatePath('/dashboard');
  }

  redirect('/dashboard');
}
