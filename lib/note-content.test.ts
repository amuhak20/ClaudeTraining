import { describe, expect, test } from 'vitest';
import { EMPTY_DOC } from '@/lib/editor-extensions';
import { parseNoteContent } from '@/lib/note-content';

const doc = (...content: unknown[]) => JSON.stringify({ type: 'doc', content });
const text = (value: string, marks?: unknown[]) => ({
  type: 'text',
  text: value,
  ...(marks ? { marks } : {}),
});
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content });

describe('parseNoteContent', () => {
  test('round-trips the empty document', () => {
    expect(JSON.parse(parseNoteContent(EMPTY_DOC)!)).toEqual(JSON.parse(EMPTY_DOC));
  });

  test('accepts every supported content type', () => {
    const input = doc(
      { type: 'heading', attrs: { level: 2 }, content: [text('Title')] },
      paragraph(text('bold', [{ type: 'bold' }]), text('italic', [{ type: 'italic' }])),
      paragraph(text('code', [{ type: 'code' }])),
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [paragraph(text('item'))] }],
      },
      { type: 'codeBlock', attrs: { language: 'ts' }, content: [text('const a = 1;')] },
      { type: 'horizontalRule' },
    );
    expect(parseNoteContent(input)).not.toBeNull();
  });

  test('rejects links (no URLs allowed)', () => {
    const link = { type: 'link', attrs: { href: 'javascript:alert(1)' } };
    expect(parseNoteContent(doc(paragraph(text('x', [link]))))).toBeNull();
  });

  test('rejects node types outside the editor schema', () => {
    expect(
      parseNoteContent(doc({ type: 'blockquote', content: [paragraph(text('x'))] })),
    ).toBeNull();
    expect(parseNoteContent(doc({ type: 'orderedList', content: [] }))).toBeNull();
    expect(parseNoteContent(doc({ type: 'script', content: [] }))).toBeNull();
  });

  test('rejects invalid heading levels', () => {
    const input = doc({ type: 'heading', attrs: { level: 7 }, content: [text('x')] });
    expect(parseNoteContent(input)).toBeNull();
  });

  test('normalizes a suspicious code block language', () => {
    const input = doc({
      type: 'codeBlock',
      attrs: { language: 'x" onload="alert(1)' },
      content: [text('a')],
    });
    const result = JSON.parse(parseNoteContent(input)!);
    expect(result.content[0].attrs.language).toBeNull();
  });

  test('strips control and bidi characters from text', () => {
    const result = JSON.parse(parseNoteContent(doc(paragraph(text('a‮b\u0000c'))))!);
    expect(result.content[0].content[0].text).toBe('abc');
  });

  test('drops unknown attributes', () => {
    const input = doc({ type: 'paragraph', attrs: { onclick: 'alert(1)' }, content: [text('x')] });
    const result = JSON.parse(parseNoteContent(input)!);
    expect(result.content[0].attrs).toBeUndefined();
  });

  test('rejects malformed input', () => {
    expect(parseNoteContent('not json')).toBeNull();
    expect(parseNoteContent(JSON.stringify({ type: 'paragraph' }))).toBeNull();
    expect(parseNoteContent(JSON.stringify({ type: 'doc' }))).toBeNull();
    expect(parseNoteContent(doc(text('text directly in doc')))).toBeNull();
  });

  test('rejects oversized documents', () => {
    const input = doc(...Array.from({ length: 6_000 }, () => paragraph(text('x'))));
    expect(parseNoteContent(input)).toBeNull();
  });
});
