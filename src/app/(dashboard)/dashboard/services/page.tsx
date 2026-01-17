'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import Link from 'next/link';
import ServiceCard from '@/components/services/ServiceCard';
import styles from './services.module.css';

export default function ServicesPage() {
    const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
    const { services, loading: servicesLoading } = useServices();
    const loading = subscriptionLoading || servicesLoading;


    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>My Services</h1>
                    <p>Access your subscribed services or explore new ones</p>
                </div>
            </div>

            {/* Active Services */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Your Active Services
                </h2>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : (
                    <div className={styles.servicesGrid}>
                        {services.filter(service => hasActiveSubscription(service.slug)).length > 0 ? (
                            services.filter(service => hasActiveSubscription(service.slug)).map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    showStatus={true}
                                    customPriceLabel="(Your Active Service)"
                                />
                            ))
                        ) : (
                            <div className={styles.noActive}>
                                <div className={styles.noActiveIcon}>✨</div>
                                <h3>No active services yet</h3>
                                <p>Explore our premium tools and start creating today.</p>
                                <Link href="/#services" className={styles.browseBtn}>Browse All Services</Link>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* All Services */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    All Services
                </h2>

                <div className={styles.servicesGrid}>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            showStatus={true}
                            customPriceLabel={hasActiveSubscription(service.slug) ? "(Your Active Service)" : null}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
