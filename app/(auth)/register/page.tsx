import { redirect } from 'next/navigation';

// Sign-up is handled by /login?mode=signup; keep this route as a redirect.
export default function RegisterPage() {
  redirect('/login?mode=signup');
}
