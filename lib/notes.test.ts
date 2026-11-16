import { afterAll, describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Point the app at a throwaway database BEFORE importing anything that opens it,
// so these tests can never touch the real data/app.db.
const dir = mkdtempSync(join(tmpdir(), 'notes-test-'));
process.env.DB_PATH = join(dir, 'test.db');
process.env.BETTER_AUTH_SECRET ??= 'x'.repeat(32);
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';

const { getDb, run } = await import('@/lib/db');
const { createNote, deleteNote, getNoteById, getPublicNoteBySlug, updateNote } =
  await import('@/lib/notes');

const OWNER = 'user-owner';
const OTHER = 'user-other';
const CONTENT = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });

for (const [id, email] of [
  [OWNER, 'owner@example.com'],
  [OTHER, 'other@example.com'],
]) {
  run('INSERT INTO user (id, name, email) VALUES (?, ?, ?)', [id, id, email]);
}

afterAll(() => {
  getDb().close();
  rmSync(dir, { recursive: true, force: true });
});

describe('note ownership', () => {
  test('only the owner can read a note', () => {
    const id = createNote(OWNER, { title: 'Mine', contentJson: CONTENT, isPublic: false });

    expect(getNoteById(OWNER, id)?.title).toBe('Mine');
    expect(getNoteById(OTHER, id)).toBeNull();
    expect(getNoteById(OWNER, 'does-not-exist')).toBeNull();
  });

  test('only the owner can update a note', () => {
    const id = createNote(OWNER, { title: 'Before', contentJson: CONTENT, isPublic: false });
    run("UPDATE notes SET updated_at = '2000-01-01 00:00:00' WHERE id = ?", [id]);

    expect(
      updateNote(OTHER, id, { title: 'Hijacked', contentJson: CONTENT, isPublic: false }),
    ).toBe(false);
    expect(getNoteById(OWNER, id)?.title).toBe('Before');

    expect(updateNote(OWNER, id, { title: 'After', contentJson: CONTENT, isPublic: false })).toBe(
      true,
    );
    const updated = getNoteById(OWNER, id);
    expect(updated?.title).toBe('After');
    expect(updated?.updatedAt).not.toBe('2000-01-01 00:00:00');
  });

  test('only the owner can delete a note', () => {
    const id = createNote(OWNER, { title: 'Keep me', contentJson: CONTENT, isPublic: false });

    expect(deleteNote(OTHER, id)).toBe(false);
    expect(getNoteById(OWNER, id)).not.toBeNull();

    expect(deleteNote(OWNER, id)).toBe(true);
    expect(getNoteById(OWNER, id)).toBeNull();
    expect(deleteNote(OWNER, id)).toBe(false); // already gone
  });
});

describe('public sharing', () => {
  const input = (isPublic: boolean) => ({ title: 'Shared', contentJson: CONTENT, isPublic });

  test('private notes have no slug', () => {
    const id = createNote(OWNER, input(false));
    expect(getNoteById(OWNER, id)?.publicSlug).toBeNull();
  });

  test('sharing generates a long slug that stays stable across edits', () => {
    const id = createNote(OWNER, input(true));
    const slug = getNoteById(OWNER, id)!.publicSlug!;
    expect(slug.length).toBeGreaterThanOrEqual(16);

    updateNote(OWNER, id, input(true));
    expect(getNoteById(OWNER, id)?.publicSlug).toBe(slug);
    expect(getPublicNoteBySlug(slug)).toEqual({ title: 'Shared', contentJson: CONTENT });
  });

  test('turning sharing off clears the slug so the link stops working', () => {
    const id = createNote(OWNER, input(true));
    const slug = getNoteById(OWNER, id)!.publicSlug!;

    updateNote(OWNER, id, input(false));
    expect(getNoteById(OWNER, id)?.publicSlug).toBeNull();
    expect(getPublicNoteBySlug(slug)).toBeNull();
  });

  test('re-enabling issues a new slug; only the owner can change sharing', () => {
    const id = createNote(OWNER, input(true));
    const old = getNoteById(OWNER, id)!.publicSlug!;

    expect(updateNote(OTHER, id, input(false))).toBe(false);
    expect(getPublicNoteBySlug(old)).not.toBeNull();

    updateNote(OWNER, id, input(false));
    updateNote(OWNER, id, input(true));
    expect(getNoteById(OWNER, id)?.publicSlug).not.toBe(old);
  });

  test('deleting a shared note kills the link', () => {
    const id = createNote(OWNER, input(true));
    const slug = getNoteById(OWNER, id)!.publicSlug!;
    deleteNote(OWNER, id);
    expect(getPublicNoteBySlug(slug)).toBeNull();
  });
});
