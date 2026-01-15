'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth/actions';
import styles from './auth.module.css';

function LoginForm() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    async function handleSubmit(formData) {
        setError('');
        setLoading(true);

        const result = await signIn(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // Success - navigate using client-side router
        if (result?.success) {
            router.push(result.redirect || '/dashboard');
        }
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

            <h1 className={styles.authTitle}>Welcome back</h1>
            <p className={styles.authSubtitle}>Sign in to your account to continue</p>

            {error && (
                <div className={styles.authError}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
            )}

            <form action={handleSubmit} className={styles.authForm}>
                <input type="hidden" name="redirect" value={redirect} />

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className={styles.formInput}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.formLabelRow}>
                        <label htmlFor="password" className={styles.formLabel}>Password</label>
                        <Link href="/forgot-password" className={styles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={styles.formInput}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                    />
                </div>

                <button type="submit" className={styles.authSubmit} disabled={loading}>
                    {loading ? (
                        <><span className={styles.spinner} /> Signing in...</>
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>

            <p className={styles.authSwitch}>
                Don't have an account?{' '}
                <Link href="/register">Create one</Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className={styles.authPage}>
            <div className={styles.authBackground}>
                <div className={styles.authGradient} />
            </div>
            <div className={styles.authContainer}>
                <Suspense fallback={<div className={styles.authCard}><div className={styles.spinner} style={{ margin: '40px auto' }} /></div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
