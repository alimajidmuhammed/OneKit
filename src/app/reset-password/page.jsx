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
    const [initializing, setInitializing] = useState(true);
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Initialize session from URL code (runs once on mount)
    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);

                // Check for error in URL (Supabase sends error when link expires)
                const urlError = urlParams.get('error');
                if (urlError === 'access_denied') {
                    const errorDescription = urlParams.get('error_description');
                    if (isMounted) {
                        setError(decodeURIComponent(errorDescription || 'Reset link has expired. Please request a new one.'));
                        setInitializing(false);
                    }
                    window.history.replaceState(null, '', window.location.pathname);
                    return;
                }

                // Exchange PKCE code for session
                const code = urlParams.get('code');
                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (isMounted && error) {
                        setError('Reset link has expired. Please request a new one.');
                    }
                    window.history.replaceState(null, '', window.location.pathname);
                }
            } catch (err) {
                // Silence abort errors during navigation
                if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
                    return;
                }
                console.error('Init error:', err);
            } finally {
                if (isMounted) {
                    setInitializing(false);
                }
            }
        };

        initSession();

        return () => {
            isMounted = false;
        };
    }, [supabase.auth]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                if (error.message.includes('session') || error.message.includes('logged in')) {
                    setError('Reset link has expired. Please request a new password reset.');
                } else {
                    setError(error.message || 'Failed to reset password. Please try again.');
                }
                setLoading(false);
                return;
            }

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    // Brief loading while exchanging code
    if (initializing) {
        return (
            <div className={styles.authCard}>
                <div className={styles.spinner} style={{ margin: '40px auto' }} />
            </div>
        );
    }

    // Show success message
    if (success) {
        return (
            <div className={styles.authCard}>
                <Link href="/" className={styles.authLogo}>
                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            {/* Logo */}
            <Link href="/" className={styles.authLogo}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                    </svg>
                </div>
                <span>OneKit</span>
            </Link>

            <h1 className={styles.authTitle}>Reset Password</h1>
            <p className={styles.authSubtitle}>Enter your new password below</p>

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

                <button
                    type="submit"
                    className={styles.authSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.spinner} />
                            Resetting...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>

            <p className={styles.authSwitch}>
                Remember your password?{' '}
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
                <Suspense fallback={<div className={styles.authCard}><div className={styles.spinner} /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
