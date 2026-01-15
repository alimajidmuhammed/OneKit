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
    const [hasSession, setHasSession] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();
    const supabase = getSupabaseClient();

    useEffect(() => {
        let isMounted = true;

        // Listen for auth state changes - this fires when session is established
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, !!session);
            if (isMounted) {
                if (session) {
                    setHasSession(true);
                    setChecking(false);
                } else if (event === 'SIGNED_OUT') {
                    setHasSession(false);
                }
            }
        });

        // Handle the URL code/error
        const handleUrl = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));

            // Check for error in URL
            const urlError = urlParams.get('error') || hashParams.get('error');
            if (urlError === 'access_denied') {
                const desc = urlParams.get('error_description') || hashParams.get('error_description');
                if (isMounted) {
                    setError(decodeURIComponent(desc || 'Reset link has expired.'));
                    setChecking(false);
                }
                window.history.replaceState(null, '', window.location.pathname);
                return;
            }

            // If there's a code, Supabase will handle it automatically
            const code = urlParams.get('code');
            if (code) {
                // Clear URL immediately
                window.history.replaceState(null, '', window.location.pathname);

                // Try to exchange code
                try {
                    await supabase.auth.exchangeCodeForSession(code);
                } catch (e) {
                    // Supabase might handle this through onAuthStateChange
                    console.log('Code exchange:', e);
                }
            }

            // Fallback: check session after a short delay
            setTimeout(async () => {
                if (isMounted && !hasSession) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (isMounted) {
                        setHasSession(!!session);
                        if (!session) {
                            setError('Session not found. Please request a new reset link.');
                        }
                        setChecking(false);
                    }
                }
            }, 2000);
        };

        handleUrl();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase.auth, hasSession]);

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
            // Final session check
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Session expired. Please request a new reset link.');
                setLoading(false);
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
                setError(updateError.message || 'Failed to reset password.');
                setLoading(false);
                return;
            }

            setSuccess(true);
            await supabase.auth.signOut();
            setTimeout(() => router.push('/login'), 2000);

        } catch (err) {
            console.error('Update error:', err);
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className={styles.authCard}>
                <div className={styles.spinner} style={{ margin: '40px auto' }} />
                <p className={styles.authSubtitle} style={{ textAlign: 'center' }}>Please wait...</p>
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

            {!hasSession && !error && (
                <div className={styles.authError}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    No active session. Please request a new reset link.
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

                <button type="submit" className={styles.authSubmit} disabled={loading || !hasSession}>
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
