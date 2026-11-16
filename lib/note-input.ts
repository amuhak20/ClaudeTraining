import { getString } from '@/lib/form';
import { parseNoteContent } from '@/lib/note-content';
import { titleSchema } from '@/lib/validation';

export type NoteFormState = {
  errors?: { title?: string[]; contentJson?: string[] };
  formError?: string;
  values?: { title: string };
};

export const SAVE_ERROR = "We couldn't save your note. Please try again.";
const CONTENT_ERROR = "Your note content couldn't be read. Please reload the page and try again.";
const ECHO_MAX = 1_000; // never echo an unbounded input back to the client

type ParsedNoteForm =
  | { ok: true; title: string; contentJson: string; isPublic: boolean; values: { title: string } }
  | { ok: false; state: NoteFormState };

/** Validates and sanitizes the title and content fields shared by the create and edit forms. */
export function parseNoteForm(formData: FormData): ParsedNoteForm {
  const rawTitle = getString(formData, 'title');
  const values = { title: rawTitle.slice(0, ECHO_MAX) };
  const title = titleSchema.safeParse(rawTitle);
  const contentJson = parseNoteContent(getString(formData, 'contentJson'));

  if (!title.success || contentJson === null) {
    return {
      ok: false,
      state: {
        errors: {
          ...(title.success ? {} : { title: title.error.issues.map((issue) => issue.message) }),
          ...(contentJson === null ? { contentJson: [CONTENT_ERROR] } : {}),
        },
        values,
      },
    };
  }

  return {
    ok: true,
    title: title.data,
    contentJson,
    isPublic: formData.get('isPublic') === 'on',
    values,
  };
}
