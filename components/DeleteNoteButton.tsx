'use client';

import { useActionState, useId, useRef } from 'react';
import { deleteNoteAction, type DeleteNoteState } from '@/app/notes/[id]/actions';

const INITIAL_STATE: DeleteNoteState = {};

type DeleteNoteButtonProps = {
  noteId: string;
  title: string;
};

export function DeleteNoteButton({ noteId, title }: DeleteNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const [state, formAction, pending] = useActionState(deleteNoteAction, INITIAL_STATE);

  return (
    <>
      <button
        type='button'
        onClick={() => dialogRef.current?.showModal()}
        className='rounded-md border border-red-600/40 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400'
      >
        Delete
      </button>

      {/* Native modal dialog: focus trapping, Esc and the backdrop come from the browser. */}
      <dialog
        ref={dialogRef}
        closedby='any'
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        className='m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-foreground/20 bg-background p-6 text-foreground backdrop:bg-black/50'
      >
        <form action={formAction} className='flex flex-col gap-4'>
          <input type='hidden' name='id' value={noteId} />

          <h2 id={headingId} className='text-lg font-semibold'>
            Delete this note?
          </h2>
          <p id={descriptionId} className='break-words text-sm text-foreground/70'>
            &ldquo;{title}&rdquo; will be permanently deleted. This can&apos;t be undone.
          </p>

          {state.error && (
            <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
              {state.error}
            </p>
          )}

          <div className='flex justify-end gap-2'>
            {/* First in DOM order, so the browser focuses the safe choice by default. */}
            <button
              type='button'
              onClick={() => dialogRef.current?.close()}
              className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/10'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={pending}
              className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60'
            >
              {pending ? 'Deleting…' : 'Delete note'}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
