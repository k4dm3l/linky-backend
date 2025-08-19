export interface RateLimitSettings {
  global: {
    windowMs: number;
    max: number;
    message: string;
  };
  strict: {
    windowMs: number;
    max: number;
    message: string;
  };
  auth: {
    windowMs: number;
    max: number;
    message: string;
  };
}

// Helper function to safely parse environment variables
function parseEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = Number.parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const rateLimitSettings: RateLimitSettings = {
  global: {
    windowMs: parseEnvInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
    max: parseEnvInt("RATE_LIMIT_MAX_REQUESTS", 100), // 100 requests per window
    message:
      process.env.RATE_LIMIT_MESSAGE ||
      "Too many requests from this IP, please try again later.",
  },
  strict: {
    windowMs: parseEnvInt("RATE_LIMIT_STRICT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
    max: parseEnvInt("RATE_LIMIT_STRICT_MAX_REQUESTS", 5), // 5 requests per window
    message:
      process.env.RATE_LIMIT_STRICT_MESSAGE ||
      "Too many requests from this IP, please try again later.",
  },
  auth: {
    windowMs: parseEnvInt("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
    max: parseEnvInt("RATE_LIMIT_AUTH_MAX_REQUESTS", 10), // 10 requests per window
    message:
      process.env.RATE_LIMIT_AUTH_MESSAGE ||
      "Too many authentication attempts, please try again later.",
  },
};
