// Sentry Client Configuration for Smol Café

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

export const sentryClientOptions = {
  dsn: SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  debug: false,
  environment: process.env.NODE_ENV || "development",
  enabled: Boolean(SENTRY_DSN),
};
