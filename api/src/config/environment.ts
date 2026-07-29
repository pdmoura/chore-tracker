const DEFAULT_CORS_ORIGINS = 'http://localhost:5173';
const DEFAULT_PORT = 3000;

function requiredString(config: Record<string, unknown>, name: string): string {
  const value = config[name];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} must be configured`);
  }

  return value;
}

export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = requiredString(config, 'DATABASE_URL');
  const jwtSecret = requiredString(config, 'JWT_SECRET');

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  const port = Number(config.PORT ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }

  const corsOrigins =
    typeof config.CORS_ORIGINS === 'string' && config.CORS_ORIGINS.trim()
      ? config.CORS_ORIGINS
      : DEFAULT_CORS_ORIGINS;

  return {
    ...config,
    CORS_ORIGINS: corsOrigins,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    PORT: port,
  };
}
