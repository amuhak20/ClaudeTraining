import { describe, expect, test } from 'vitest';
import { EMPTY_DOC } from '@/lib/editor-extensions';
import { parseNoteForm } from '@/lib/note-input';

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe('parseNoteForm', () => {
  test('accepts valid input and sanitizes the title', () => {
    const result = parseNoteForm(form({ title: '  Hi   there ', contentJson: EMPTY_DOC }));
    expect(result).toMatchObject({ ok: true, title: 'Hi there', isPublic: false });
  });

  test('isPublic is true only when the checkbox is "on"', () => {
    const base = { title: 't', contentJson: EMPTY_DOC };
    expect(parseNoteForm(form({ ...base, isPublic: 'on' }))).toMatchObject({ isPublic: true });
    expect(parseNoteForm(form({ ...base, isPublic: 'true' }))).toMatchObject({ isPublic: false });
  });

  test('reports a title error and echoes the raw title', () => {
    const result = parseNoteForm(form({ title: '   ', contentJson: EMPTY_DOC }));
    if (result.ok) throw new Error('expected failure');
    expect(result.state.errors?.title).toEqual(['Please enter a title.']);
    expect(result.state.errors?.contentJson).toBeUndefined();
    expect(result.state.values).toEqual({ title: '   ' });
  });

  test('reports a content error for invalid JSON', () => {
    const result = parseNoteForm(form({ title: 'ok', contentJson: 'garbage' }));
    if (result.ok) throw new Error('expected failure');
    expect(result.state.errors?.contentJson).toHaveLength(1);
    expect(result.state.errors?.title).toBeUndefined();
  });

  test('reports both errors and caps the echoed title', () => {
    const result = parseNoteForm(form({ title: 'a'.repeat(5000), contentJson: '' }));
    if (result.ok) throw new Error('expected failure');
    expect(result.state.errors?.title).toBeDefined();
    expect(result.state.errors?.contentJson).toBeDefined();
    expect(result.state.values?.title).toHaveLength(1000);
  });

  test('missing fields are treated as empty', () => {
    expect(parseNoteForm(new FormData()).ok).toBe(false);
  });
});
