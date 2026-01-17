import Link from 'next/link';
import styles from '../terms/legal.module.css';

export const metadata = {
    title: 'Privacy Policy | OneKit',
    description: 'OneKit Privacy Policy - How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
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
                    <h1>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last updated: January 2026</p>
                </div>

                <div className={styles.content}>
                    <section>
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us:</p>
                        <ul>
                            <li>Account information (name, email, phone number)</li>
                            <li>Payment information (for subscription processing)</li>
                            <li>Content you create using our tools</li>
                            <li>Communication with our support team</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul>
                            <li>Provide and maintain our services</li>
                            <li>Process payments and manage subscriptions</li>
                            <li>Send you updates and notifications</li>
                            <li>Improve our services</li>
                            <li>Respond to your requests and support needs</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Information Sharing</h2>
                        <p>We do not sell, trade, or rent your personal information to third parties. We may share information only:</p>
                        <ul>
                            <li>With your consent</li>
                            <li>To comply with legal obligations</li>
                            <li>To protect our rights and safety</li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information. Our platform uses Supabase for secure data storage with row-level security policies.</p>
                    </section>

                    <section>
                        <h2>5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Cookies</h2>
                        <p>We use essential cookies for authentication and session management. These cookies are necessary for the platform to function properly.</p>
                    </section>

                    <section>
                        <h2>7. Children's Privacy</h2>
                        <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children.</p>
                    </section>

                    <section>
                        <h2>8. Changes to This Policy</h2>
                        <p>We may update this privacy policy from time to time. We will notify you of any significant changes.</p>
                    </section>

                    <section>
                        <h2>9. Contact Us</h2>
                        <p>If you have questions about this privacy policy, please contact us via WhatsApp or through our contact page.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
