/** Reads a form field as a string; non-string entries (e.g. a File) become "". */
export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}
