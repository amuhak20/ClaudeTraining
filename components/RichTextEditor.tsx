'use client';

import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';
import { useMemo, useRef } from 'react';
import { EditorToolbar } from '@/components/EditorToolbar';
import { noteContentClasses } from '@/components/editor-styles';
import { EMPTY_DOC, editorExtensions } from '@/lib/editor-extensions';

type RichTextEditorProps = {
  /** Name of the hidden form field that carries the document JSON on submit. */
  name: string;
  /** id of the element that labels the editor (e.g. a visible heading). */
  labelledBy: string;
  /** Stored document (stringified TipTap JSON) to load when editing an existing note. */
  initialContentJson?: string;
};

function loadInitial(raw?: string): { content?: JSONContent; json: string } {
  if (raw) {
    try {
      return { content: JSON.parse(raw) as JSONContent, json: raw };
    } catch {
      // Unreadable stored content: fall back to an empty editor below.
    }
  }
  return { json: EMPTY_DOC };
}

export function RichTextEditor({ name, labelledBy, initialContentJson }: RichTextEditorProps) {
  const initial = useMemo(() => loadInitial(initialContentJson), [initialContentJson]);

  // The serialized document only matters at submit time and never affects rendering,
  // so it lives in a ref instead of state: typing doesn't re-render the form.
  const contentField = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initial.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelledBy,
        class: `${noteContentClasses} min-h-64 px-4 py-3 text-sm leading-relaxed text-foreground focus:outline-none`,
      },
    },
    onUpdate: ({ editor }) => {
      if (contentField.current) contentField.current.value = JSON.stringify(editor.getJSON());
    },
  });

  return (
    <div className='flex flex-col overflow-hidden rounded-md border border-foreground/20 bg-background focus-within:ring-2 focus-within:ring-foreground/40'>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <input ref={contentField} type='hidden' name={name} defaultValue={initial.json} />
    </div>
  );
}
