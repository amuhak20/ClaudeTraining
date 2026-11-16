import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import type { ReactNode } from 'react';
import { noteContentClasses } from '@/components/editor-styles';
import { editorExtensions } from '@/lib/editor-extensions';

// Kept outside the component so a failure falls back to a message instead of an error page.
function renderContent(contentJson: string): ReactNode | null {
  try {
    return renderToReactElement({ extensions: editorExtensions, content: JSON.parse(contentJson) });
  } catch (error) {
    console.error('Rendering note content failed:', error);
    return null;
  }
}

/** Read-only note content, rendered from the stored TipTap JSON (never raw HTML). */
export function NoteViewer({ contentJson }: { contentJson: string }) {
  const content = renderContent(contentJson);

  if (content === null) {
    return (
      <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
        This note&apos;s content couldn&apos;t be displayed.
      </p>
    );
  }

  return <div className={`${noteContentClasses} text-sm leading-relaxed`}>{content}</div>;
}
