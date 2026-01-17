// Sentry configuration for client-side (browser)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust tracing sample rate in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Capture Replay for 10% of sessions, 100% on errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Setting this to true will log Sentry events to console
    debug: false,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Only send errors in production or when DSN is configured
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Ignore common errors that don't need tracking
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Network request failed',
        'Load failed',
        'ChunkLoadError',
    ],
});
