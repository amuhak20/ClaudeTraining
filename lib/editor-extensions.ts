import type { Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

/**
 * Single source of truth for what a note may contain (SPEC §1.1). Shared by the editor
 * and by server-side validation, so stored content can never use nodes or marks the
 * editor can't produce. Links are disabled on purpose: no URLs means no `javascript:` risk.
 */
export const editorExtensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
    strike: false,
    blockquote: false,
    orderedList: false,
  }),
];

export const EMPTY_DOC = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
