// Safe defaults so importing lib/env never throws and never points at the real database.
process.env.DB_PATH ??= 'data/test.db';
process.env.BETTER_AUTH_SECRET ??= 'x'.repeat(32);
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
