import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.content}>
                    {/* 404 Illustration */}
                    <div className={styles.illustration}>
                        <div className={styles.numbers}>
                            <span className={styles.four}>4</span>
                            <div className={styles.zero}>
                                <svg viewBox="0 0 100 100" fill="none">
                                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" strokeDasharray="10 5" />
                                    <circle cx="35" cy="40" r="5" fill="currentColor" />
                                    <circle cx="65" cy="40" r="5" fill="currentColor" />
                                    <path d="M35 65 Q50 55 65 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                                </svg>
                            </div>
                            <span className={styles.four}>4</span>
                        </div>
                    </div>

                    <h1 className={styles.title}>Page Not Found</h1>
                    <p className={styles.description}>
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className={styles.actions}>
                        <Link href="/" className={styles.primaryBtn}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            Go Home
                        </Link>
                        <Link href="/dashboard" className={styles.secondaryBtn}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.helpLinks}>
                        <p>Need help? Try these:</p>
                        <div className={styles.links}>
                            <Link href="/#services">Our Services</Link>
                            <Link href="/#pricing">Pricing</Link>
                            <Link href="/#contact">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
