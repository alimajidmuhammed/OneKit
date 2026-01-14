'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import styles from '../login/auth.module.css';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Check if user arrived via valid reset link
    useEffect(() => {
        const handlePasswordRecovery = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);

                // Check for error in URL (Supabase sends error when link expires)
                const urlError = urlParams.get('error');
                const errorDescription = urlParams.get('error_description');

                if (urlError === 'access_denied') {
                    setError(errorDescription?.replace(/%20/g, ' ') || 'Reset link has expired. Please request a new one.');
                    setCheckingSession(false);
                    // Clear URL params
                    window.history.replaceState(null, '', window.location.pathname);
                    return;
                }

                // Method 1: Check for PKCE code in URL query params
                const code = urlParams.get('code');


                if (code) {
                    // Exchange the code for a session (PKCE flow)
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        console.error('Code exchange error:', error);
                        setError('Invalid or expired reset link. Please request a new password reset.');
                        setCheckingSession(false);
                        return;
                    }

                    if (data.session) {
                        setIsValidSession(true);
                        // Clear the code from URL for security
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                    setCheckingSession(false);
                    return;
                }

                // Method 2: Check URL hash for legacy token flow
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (type === 'recovery' && accessToken) {
                    const { data, error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (error) {
                        console.error('Session error:', error);
                        setError('Invalid or expired reset link. Please request a new password reset.');
                        setCheckingSession(false);
                        return;
                    }

                    if (data.session) {
                        setIsValidSession(true);
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                    setCheckingSession(false);
                    return;
                }

                // Method 3: Check if we already have a session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setIsValidSession(true);
                } else {
                    setError('Invalid or expired reset link. Please request a new password reset.');
                }
            } catch (err) {
                console.error('Recovery check error:', err);
                setError('Unable to verify reset link. Please try again.');
            } finally {
                setCheckingSession(false);
            }
        };

        handlePasswordRecovery();
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
                setError(error.message || 'Failed to reset password. Please try again.');
                setLoading(false);
                return;
            }

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    // Show loading while checking session
    if (checkingSession) {
        return (
            <div className={styles.authCard}>
                <div className={styles.spinner} style={{ margin: '40px auto' }} />
                <p className={styles.authSubtitle} style={{ textAlign: 'center' }}>
                    Verifying reset link...
                </p>
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

            {isValidSession ? (
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
            ) : (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/forgot-password" className={styles.authSubmit} style={{ display: 'inline-block', textDecoration: 'none' }}>
                        Request New Reset Link
                    </Link>
                </div>
            )}

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
