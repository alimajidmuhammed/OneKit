'use client';

import { useServices } from '@/lib/hooks/useServices';
import ServiceCard from '@/components/services/ServiceCard';
import styles from '@/app/page.module.css';

export default function ServicesSection() {
    const { services, loading } = useServices();

    if (loading) {
        return (
            <section id="services" className={styles.services}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>Our Services</span>
                        <h2 className={styles.sectionTitle}>
                            Everything You Need in One Place
                        </h2>
                        <p className={styles.sectionDescription}>
                            Choose from our collection of professional tools designed to help you create amazing things.
                        </p>
                    </div>
                    <div className={styles.servicesGrid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.serviceCardWrapper} style={{ opacity: 0.5 }}>
                                <div style={{ height: 200, background: '#f0f0f0', borderRadius: 12 }} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="services" className={styles.services}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionLabel}>Our Services</span>
                    <h2 className={styles.sectionTitle}>
                        Everything You Need in One Place
                    </h2>
                    <p className={styles.sectionDescription}>
                        Choose from our collection of professional tools designed to help you create amazing things.
                    </p>
                </div>

                <div className={styles.servicesGrid}>
                    {services.map((service, index) => (
                        <div
                            key={service.id || service.slug}
                            className={styles.serviceCardWrapper}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <ServiceCard service={service} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
