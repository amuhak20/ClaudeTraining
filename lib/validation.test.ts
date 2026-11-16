import { describe, expect, test } from 'vitest';
import { sanitizeText, titleSchema } from '@/lib/validation';

describe('sanitizeText', () => {
  test('removes control and bidi/zero-width characters and collapses whitespace', () => {
    expect(sanitizeText('Hel\u0000lo‮ wor​ld\n\tok')).toBe('Hel lo world ok');
  });

  test('keeps ZWJ so emoji sequences survive', () => {
    expect(sanitizeText('👩‍💻')).toBe('👩‍💻');
  });

  test('normalizes to NFC', () => {
    expect(sanitizeText('é')).toBe('é');
  });
});

describe('titleSchema', () => {
  test('trims and accepts a normal title', () => {
    expect(titleSchema.parse('  My note  ')).toBe('My note');
  });

  test('rejects titles that are empty after sanitizing', () => {
    expect(titleSchema.safeParse(' ​\u0000 ').success).toBe(false);
  });

  test('enforces the 200 character limit', () => {
    expect(titleSchema.safeParse('a'.repeat(200)).success).toBe(true);
    expect(titleSchema.safeParse('a'.repeat(201)).success).toBe(false);
  });
});
