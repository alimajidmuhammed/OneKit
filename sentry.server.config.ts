// Sentry configuration for server-side (Node.js)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust tracing sample rate in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this to true will log Sentry events to console
    debug: false,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Only send errors in production or when DSN is configured
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
