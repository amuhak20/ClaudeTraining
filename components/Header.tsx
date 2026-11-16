import Link from 'next/link';
import { signOutAction } from '@/lib/auth-actions';

type HeaderProps = {
  user: { name: string } | null;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className='border-b border-foreground/10 bg-background text-foreground'>
      <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3'>
        <Link href='/dashboard' className='text-lg font-semibold tracking-tight'>
          NextNotes
        </Link>

        {user && (
          <div className='flex items-center gap-3'>
            <span className='hidden text-sm text-foreground/70 sm:inline'>{user.name}</span>
            <form action={signOutAction}>
              <button
                type='submit'
                className='rounded-md px-3 py-1.5 text-sm font-medium hover:bg-foreground/10'
              >
                Log out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
