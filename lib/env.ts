import { resolve } from 'node:path';
import { z } from 'zod';

const schema = z.object({
  DB_PATH: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

function loadEnv() {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    // Names only: never echo values (they may be secrets).
    const names = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    throw new Error(
      `Missing or invalid environment variables: ${names.join(', ')}. See .env.example.`,
    );
  }

  return {
    ...parsed.data,
    // Resolve once so the DB location never depends on the process's working directory.
    DB_PATH: resolve(process.cwd(), parsed.data.DB_PATH),
  };
}

export const env = loadEnv();
