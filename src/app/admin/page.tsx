// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/helpers';
import {
    Users,
    CheckCircle,
    Clock,
    DollarSign,
    PlusCircle,
    ShieldCheck,
    CreditCard,
    ArrowRight
} from 'lucide-react';
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
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.totalUsers}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconActive}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.activeSubscriptions}</span>
                        <span className={styles.statLabel}>Active Subscriptions</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPending}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats.pendingPayments}</span>
                        <span className={styles.statLabel}>Pending Payments</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconRevenue}`}>
                        <DollarSign size={24} />
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
                        <a href="/admin/payments" className={styles.viewAll}>View all <ArrowRight size={14} /></a>
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
                        <a href="/admin/subscriptions" className={styles.viewAll}>View all <ArrowRight size={14} /></a>
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
                            <Users size={24} />
                        </div>
                        <span>Manage Users</span>
                    </a>

                    <a href="/admin/payments" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <CheckCircle size={24} />
                        </div>
                        <span>Approve Payments</span>
                    </a>

                    <a href="/admin/subscriptions" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <PlusCircle size={24} />
                        </div>
                        <span>Renew Subscriptions</span>
                    </a>

                    <a href="/admin/roles" className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <ShieldCheck size={24} />
                        </div>
                        <span>Manage Roles</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
