'use client';

import { useEditorState, type Editor } from '@tiptap/react';
import { Fragment, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';

type Tool = {
  label: string;
  glyph: string;
  /** Mod = Ctrl (Win/Linux) or Cmd (macOS). */
  shortcut?: string;
  group: number;
  kind: 'toggle' | 'action';
  isActive?: (editor: Editor) => boolean;
  canRun: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const heading = (level: 1 | 2 | 3): Tool => ({
  label: `Heading ${level}`,
  glyph: `H${level}`,
  shortcut: `Mod+Alt+${level}`,
  group: 0,
  kind: 'toggle',
  isActive: (e) => e.isActive('heading', { level }),
  canRun: (e) => e.can().toggleHeading({ level }),
  run: (e) => e.chain().focus().toggleHeading({ level }).run(),
});

// Order matters: flat index drives the bitmask state and keyboard navigation.
const TOOLS: Tool[] = [
  {
    label: 'Paragraph',
    glyph: '¶',
    shortcut: 'Mod+Alt+0',
    group: 0,
    kind: 'action',
    canRun: (e) => e.can().setParagraph(),
    run: (e) => e.chain().focus().setParagraph().run(),
  },
  heading(1),
  heading(2),
  heading(3),
  {
    label: 'Bold',
    glyph: 'B',
    shortcut: 'Mod+B',
    group: 1,
    kind: 'toggle',
    isActive: (e) => e.isActive('bold'),
    canRun: (e) => e.can().toggleBold(),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: 'Italic',
    glyph: 'I',
    shortcut: 'Mod+I',
    group: 1,
    kind: 'toggle',
    isActive: (e) => e.isActive('italic'),
    canRun: (e) => e.can().toggleItalic(),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: 'Inline code',
    glyph: '</>',
    shortcut: 'Mod+E',
    group: 1,
    kind: 'toggle',
    isActive: (e) => e.isActive('code'),
    canRun: (e) => e.can().toggleCode(),
    run: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    label: 'Bullet list',
    glyph: '•',
    shortcut: 'Mod+Shift+8',
    group: 2,
    kind: 'toggle',
    isActive: (e) => e.isActive('bulletList'),
    canRun: (e) => e.can().toggleBulletList(),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: 'Code block',
    glyph: '{ }',
    shortcut: 'Mod+Alt+C',
    group: 2,
    kind: 'toggle',
    isActive: (e) => e.isActive('codeBlock'),
    canRun: (e) => e.can().toggleCodeBlock(),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: 'Horizontal rule',
    glyph: '—',
    group: 2,
    kind: 'action',
    canRun: (e) => e.can().setHorizontalRule(),
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

/** Packs (active, enabled) per tool into one number so the selector stays referentially stable. */
function readToolState(editor: Editor | null): number {
  if (!editor) return 0;
  return TOOLS.reduce((bits, tool, i) => {
    if (tool.isActive?.(editor)) bits |= 1 << (2 * i);
    if (tool.canRun(editor)) bits |= 1 << (2 * i + 1);
    return bits;
  }, 0);
}

const noopSubscribe = () => () => {};
const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);

function formatShortcut(shortcut: string, isMac: boolean): string {
  const parts = shortcut.split('+').map((key) => {
    if (key === 'Mod') return isMac ? '⌘' : 'Ctrl';
    if (key === 'Alt') return isMac ? '⌥' : 'Alt';
    if (key === 'Shift') return isMac ? '⇧' : 'Shift';
    return key;
  });
  return parts.join(isMac ? '' : '+');
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  // Server snapshot is `false`, so SSR and hydration markup match; the real platform applies after mount.
  const isMac = useSyncExternalStore(noopSubscribe, isMacPlatform, () => false);
  const state = useEditorState({ editor, selector: ({ editor }) => readToolState(editor) }) ?? 0;
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isActive = (i: number) => Boolean(state & (1 << (2 * i)));
  const canRun = (i: number) => Boolean(state & (1 << (2 * i + 1)));

  const firstEnabled = TOOLS.findIndex((_, i) => canRun(i));
  const tabStop = canRun(focusIndex) ? focusIndex : firstEnabled;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = TOOLS.map((_, i) => i).filter(canRun);
    if (enabled.length === 0) return;

    const pos = enabled.indexOf(focusIndex);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = enabled[(pos + 1) % enabled.length];
        break;
      case 'ArrowLeft':
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    setFocusIndex(next);
    buttonRefs.current[next]?.focus();
  }

  return (
    <div
      role='toolbar'
      aria-label='Formatting'
      onKeyDown={handleKeyDown}
      className='sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-foreground/10 bg-background p-2'
    >
      {TOOLS.map((tool, i) => {
        const pressed = tool.kind === 'toggle' ? isActive(i) : undefined;
        const title = tool.shortcut
          ? `${tool.label} (${formatShortcut(tool.shortcut, isMac)})`
          : tool.label;

        return (
          <Fragment key={tool.label}>
            {i > 0 && TOOLS[i - 1].group !== tool.group && (
              <div
                role='separator'
                aria-orientation='vertical'
                className='mx-1 h-5 w-px bg-foreground/15'
              />
            )}
            <button
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type='button'
              tabIndex={i === tabStop ? 0 : -1}
              disabled={!canRun(i)}
              aria-pressed={pressed}
              aria-label={tool.label}
              title={title}
              // Keep the editor's selection when a toolbar button is clicked.
              onMouseDown={(event) => event.preventDefault()}
              onFocus={() => setFocusIndex(i)}
              onClick={() => {
                if (editor) tool.run(editor);
              }}
              className='min-w-8 rounded-md border border-foreground/15 px-2 py-1 text-sm font-medium hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background'
            >
              {tool.glyph}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
