import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EMPTY_DOC } from '@/lib/editor-extensions';

const m = vi.hoisted(() => ({
  requireSession: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: m.redirect }));
vi.mock('next/cache', () => ({ revalidatePath: m.revalidatePath }));
vi.mock('@/lib/session', () => ({ requireSession: m.requireSession }));
vi.mock('@/lib/notes', () => ({ updateNote: m.updateNote, deleteNote: m.deleteNote }));

import { deleteNoteAction, updateNoteAction } from './actions';

const ID = '123e4567-e89b-42d3-a456-426614174000';
const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};
const valid = { id: ID, title: 'T', contentJson: EMPTY_DOC };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  m.requireSession.mockResolvedValue({ user: { id: 'u1' } });
  m.redirect.mockImplementation((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  });
});

describe('updateNoteAction', () => {
  test('updates scoped to the session user and redirects', async () => {
    m.updateNote.mockReturnValue(true);
    await expect(updateNoteAction({}, form({ ...valid, isPublic: 'on' }))).rejects.toThrow(
      `REDIRECT:/notes/${ID}`,
    );
    expect(m.updateNote).toHaveBeenCalledWith('u1', ID, {
      title: 'T',
      contentJson: expect.any(String),
      isPublic: true,
    });
    expect(m.revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(m.revalidatePath).toHaveBeenCalledWith(`/notes/${ID}`);
  });

  test('returns validation errors without updating', async () => {
    const state = await updateNoteAction({}, form({ ...valid, title: '' }));
    expect(state.errors?.title).toBeDefined();
    expect(m.updateNote).not.toHaveBeenCalled();
  });

  test('rejects a malformed id', async () => {
    const state = await updateNoteAction({}, form({ ...valid, id: 'x' }));
    expect(state.formError).toMatch(/no longer exists/);
    expect(m.updateNote).not.toHaveBeenCalled();
  });

  test('reports a missing or foreign note', async () => {
    m.updateNote.mockReturnValue(false);
    const state = await updateNoteAction({}, form(valid));
    expect(state.formError).toMatch(/no longer exists/);
  });

  test('returns a generic error when the update throws', async () => {
    m.updateNote.mockImplementation(() => {
      throw new Error('sqlite');
    });
    const state = await updateNoteAction({}, form(valid));
    expect(state.formError).toBeDefined();
    expect(state.formError).not.toContain('sqlite');
  });
});

describe('deleteNoteAction', () => {
  test('deletes scoped to the session user and redirects to the dashboard', async () => {
    await expect(deleteNoteAction({}, form({ id: ID }))).rejects.toThrow('REDIRECT:/dashboard');
    expect(m.deleteNote).toHaveBeenCalledWith('u1', ID);
    expect(m.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  test('ignores malformed ids but still redirects', async () => {
    await expect(deleteNoteAction({}, form({ id: 'x' }))).rejects.toThrow('REDIRECT:/dashboard');
    expect(m.deleteNote).not.toHaveBeenCalled();
  });

  test('returns an error when deletion throws', async () => {
    m.deleteNote.mockImplementation(() => {
      throw new Error('locked');
    });
    const state = await deleteNoteAction({}, form({ id: ID }));
    expect(state.error).toMatch(/couldn't delete/);
    expect(m.redirect).not.toHaveBeenCalled();
  });
});
