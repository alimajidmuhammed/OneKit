// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/helpers';
import styles from './page.module.css';

export default function AdminDashboard() {
    const { users, subscriptions, payments, loading, fetchUsers, fetchAllSubscriptions, fetchPendingPayments } = useAdmin();

    const stats = {
        totalUsers: users.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        pendingPayments: payments.length,
        totalRevenue: payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    const recentPayments = payments.slice(0, 5);
    const recentSubscriptions = subscriptions.slice(0, 5);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <p>Overview of your platform's performance</p>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconUsers}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.totalUsers}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconActive}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" />
                            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.activeSubscriptions}</span>
                        <span className={styles.statLabel}>Active Subscriptions</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.pendingPayments}</span>
                        <span className={styles.statLabel}>Pending Payments</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconRevenue}`}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 6v12M15 9.5a2.5 2.5 0 00-2.5-2.5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
                        <span className={styles.statLabel}>Total Revenue</span>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Recent Payments */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Pending Payments</h2>
                        <a href="/admin/payments" className={styles.viewAll}>View all →</a>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                        </div>
                    ) : recentPayments.length > 0 ? (
                        <div className={styles.list}>
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className={styles.listItem}>
                                    <div className={styles.listItemInfo}>
                                        <span className={styles.listItemTitle}>
                                            {payment.user?.full_name || payment.user?.email || 'Unknown User'}
                                        </span>
                                        <span className={styles.listItemMeta}>
                                            {payment.subscription?.service?.name || 'Unknown Service'} • {formatDate(payment.created_at)}
                                        </span>
                                    </div>
                                    <div className={styles.listItemValue}>
                                        {formatCurrency(payment.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No pending payments</p>
                        </div>
                    )}
                </div>

                {/* Recent Subscriptions */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Recent Subscriptions</h2>
                        <a href="/admin/subscriptions" className={styles.viewAll}>View all →</a>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner} />
                        </div>
                    ) : recentSubscriptions.length > 0 ? (
                        <div className={styles.list}>
                            {recentSubscriptions.map((sub) => (
                                <div key={sub.id} className={styles.listItem}>
                                    <div className={styles.listItemInfo}>
                                        <span className={styles.listItemTitle}>
                                            {sub.user?.full_name || sub.user?.email || 'Unknown User'}
                                        </span>
                                        <span className={styles.listItemMeta}>
                                            {sub.service?.name || 'Unknown Service'}
                                        </span>
                                    </div>
                                    <span className={`${styles.statusBadge} ${sub.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No subscriptions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionsGrid}>
                    <a href="/admin/users" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span>Manage Users</span>
                    </a>

                    <a href="/admin/payments" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Approve Payments</span>
                    </a>

                    <a href="/admin/subscriptions" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Renew Subscriptions</span>
                    </a>

                    <a href="/admin/roles" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <span>Manage Roles</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
