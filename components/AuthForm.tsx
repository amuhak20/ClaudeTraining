'use client';

import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { authClient } from '@/lib/auth-client';
import { authErrorMessage, NETWORK_ERROR } from '@/lib/auth-errors';
import { getString } from '@/lib/form';
import { EMAIL_MAX, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN, nameSchema } from '@/lib/validation';

export type AuthMode = 'signin' | 'signup';

type AuthFormState = {
  error: string | null;
  values: { name: string; email: string };
};

const INITIAL_STATE: AuthFormState = { error: null, values: { name: '', email: '' } };

const inputClass =
  'rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900';

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignUp = mode === 'signup';

  async function submit(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = {
      name: getString(formData, 'name'),
      email: getString(formData, 'email').trim(),
    };
    const password = getString(formData, 'password'); // never echoed back
    const fail = (error: string): AuthFormState => ({ error, values });

    const name = isSignUp ? nameSchema.safeParse(values.name) : null;
    if (name && !name.success) return fail(name.error.issues[0].message);
    if (!values.email || values.email.length > EMAIL_MAX) {
      return fail('Please enter a valid email address.');
    }
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return fail(`Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`);
    }

    try {
      const result = name
        ? await authClient.signUp.email({ name: name.data, email: values.email, password })
        : await authClient.signIn.email({ email: values.email, password });
      if (result.error) return fail(authErrorMessage(result.error));
    } catch {
      return fail(NETWORK_ERROR);
    }

    router.push('/dashboard');
    router.refresh();
    return { error: null, values };
  }

  const [state, formAction, pending] = useActionState(submit, INITIAL_STATE);

  return (
    <form action={formAction} className='flex flex-col gap-4' noValidate>
      {isSignUp && (
        <div className='flex flex-col gap-1'>
          <label htmlFor='name' className='text-sm font-medium'>
            Name
          </label>
          <input
            id='name'
            name='name'
            type='text'
            autoComplete='name'
            maxLength={NAME_MAX}
            required
            defaultValue={state.values.name}
            className={inputClass}
          />
        </div>
      )}

      <div className='flex flex-col gap-1'>
        <label htmlFor='email' className='text-sm font-medium'>
          Email
        </label>
        <input
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          maxLength={EMAIL_MAX}
          required
          defaultValue={state.values.email}
          className={inputClass}
        />
      </div>

      <div className='flex flex-col gap-1'>
        <label htmlFor='password' className='text-sm font-medium'>
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          minLength={PASSWORD_MIN}
          maxLength={PASSWORD_MAX}
          required
          className={inputClass}
        />
      </div>

      {state.error && (
        <p role='alert' className='text-sm text-red-600 dark:text-red-400'>
          {state.error}
        </p>
      )}

      <button
        type='submit'
        disabled={pending}
        className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
      >
        {pending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
