'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth/actions';
import styles from './auth.module.css';

function RegisterForm() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData) {
        setError('');
        setLoading(true);

        const result = await signUp(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result?.emailConfirmation) {
            setEmail(result.email);
            setSuccess(true);
        }
    }

    if (success) {
        return (
            <div className={styles.authCard}>
                <div className={styles.successIcon}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className={styles.authTitle}>Check your email</h1>
                <p className={styles.authSubtitle}>
                    We've sent a confirmation link to <strong>{email}</strong>.
                    Please click the link to verify your account.
                </p>
                <Link href="/login" className={styles.authSubmit}>
                    Return to login
                </Link>
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

            <h1 className={styles.authTitle}>Create an account</h1>
            <p className={styles.authSubtitle}>Get started with OneKit today</p>

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
                <div className={styles.formGroup}>
                    <label htmlFor="fullName" className={styles.formLabel}>Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className={styles.formInput}
                        placeholder="John Doe"
                        required
                        autoComplete="name"
                    />
                </div>

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
                    <label htmlFor="password" className={styles.formLabel}>Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className={styles.formInput}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoComplete="new-password"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={styles.formInput}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        autoComplete="new-password"
                    />
                </div>

                <button type="submit" className={styles.authSubmit} disabled={loading}>
                    {loading ? (
                        <><span className={styles.spinner} /> Creating account...</>
                    ) : (
                        'Create account'
                    )}
                </button>
            </form>

            <p className={styles.authSwitch}>
                Already have an account?{' '}
                <Link href="/login">Sign in</Link>
            </p>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className={styles.authPage}>
            <div className={styles.authBackground}>
                <div className={styles.authGradient} />
            </div>
            <div className={styles.authContainer}>
                <RegisterForm />
            </div>
        </div>
    );
}
