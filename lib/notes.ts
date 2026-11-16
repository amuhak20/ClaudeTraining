import { randomBytes } from 'node:crypto';
import { get, query, run } from '@/lib/db';

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string; // stringified TipTap doc
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export type NoteInput = {
  title: string;
  contentJson: string;
  isPublic: boolean;
};

export type PublicNote = { title: string; contentJson: string };

/** 22 unguessable URL-safe chars (128 bits). */
const generateSlug = () => randomBytes(16).toString('base64url');

const toNote = (row: NoteRow): Note => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  contentJson: row.content_json,
  isPublic: row.is_public === 1,
  publicSlug: row.public_slug,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Only module that touches `notes`. Every query is scoped to `user_id`.

/** Inserts a note owned by `userId` and returns its id. */
export function createNote(userId: string, { title, contentJson, isPublic }: NoteInput): string {
  const id = crypto.randomUUID();
  run(
    'INSERT INTO notes (id, user_id, title, content_json, is_public, public_slug) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, title, contentJson, isPublic ? 1 : 0, isPublic ? generateSlug() : null],
  );
  return id;
}

/** Returns the note only if it belongs to `userId`. */
export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(
    `SELECT id, user_id, title, content_json, is_public, public_slug, created_at, updated_at
     FROM notes WHERE id = ? AND user_id = ?`,
    [noteId, userId],
  );
  return row ? toNote(row) : null;
}

export type NoteSummary = { id: string; title: string; isPublic: boolean; updatedAt: string };

/** Lists the user's notes (without content), newest first. */
export function listNotesByUser(userId: string): NoteSummary[] {
  return query<{ id: string; title: string; is_public: number; updated_at: string }>(
    `SELECT id, title, is_public, updated_at FROM notes
     WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC`,
    [userId],
  ).map((row) => ({
    id: row.id,
    title: row.title,
    isPublic: row.is_public === 1,
    updatedAt: row.updated_at,
  }));
}

/** Updates the note if it belongs to `userId`. Returns false when nothing matched. */
export function updateNote(
  userId: string,
  noteId: string,
  { title, contentJson, isPublic }: NoteInput,
): boolean {
  const flag = isPublic ? 1 : 0;
  // Keep the existing slug while shared (stable link); clear it when sharing is off.
  return (
    run(
      `UPDATE notes SET title = ?, content_json = ?, is_public = ?,
         public_slug = CASE WHEN ? = 1 THEN COALESCE(public_slug, ?) ELSE NULL END,
         updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [title, contentJson, flag, flag, generateSlug(), noteId, userId],
    ) > 0
  );
}

/** Unauthenticated read: only title and content, and only while the note is shared. */
export function getPublicNoteBySlug(slug: string): PublicNote | null {
  const row = get<{ title: string; content_json: string }>(
    'SELECT title, content_json FROM notes WHERE public_slug = ? AND is_public = 1',
    [slug],
  );
  return row ? { title: row.title, contentJson: row.content_json } : null;
}

/** Deletes the note if it belongs to `userId`. Returns false when nothing matched. */
export function deleteNote(userId: string, noteId: string): boolean {
  return run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]) > 0;
}
