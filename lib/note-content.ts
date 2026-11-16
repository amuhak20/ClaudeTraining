import { getSchema } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { editorExtensions } from '@/lib/editor-extensions';
import { sanitizeMultiline } from '@/lib/validation';

const MAX_CONTENT_CHARS = 100_000;
const MAX_NODES = 5_000;
const HEADING_LEVELS = [1, 2, 3];
const CODE_LANGUAGE = /^[a-z0-9+#-]{1,30}$/;

const schema = getSchema(editorExtensions);

type JsonNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
  marks?: unknown[];
};

function cleanNode(node: JsonNode, budget: { left: number }): JsonNode | null {
  if (--budget.left < 0) throw new Error('too many nodes');

  if (node.type === 'text') {
    const text = sanitizeMultiline(node.text ?? '');
    return text ? { ...node, text } : null; // empty text nodes are not allowed
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level;
    if (typeof level !== 'number' || !HEADING_LEVELS.includes(level))
      throw new Error('bad heading');
  }

  let attrs = node.attrs;
  if (node.type === 'codeBlock') {
    const language = node.attrs?.language;
    if (typeof language !== 'string' || !CODE_LANGUAGE.test(language)) {
      attrs = { ...node.attrs, language: null };
    }
  }

  const content = node.content
    ?.map((child) => cleanNode(child, budget))
    .filter((child): child is JsonNode => child !== null);

  return { ...node, ...(attrs ? { attrs } : {}), ...(content ? { content } : {}) };
}

/**
 * Validates and sanitizes untrusted TipTap JSON. Unknown nodes, marks and attributes are
 * rejected or dropped by the shared schema, text is cleaned, and the canonical
 * re-serialized JSON is returned. Returns null for anything invalid.
 */
export function parseNoteContent(raw: string): string | null {
  if (raw.length > MAX_CONTENT_CHARS) return null;

  try {
    const parsed = Node.fromJSON(schema, JSON.parse(raw));
    parsed.check();
    if (parsed.type.name !== 'doc') return null;

    const cleaned = cleanNode(parsed.toJSON() as JsonNode, { left: MAX_NODES });
    if (!cleaned) return null;

    const final = Node.fromJSON(schema, cleaned);
    final.check();
    return JSON.stringify(final.toJSON());
  } catch {
    return null;
  }
}
