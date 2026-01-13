'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import styles from './auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await resetPassword(email);

            if (error) {
                setError(error.message || 'Failed to send reset email. Please try again.');
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authBackground}>
                    <div className={styles.authGradient} />
                </div>

                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.successIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className={styles.authTitle}>Check your email</h1>
                        <p className={styles.authSubtitle}>
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>
                        <Link href="/login" className={styles.authSubmit}>
                            Return to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authBackground}>
                <div className={styles.authGradient} />
            </div>

            <div className={styles.authContainer}>
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

                    <h1 className={styles.authTitle}>Forgot password?</h1>
                    <p className={styles.authSubtitle}>
                        No worries, we'll send you reset instructions.
                    </p>

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
                            <label htmlFor="email" className={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.formInput}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
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
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <Link href="/login" className={styles.backLink}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
