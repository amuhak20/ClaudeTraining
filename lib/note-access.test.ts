import { beforeEach, describe, expect, test, vi } from 'vitest';

const m = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getNoteById: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/navigation', () => ({ notFound: m.notFound }));
vi.mock('@/lib/session', () => ({ requireSession: m.requireSession }));
vi.mock('@/lib/notes', () => ({ getNoteById: m.getNoteById }));

import { requireOwnedNote } from '@/lib/note-access';

const ID = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => {
  vi.resetAllMocks();
  m.requireSession.mockResolvedValue({ user: { id: 'u1' } });
  m.notFound.mockImplementation(() => {
    throw new Error('NOT_FOUND');
  });
});

describe('requireOwnedNote', () => {
  test('returns the note, scoped to the session user', async () => {
    const note = { id: ID };
    m.getNoteById.mockReturnValue(note);
    await expect(requireOwnedNote(ID)).resolves.toBe(note);
    expect(m.getNoteById).toHaveBeenCalledWith('u1', ID);
  });

  test('404s for a malformed id without querying the DB', async () => {
    await expect(requireOwnedNote('nope')).rejects.toThrow('NOT_FOUND');
    expect(m.getNoteById).not.toHaveBeenCalled();
  });

  test('404s for missing or foreign notes', async () => {
    m.getNoteById.mockReturnValue(null);
    await expect(requireOwnedNote(ID)).rejects.toThrow('NOT_FOUND');
  });

  test('propagates the login redirect for signed-out users', async () => {
    m.requireSession.mockRejectedValue(new Error('REDIRECT:/login'));
    await expect(requireOwnedNote(ID)).rejects.toThrow('REDIRECT:/login');
  });
});
