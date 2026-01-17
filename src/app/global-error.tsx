'use client';

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                    <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>😔</h1>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: '#94a3b8', marginBottom: '24px', textAlign: 'center' }}>
                        We've been notified and are working on a fix.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
