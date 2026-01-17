'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import styles from './ServiceCard.module.css';

// Service icons
const ServiceIcon = ({ type }) => {
    const icons = {
        document: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        menu: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="8" cy="6" r="1" fill="currentColor" />
                <circle cx="8" cy="12" r="1" fill="currentColor" />
                <circle cx="8" cy="18" r="1" fill="currentColor" />
            </svg>
        ),
        qr: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                <path d="M14 18h3M18 14v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        invoice: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        logo: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        card: (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M6 15h.01M10 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    };

    return icons[type] || icons.document;
};

export default function ServiceCard({ service, showStatus = false, customPriceLabel = null }) {
    const { user } = useAuth();
    const { getSubscriptionStatus } = useSubscription();

    const status = showStatus && user ? getSubscriptionStatus(service.slug) : null;

    const colorClasses = {
        primary: styles.colorPrimary,
        accent: styles.colorAccent,
        success: styles.colorSuccess,
        info: styles.colorInfo,
        warning: styles.colorWarning,
    };

    const statusLabels = {
        active: { text: 'Active', class: styles.statusActive },
        expired: { text: 'Expired', class: styles.statusExpired },
        pending: { text: 'Pending', class: styles.statusPending },
        inactive: { text: 'Inactive', class: styles.statusInactive },
        none: { text: 'Not Subscribed', class: styles.statusNone },
    };

    const cardLink = user ? `/services/${service.slug}` : `/login?redirect=/services/${service.slug}`;

    return (
        <Link href={cardLink} className={`${styles.card} ${colorClasses[service.color] || colorClasses.primary}`}>
            {/* Icon display instead of image */}
            <div className={styles.iconContainer}>
                <div className={styles.iconCircle}>
                    <ServiceIcon type={service.icon} />
                </div>
                {customPriceLabel ? (
                    <span className={styles.priceBadge}>{customPriceLabel}</span>
                ) : service.isFree ? (
                    <span className={styles.freeBadge}>Free</span>
                ) : service.priceLabel ? (
                    <span className={styles.priceBadge}>{service.priceLabel}</span>
                ) : null}
            </div>

            <div className={styles.content}>
                <span className={styles.category}>{service.category || 'Tool'}</span>
                <h3 className={styles.title}>{service.name}</h3>
                <p className={styles.description}>{service.description}</p>

                <div className={styles.cta}>
                    See More
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
