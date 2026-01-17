'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { APP_CONFIG } from '@/lib/utils/constants';
import { formatDate, formatCurrency, getDaysRemaining, getWhatsAppLink } from '@/lib/utils/helpers';
import Link from 'next/link';
import styles from './subscriptions.module.css';

export default function SubscriptionsPage() {
    const { subscriptions, loading } = useSubscription();
    // Note: services is no longer needed since sub.service is already populated

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return styles.statusActive;
            case 'expired': return styles.statusExpired;
            case 'pending': return styles.statusPending;
            default: return styles.statusInactive;
        }
    };

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const expiredCount = subscriptions.filter(s => s.status === 'expired').length;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>My Subscriptions</h1>
                    <p>Manage your service subscriptions</p>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{activeCount}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconExpired}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{expiredCount}</span>
                        <span className={styles.statLabel}>Expired</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconTotal}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{subscriptions.length}</span>
                        <span className={styles.statLabel}>Total</span>
                    </div>
                </div>
            </div>

            {/* Subscriptions List */}
            <div className={styles.subscriptionsList}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <span>Loading subscriptions...</span>
                    </div>
                ) : subscriptions.length > 0 ? (
                    subscriptions.map((sub) => {
                        // Use the joined service object directly from sub.service
                        const service = sub.service;
                        const daysLeft = getDaysRemaining(sub.expires_at);
                        const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

                        return (
                            <div key={sub.id} className={styles.subscriptionCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.serviceInfo}>
                                        <div className={`${styles.serviceIcon} ${styles[`icon_${service?.color || 'primary'}`]}`}>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                                                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                                                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                                                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={styles.serviceName}>{service?.name || 'Unknown Service'}</h3>
                                            <span className={styles.planType}>{sub.plan_type} plan</span>
                                        </div>
                                    </div>
                                    <span className={`${styles.statusBadge} ${getStatusColor(sub.status)}`}>
                                        {sub.status}
                                    </span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Started</span>
                                        <span className={styles.detailValue}>{formatDate(sub.starts_at)}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>Expires</span>
                                        <span className={styles.detailValue}>
                                            {sub.expires_at ? formatDate(sub.expires_at) : 'Lifetime'}
                                        </span>
                                    </div>
                                    {daysLeft !== null && sub.status === 'active' && (
                                        <div className={styles.detailRow}>
                                            <span className={styles.detailLabel}>Time Left</span>
                                            <span className={`${styles.detailValue} ${isExpiringSoon ? styles.expiringSoon : ''}`}>
                                                {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                                                {isExpiringSoon && ' ⚠️'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.cardFooter}>
                                    {sub.status === 'active' ? (
                                        <Link href={`/services/${service?.slug}`} className={styles.useBtn}>
                                            Use Service
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <a
                                            href={getWhatsAppLink(
                                                APP_CONFIG.whatsapp.number,
                                                `Hi! I want to renew my ${service?.name} subscription.`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.renewBtn}
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                            Renew via WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3>No subscriptions yet</h3>
                        <p>Subscribe to a service to get started</p>
                        <Link href="/#services" className={styles.browseBtn}>
                            Browse Services
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
