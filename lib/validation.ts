import { z } from 'zod';

export const TITLE_MAX = 200;
export const NAME_MAX = 100;
export const EMAIL_MAX = 254;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

// Zero-width and bidirectional-override characters are invisible and can spoof text.
// ZWJ/ZWNJ (U+200D/U+200C) are intentionally kept so emoji and some scripts still work.
const INVISIBLE_CHARS = /[​‎‏‪-‮⁦-⁩﻿]/gu;
const CONTROL_CHARS = /\p{Cc}/gu;

/** Single-line text: normalized, invisible/control characters removed, whitespace collapsed. */
export function sanitizeText(input: string): string {
  return input
    .normalize('NFC')
    .replace(INVISIBLE_CHARS, '')
    .replace(CONTROL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Multi-line text (e.g. code blocks): like sanitizeText but keeps newlines and tabs. */
export function sanitizeMultiline(input: string): string {
  return input
    .normalize('NFC')
    .replace(INVISIBLE_CHARS, '')
    .replace(CONTROL_CHARS, (char) => (char === '\n' || char === '\t' ? char : ''));
}

export const titleSchema = z
  .string()
  .transform(sanitizeText)
  .pipe(
    z
      .string()
      .min(1, 'Please enter a title.')
      .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer.`),
  );

export const nameSchema = z
  .string()
  .transform(sanitizeText)
  .pipe(
    z
      .string()
      .min(1, 'Please enter your name.')
      .max(NAME_MAX, `Name must be ${NAME_MAX} characters or fewer.`),
  );

export const noteIdSchema = z.uuid();
