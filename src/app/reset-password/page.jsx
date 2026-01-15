'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import styles from '../(auth)/login/auth.module.css';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Exchange code for session with timeout
    useEffect(() => {
        let isMounted = true;
        let timeoutId;

        const initSession = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);

                // Check for error in URL first
                const urlError = urlParams.get('error');
                if (urlError === 'access_denied') {
                    if (isMounted) {
                        const desc = urlParams.get('error_description');
                        setError(decodeURIComponent(desc || 'Reset link has expired.'));
                        setReady(true);
                    }
                    window.history.replaceState(null, '', window.location.pathname);
                    return;
                }

                // Exchange PKCE code for session with 5 second timeout
                const code = urlParams.get('code');
                if (code) {
                    window.history.replaceState(null, '', window.location.pathname);

                    // Race between exchange and timeout
                    const timeoutPromise = new Promise((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error('timeout')), 5000);
                    });

                    try {
                        const result = await Promise.race([
                            supabase.auth.exchangeCodeForSession(code),
                            timeoutPromise
                        ]);

                        clearTimeout(timeoutId);

                        if (result?.error) {
                            if (isMounted) {
                                setError('Reset link has expired. Please request a new one.');
                            }
                        }
                    } catch (e) {
                        // Timeout or error - still show form, will check session on submit
                        clearTimeout(timeoutId);
                    }

                    if (isMounted) setReady(true);
                    return;
                }

                // No code in URL - check existing session
                const { data: { session } } = await supabase.auth.getSession();
                if (!session && isMounted) {
                    setError('No valid reset session. Please request a new reset link.');
                }
                if (isMounted) setReady(true);

            } catch (err) {
                console.error('Session init error:', err);
                if (isMounted) {
                    setReady(true); // Show form anyway
                }
            }
        };

        initSession();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
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

        setLoading(true);

        try {
            // Double-check session exists
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Session expired. Please request a new reset link.');
                setLoading(false);
                return;
            }

            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
                setError(updateError.message || 'Failed to reset password.');
                setLoading(false);
                return;
            }

            // Success!
            setSuccess(true);

            // Sign out and redirect to login
            await supabase.auth.signOut();
            setTimeout(() => router.push('/login'), 2000);

        } catch (err) {
            console.error('Password update error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    // Show loading while setting up session
    if (!ready) {
        return (
            <div className={styles.authCard}>
                <div className={styles.spinner} style={{ margin: '40px auto' }} />
                <p className={styles.authSubtitle} style={{ textAlign: 'center' }}>
                    Setting up...
                </p>
            </div>
        );
    }

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
                    />
                </div>

                <button type="submit" className={styles.authSubmit} disabled={loading || !!error}>
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
