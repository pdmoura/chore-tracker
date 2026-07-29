process.env.DATABASE_URL ??=
  'postgresql://chore_tracker:chore_tracker@localhost:5432/chore_tracker?schema=public';
process.env.JWT_SECRET ??= 'test-secret-with-at-least-thirty-two-characters';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
process.env.PORT ??= '3000';
