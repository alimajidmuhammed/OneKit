import Link from 'next/link';
import styles from './legal.module.css';

export const metadata = {
    title: 'Terms of Service | OneKit',
    description: 'OneKit Terms of Service - Read our terms and conditions.',
};

export default function TermsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1>Terms of Service</h1>
                    <p className={styles.lastUpdated}>Last updated: January 2026</p>
                </div>

                <div className={styles.content}>
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using OneKit, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section>
                        <h2>2. Services</h2>
                        <p>OneKit provides a suite of professional tools including CV Maker, Menu Maker, QR Generator, Invoice Maker, Logo Maker, and Business Card Maker. Access to these services requires an active subscription.</p>
                    </section>

                    <section>
                        <h2>3. Subscriptions</h2>
                        <p>Subscriptions are provided on a per-service basis. Each subscription grants access to a specific tool for the duration of the subscription period (monthly or yearly).</p>
                        <ul>
                            <li>Subscriptions are non-transferable</li>
                            <li>Subscriptions do not auto-renew</li>
                            <li>Renewal requires manual payment</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Payments</h2>
                        <p>All payments are processed manually via WhatsApp. Users must provide proof of payment which will be reviewed and approved by our team.</p>
                        <ul>
                            <li>Payments are in Iraqi Dinar (IQD)</li>
                            <li>Monthly subscription: 15,000 IQD per service</li>
                            <li>Yearly subscription: 150,000 IQD per service</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. User Responsibilities</h2>
                        <p>Users are responsible for:</p>
                        <ul>
                            <li>Maintaining the confidentiality of their account</li>
                            <li>All activities that occur under their account</li>
                            <li>Ensuring all content created complies with applicable laws</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Intellectual Property</h2>
                        <p>Content created using OneKit tools belongs to the user. OneKit retains all rights to the platform, tools, and underlying technology.</p>
                    </section>

                    <section>
                        <h2>7. Limitation of Liability</h2>
                        <p>OneKit is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our services.</p>
                    </section>

                    <section>
                        <h2>8. Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes.</p>
                    </section>

                    <section>
                        <h2>9. Contact</h2>
                        <p>For questions about these Terms, please contact us via WhatsApp or through our contact page.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
