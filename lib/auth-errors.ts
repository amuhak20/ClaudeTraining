import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from '@/lib/validation';

export const NETWORK_ERROR = "We couldn't reach the server. Check your connection and try again.";
const GENERIC_ERROR = 'Something went wrong. Please try again.';
const EXISTING_ACCOUNT =
  "We couldn't create an account with those details. Try signing in, or use a different email.";

// Our own fixed wording per better-auth error code. Server-provided messages are never shown.
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Incorrect email or password.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_NAME: `Please enter a valid name (up to ${NAME_MAX} characters).`,
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN} characters.`,
  PASSWORD_TOO_LONG: `Password must be ${PASSWORD_MAX} characters or fewer.`,
  // Deliberately vague so we don't confirm which emails are registered.
  USER_ALREADY_EXISTS: EXISTING_ACCOUNT,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: EXISTING_ACCOUNT,
};

export function authErrorMessage(error: { status?: number; code?: string }): string {
  if (error.code && Object.hasOwn(MESSAGES, error.code)) return MESSAGES[error.code];
  if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  return GENERIC_ERROR;
}
