import { describe, expect, test } from 'vitest';
import { getString } from '@/lib/form';

describe('getString', () => {
  test('returns string values', () => {
    const fd = new FormData();
    fd.set('a', 'hello');
    expect(getString(fd, 'a')).toBe('hello');
  });

  test('returns "" for missing keys and File entries', () => {
    const fd = new FormData();
    fd.set('f', new File(['x'], 'x.txt'));
    expect(getString(fd, 'missing')).toBe('');
    expect(getString(fd, 'f')).toBe('');
  });
});
