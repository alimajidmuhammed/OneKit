'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { formatDate, getDaysRemaining } from '@/lib/utils/helpers';
import Link from 'next/link';
import ServiceCard from '@/components/services/ServiceCard';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function DashboardPage() {
    const { profile, user } = useAuth();
    const { subscriptions, loading } = useSubscription();
    const { services } = useServices();
    const [userStats, setUserStats] = useState({
        cardsCreated: 0,
        menusCreated: 0,
        cvsCreated: 0
    });
    const supabase = getSupabaseClient();

    // Fetch user activity stats
    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                const [cardsRes, menusRes, cvsRes] = await Promise.all([
                    supabase.from('business_cards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('menus').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('cv_templates').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
                ]);

                setUserStats({
                    cardsCreated: cardsRes.count || 0,
                    menusCreated: menusRes.count || 0,
                    cvsCreated: cvsRes.count || 0
                });
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };

        fetchStats();
    }, [user]);

    // Recognized service slugs
    const recognizedSlugs = services.map(s => s.slug);

    const activeSubscriptions = subscriptions.filter(sub =>
        sub.status === 'active' && recognizedSlugs.includes(sub.service?.slug)
    );

    const expiringSoon = activeSubscriptions.filter(sub => {
        const days = getDaysRemaining(sub.expires_at);
        return days !== null && days > 0 && days <= 7;
    });

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.greeting}>
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className={styles.subtitle}>
                        Here's an overview of your OneKit services.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{activeSubscriptions.length}</span>
                        <span className={styles.statLabel}>Active Services</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{expiringSoon.length}</span>
                        <span className={styles.statLabel}>Expiring Soon</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{services.length}</span>
                        <span className={styles.statLabel}>Available Tools</span>
                    </div>
                </div>
            </div>

            {/* User Activity Insights */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Your Activity 📊</h2>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M2 10h20M6 15h.01M10 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{userStats.cardsCreated}</span>
                            <span className={styles.statLabel}>Business Cards Created</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{userStats.menusCreated}</span>
                            <span className={styles.statLabel}>Menus Created</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{userStats.cvsCreated}</span>
                            <span className={styles.statLabel}>CVs Created</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Your Services</h2>
                    <Link href="/dashboard/services" className={styles.viewAllLink}>
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : activeSubscriptions.length > 0 ? (
                    <div className={styles.servicesGrid}>
                        {activeSubscriptions.map((sub) => {
                            // Get service icon based on slug
                            const getServiceIcon = (slug) => {
                                const icons = {
                                    'menu-maker': (
                                        <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                            <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
                                    ),
                                    'qr-generator': (
                                        <><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                            <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" /></>
                                    ),
                                    'cv-maker': (
                                        <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
                                    ),
                                    'invoice-maker': (
                                        <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                                            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
                                    ),
                                    'card-maker': (
                                        <><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                            <path d="M2 10h20M6 15h.01M10 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
                                    ),
                                };
                                return icons[slug] || <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>;
                            };

                            return (
                                <Link
                                    key={sub.id}
                                    href={`/services/${sub.service?.slug}`}
                                    className={styles.serviceCard}
                                >
                                    <div className={styles.serviceIcon}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            {getServiceIcon(sub.service?.slug)}
                                        </svg>
                                    </div>
                                    <div className={styles.serviceInfo}>
                                        <h3>{sub.service?.name}</h3>
                                        <p className={styles.serviceExpiry}>
                                            {sub.expires_at ? (
                                                <>Expires {formatDate(sub.expires_at)}</>
                                            ) : (
                                                'Lifetime access'
                                            )}
                                        </p>
                                    </div>
                                    <svg className={styles.serviceArrow} viewBox="0 0 24 24" fill="none">
                                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <h3>No active services</h3>
                        <p>Subscribe to a service to get started with OneKit tools.</p>
                        <Link href="/#services" className={styles.exploreBtn}>
                            Explore Services
                        </Link>
                    </div>
                )}
            </section>

            {/* All Available Services */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Available Tools</h2>
                </div>

                <div className={styles.servicesGrid}>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            showStatus={true}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
