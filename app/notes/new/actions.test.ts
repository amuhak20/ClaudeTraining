import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EMPTY_DOC } from '@/lib/editor-extensions';

const m = vi.hoisted(() => ({
  requireSession: vi.fn(),
  createNote: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: m.redirect }));
vi.mock('next/cache', () => ({ revalidatePath: m.revalidatePath }));
vi.mock('@/lib/session', () => ({ requireSession: m.requireSession }));
vi.mock('@/lib/notes', () => ({ createNote: m.createNote }));

import { createNoteAction } from './actions';

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

beforeEach(() => {
  vi.resetAllMocks();
  m.requireSession.mockResolvedValue({ user: { id: 'u1' } });
  m.redirect.mockImplementation((to: string) => {
    throw new Error(`REDIRECT:${to}`);
  });
});

describe('createNoteAction', () => {
  test('creates the note for the session user and redirects to it', async () => {
    m.createNote.mockReturnValue('note-1');
    await expect(
      createNoteAction({}, form({ title: ' T ', contentJson: EMPTY_DOC, isPublic: 'on' })),
    ).rejects.toThrow('REDIRECT:/notes/note-1');
    expect(m.createNote).toHaveBeenCalledWith('u1', {
      title: 'T',
      contentJson: expect.any(String),
      isPublic: true,
    });
    expect(m.revalidatePath).toHaveBeenCalledWith('/dashboard');
  });

  test('returns validation errors without touching the DB', async () => {
    const state = await createNoteAction({}, form({ title: '', contentJson: EMPTY_DOC }));
    expect(state.errors?.title).toBeDefined();
    expect(m.createNote).not.toHaveBeenCalled();
  });

  test('returns a generic error when the insert throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    m.createNote.mockImplementation(() => {
      throw new Error('disk full');
    });
    const state = await createNoteAction({}, form({ title: 'T', contentJson: EMPTY_DOC }));
    expect(state.formError).toBeDefined();
    expect(state.formError).not.toContain('disk full');
    expect(state.values).toEqual({ title: 'T' });
  });

  test('requires a session', async () => {
    m.requireSession.mockRejectedValue(new Error('REDIRECT:/login'));
    await expect(createNoteAction({}, new FormData())).rejects.toThrow('REDIRECT:/login');
    expect(m.createNote).not.toHaveBeenCalled();
  });
});
