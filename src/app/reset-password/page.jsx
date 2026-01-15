'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import styles from '../(auth)/login/auth.module.css';

// Version for debugging - confirms Vercel deployed latest code
const PAGE_VERSION = 'v2.0.0';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [tokens, setTokens] = useState(null);
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Setup: exchange code for tokens
    useEffect(() => {
        const init = async () => {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                const errorParam = url.searchParams.get('error');

                // Clear URL
                window.history.replaceState({}, '', '/reset-password');

                if (errorParam) {
                    const desc = url.searchParams.get('error_description');
                    setError(decodeURIComponent(desc || 'Reset link expired.'));
                    setReady(true);
                    return;
                }

                if (code) {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        setError('Reset link expired. Please request a new one.');
                        setReady(true);
                        return;
                    }

                    if (data?.session) {
                        setTokens({
                            accessToken: data.session.access_token,
                            refreshToken: data.session.refresh_token
                        });
                    }
                } else {
                    // Check for existing session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        setTokens({
                            accessToken: session.access_token,
                            refreshToken: session.refresh_token
                        });
                    } else {
                        setError('No session found. Please request a new reset link.');
                    }
                }

                setReady(true);
            } catch (err) {
                console.error('Init error:', err);
                setError('Setup failed. Please try again.');
                setReady(true);
            }
        };

        init();
    }, [supabase.auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!tokens?.accessToken) {
            setError('Session expired. Please request a new reset link.');
            return;
        }

        setLoading(true);

        try {
            // Call server-side API for password reset
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    newPassword: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to reset password.');
                setLoading(false);
                return;
            }

            // Success!
            setSuccess(true);
            await supabase.auth.signOut().catch(() => { });
            setTimeout(() => router.push('/login'), 2500);

        } catch (err) {
            console.error('Submit error:', err);
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    // Loading
    if (!ready) {
        return (
            <div className={styles.authCard}>
                <div className={styles.spinner} style={{ margin: '40px auto' }} />
                <p className={styles.authSubtitle} style={{ textAlign: 'center', fontSize: '10px', opacity: 0.5 }}>
                    {PAGE_VERSION}
                </p>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className={styles.authCard}>
                <Link href="/" className={styles.authLogo}>
                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                            <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                        </svg>
                    </div>
                    <span>OneKit</span>
                </Link>
                <div className={styles.authSuccess}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Password reset successfully!
                </div>
                <p className={styles.authSubtitle} style={{ textAlign: 'center', marginTop: '16px' }}>
                    Redirecting to login...
                </p>
            </div>
        );
    }

    // Form
    return (
        <div className={styles.authCard}>
            <Link href="/" className={styles.authLogo}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>
                <span>OneKit</span>
            </Link>

            <h1 className={styles.authTitle}>Reset Password</h1>
            <p className={styles.authSubtitle}>Enter your new password</p>

            {error && (
                <div className={styles.authError}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.formLabel}>New Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        disabled={!tokens}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.formInput}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        disabled={!tokens}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.authSubmit}
                    disabled={loading || !tokens}
                >
                    {loading ? (
                        <><span className={styles.spinner} /> Resetting...</>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>

            <p className={styles.authSwitch}>
                <Link href="/forgot-password">Request new reset link</Link>
                {' • '}
                <Link href="/login">Sign in</Link>
            </p>

            <p style={{ textAlign: 'center', fontSize: '10px', opacity: 0.3, marginTop: '16px' }}>
                {PAGE_VERSION}
            </p>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className={styles.authPage}>
            <div className={styles.authBackground}>
                <div className={styles.authGradient} />
            </div>
            <div className={styles.authContainer}>
                <Suspense fallback={<div className={styles.authCard}><div className={styles.spinner} style={{ margin: '40px auto' }} /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
