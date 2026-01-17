'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink, formatCurrency } from '@/lib/utils/helpers';
import { sendPaymentRequest } from '@/lib/utils/whatsapp';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, use } from 'react';
import styles from './service.module.css';

export default function ServicePage({ params }) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;
    const { user } = useAuth();
    const { hasAccess, getAccessStatus, loading } = useSubscription();
    const { services, loading: servicesLoading } = useServices();

    const service = services.find(s => s.slug === slug);

    // Show loading while services are being fetched
    if (servicesLoading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                </div>
            </div>
        );
    }

    if (!service) {
        notFound();
    }

    const accessStatus = user ? getAccessStatus(slug) : null;
    const canAccess = accessStatus?.hasAccess || false;

    const getServiceIcon = (iconType) => {
        const icons = {
            document: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            menu: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            qr: (
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                    <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            invoice: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            logo: (
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            card: (
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
        };
        return icons[iconType] || icons.document;
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        sendPaymentRequest({
            serviceName: service.name,
            userName: user?.email?.split('@')[0] || 'Guest', // Fallback name
            userEmail: user?.email || 'Not provided',
            amount: service.price_yearly || service.price_monthly,
            currency: 'IQD'
        }, APP_CONFIG.whatsapp.number);
    };

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <Link href="/#services" className={styles.backLink}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Back to Services
                    </Link>

                    <div className={`${styles.serviceIcon} ${styles[`icon_${service.color}`]}`}>
                        {getServiceIcon(service.icon)}
                    </div>

                    <h1 className={styles.title}>{service.name}</h1>
                    <p className={styles.description}>{service.description}</p>

                    {/* Pricing or Free Badge */}
                    {service.isFree ? (
                        <div className={styles.freeBadge}>
                            <span className={styles.freeIcon}>🎉</span>
                            <span className={styles.freeText}>FREE Forever</span>
                        </div>
                    ) : service.price_monthly ? (
                        <div className={styles.pricing}>
                            <div className={styles.priceTag}>
                                <span className={styles.priceAmount}>{formatCurrency(service.price_monthly)}</span>
                                <span className={styles.pricePeriod}>/ month</span>
                            </div>
                            <span className={styles.orText}>or</span>
                            <div className={styles.priceTag}>
                                <span className={styles.priceAmount}>{formatCurrency(service.price_yearly)}</span>
                                <span className={styles.pricePeriod}>/ year</span>
                                <span className={styles.discount}>Save {APP_CONFIG.pricing.yearlyDiscount}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.pricing}>
                            <div className={styles.priceTag}>
                                <span className={styles.priceAmount}>{formatCurrency(service.price_yearly)}</span>
                                <span className={styles.pricePeriod}>/ year</span>
                            </div>
                        </div>
                    )}

                    {/* Access Status & Actions */}
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                        </div>
                    ) : user ? (
                        <div className={styles.accessSection}>
                            {/* Show access status badge */}
                            {accessStatus?.type === 'free' && (
                                <div className={styles.accessBadge + ' ' + styles.accessFree}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Free forever - No subscription needed
                                </div>
                            )}
                            {accessStatus?.type === 'subscription' && (
                                <div className={styles.accessBadge + ' ' + styles.accessSubscribed}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Active subscription
                                </div>
                            )}
                            {accessStatus?.type === 'trial' && (
                                <div className={styles.accessBadge + ' ' + styles.accessTrial}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    🎁 Trial: {accessStatus.message}
                                </div>
                            )}
                            {accessStatus?.type === 'expired' && (
                                <div className={styles.accessBadge + ' ' + styles.accessExpired}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Trial expired - Subscribe to continue
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className={styles.heroActions}>
                                {canAccess ? (
                                    <Link href={service.dashboardPath} className={styles.launchBtn}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Open {service.name}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className={styles.subscribeBtn}
                                    >
                                        🚀 Subscribe via WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.heroActions}>
                            <Link href={`/register?redirect=/services/${slug}`} className={styles.subscribeBtn}>
                                Get Started Free
                            </Link>
                            <p className={styles.trialNote}>
                                {service.isFree ? '✨ Always free, no credit card needed' : `🎁 Start with a ${APP_CONFIG.trial?.days || 2}-day free trial`}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <h2>What&apos;s Included</h2>
                    <div className={styles.featuresList}>
                        {service.features.map((feature, index) => (
                            <div key={index} className={styles.featureItem}>
                                <div className={styles.featureCheck}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Only for non-free services when user doesn't have access */}
            {!service.isFree && !canAccess && (
                <section className={styles.cta}>
                    <div className={styles.container}>
                        <h2>Ready to get started?</h2>
                        <p>Join thousands of professionals using {service.name}</p>
                        <div className={styles.heroActions}>
                            <a
                                href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.ctaBtn}
                            >
                                Subscribe via WhatsApp
                            </a>
                            {!user && (
                                <Link href={`/register?redirect=/services/${slug}`} className={styles.ctaBtn}>
                                    Create Free Account
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
