'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { PublicLink } from '@/components/PublicLink';
import { RichTextEditor } from '@/components/RichTextEditor';
import type { NoteFormState } from '@/lib/note-input';
import { TITLE_MAX } from '@/lib/validation';

type NoteFormProps = {
  action: (prev: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  submitLabel: string;
  pendingLabel: string;
  cancelHref?: string;
  /** Present when editing an existing note. */
  note?: {
    id: string;
    title: string;
    contentJson: string;
    isPublic: boolean;
    publicSlug: string | null;
  };
};

const INITIAL_STATE: NoteFormState = {};

const inputClass =
  'rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900';

export function NoteForm({ action, submitLabel, pendingLabel, cancelHref, note }: NoteFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const titleError = state.errors?.title?.[0];
  const contentError = state.errors?.contentJson?.[0];

  return (
    <form action={formAction} className='flex flex-col gap-6' noValidate>
      {note && <input type='hidden' name='id' value={note.id} />}

      <div className='flex flex-col gap-1'>
        <label htmlFor='title' className='text-sm font-medium'>
          Title
        </label>
        <input
          id='title'
          name='title'
          type='text'
          maxLength={TITLE_MAX}
          required
          defaultValue={state.values?.title ?? note?.title}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? 'title-error' : undefined}
          className={inputClass}
        />
        {titleError && (
          <p id='title-error' role='alert' className='text-sm text-red-600 dark:text-red-400'>
            {titleError}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <span id='content-label' className='text-sm font-medium'>
          Content
        </span>
        <RichTextEditor
          name='contentJson'
          labelledBy='content-label'
          initialContentJson={note?.contentJson}
        />
        {contentError && (
          <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
            {contentError}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <label className='flex items-center gap-2 text-sm font-medium'>
          <input
            type='checkbox'
            name='isPublic'
            defaultChecked={note?.isPublic ?? false}
            aria-describedby='share-hint'
          />
          Share publicly
        </label>
        <p id='share-hint' className='text-sm text-foreground/70'>
          Anyone with the link can view this note, read-only. Unchecking disables the link.
        </p>
        {note?.isPublic && note.publicSlug && <PublicLink slug={note.publicSlug} />}
      </div>

      {state.formError && (
        <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
          {state.formError}
        </p>
      )}

      <div className='flex justify-end gap-2'>
        {cancelHref && (
          <Link
            href={cancelHref}
            className='rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/10'
          >
            Cancel
          </Link>
        )}
        <button
          type='submit'
          disabled={pending}
          className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300'
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
