'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency, getDaysRemaining, getInitials } from '@/lib/utils/helpers';
import styles from './subscriptions.module.css';

export default function SubscriptionsPage() {
    const {
        subscriptions,
        users,
        loading,
        fetchAllSubscriptions,
        fetchUsers,
        fetchServices,
        updateSubscriptionDates,
        createSubscription,
        cancelSubscription,
    } = useAdmin();

    const [services, setServices] = useState([]);
    const [viewMode, setViewMode] = useState('users'); // 'users' or 'subscriptions'
    const [dateFilter, setDateFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Create/Extend form state
    const [formData, setFormData] = useState({
        service_id: '',
        plan_type: 'monthly',
        starts_at: '',
        expires_at: '',
        status: 'active',
    });

    useEffect(() => {
        fetchAllSubscriptions();
        fetchUsers();
        loadServices();
    }, []);

    const loadServices = async () => {
        const data = await fetchServices();
        setServices(data || []);
    };

    // Build user subscription map
    const userSubscriptionMap = useMemo(() => {
        const map = {};
        subscriptions.forEach(sub => {
            if (!map[sub.user_id]) {
                map[sub.user_id] = [];
            }
            map[sub.user_id].push(sub);
        });
        return map;
    }, [subscriptions]);

    // Get user subscription status summary
    const getUserStatus = (userId) => {
        const userSubs = userSubscriptionMap[userId] || [];
        if (userSubs.length === 0) return { status: 'no_subscription', label: 'No Subscription', color: 'neutral' };

        const activeSubs = userSubs.filter(s => s.status === 'active');
        const expiredSubs = userSubs.filter(s => s.status === 'expired');
        const pendingSubs = userSubs.filter(s => s.status === 'pending');

        if (activeSubs.length > 0) {
            // Check for trial (less than 7 days remaining could indicate trial)
            const nearestExpiry = activeSubs
                .filter(s => s.expires_at)
                .sort((a, b) => new Date(a.expires_at) - new Date(b.expires_at))[0];

            if (nearestExpiry) {
                const days = getDaysRemaining(nearestExpiry.expires_at);
                if (days !== null && days <= 7 && days > 0) {
                    return { status: 'trial', label: `Trial (${days}d left)`, color: 'warning', days };
                }
            }
            return { status: 'active', label: `${activeSubs.length} Active`, color: 'success' };
        }
        if (pendingSubs.length > 0) return { status: 'pending', label: 'Pending', color: 'warning' };
        if (expiredSubs.length > 0) return { status: 'expired', label: 'Expired', color: 'error' };
        return { status: 'inactive', label: 'Inactive', color: 'neutral' };
    };

    // Filter users
    const filteredUsers = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return users.filter(user => {
            // Date filter (by user registration date)
            let matchesDate = true;
            if (dateFilter === '7days') {
                matchesDate = new Date(user.created_at) >= sevenDaysAgo;
            } else if (dateFilter === '30days') {
                matchesDate = new Date(user.created_at) >= thirtyDaysAgo;
            }

            // Search filter
            const matchesSearch =
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesDate && matchesSearch;
        });
    }, [users, dateFilter, searchTerm]);

    const formatDateTimeLocal = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 16);
    };

    // Calculate default expiry based on plan type
    const getDefaultExpiry = (planType) => {
        const now = new Date();
        switch (planType) {
            case 'monthly':
                now.setMonth(now.getMonth() + 1);
                break;
            case 'yearly':
                now.setFullYear(now.getFullYear() + 1);
                break;
            case 'trial':
                now.setDate(now.getDate() + 7);
                break;
            case 'lifetime':
                return ''; // No expiry for lifetime
            default:
                now.setMonth(now.getMonth() + 1);
        }
        return formatDateTimeLocal(now.toISOString());
    };

    const handleManageUser = (user) => {
        setSelectedUser(user);
        const defaultPlan = 'monthly';
        setFormData({
            service_id: services[0]?.id || '',
            plan_type: defaultPlan,
            starts_at: formatDateTimeLocal(new Date().toISOString()),
            expires_at: getDefaultExpiry(defaultPlan),
            status: 'active',
        });
        setShowModal(true);
    };

    const handleEditSubscription = (sub) => {
        setSelectedSub(sub);
        setFormData({
            service_id: sub.service_id || '',
            plan_type: sub.plan_type || 'monthly',
            starts_at: formatDateTimeLocal(sub.starts_at),
            expires_at: formatDateTimeLocal(sub.expires_at),
            status: sub.status || 'active',
        });
        setShowEditModal(true);
    };

    const handleCreateSubscription = async () => {
        if (!selectedUser || !formData.service_id) {
            alert('Please select a service');
            return;
        }

        setProcessing(true);
        const { error } = await createSubscription({
            user_id: selectedUser.id,
            service_id: formData.service_id,
            plan_type: formData.plan_type,
            status: formData.status,
            starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : (formData.plan_type === 'lifetime' ? null : null),
        });

        if (error) {
            alert('Error creating subscription: ' + error);
        } else {
            setShowModal(false);
            setSelectedUser(null);
        }
        setProcessing(false);
    };

    const handleUpdateSubscription = async () => {
        if (!selectedSub) return;

        setProcessing(true);
        const { error } = await updateSubscriptionDates(selectedSub.id, {
            service_id: formData.service_id,
            plan_type: formData.plan_type,
            status: formData.status,
            starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : (formData.plan_type === 'lifetime' ? null : null),
        });

        if (error) {
            alert('Error updating subscription: ' + error);
        } else {
            setShowEditModal(false);
            setSelectedSub(null);
        }
        setProcessing(false);
    };

    const handleEndSubscription = async () => {
        if (!selectedSub) return;
        if (!confirm('Are you sure you want to end this subscription immediately?')) return;

        setProcessing(true);
        const { error } = await cancelSubscription(selectedSub.id);
        if (error) {
            alert('Error ending subscription: ' + error);
        } else {
            setShowEditModal(false);
            setSelectedSub(null);
        }
        setProcessing(false);
    };

    const getStatusBadgeClass = (color) => {
        switch (color) {
            case 'success': return styles.statusActive;
            case 'warning': return styles.statusPending;
            case 'error': return styles.statusExpired;
            default: return styles.statusInactive;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>User Subscriptions</h1>
                    <p>Manage all users and their subscriptions</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.stats}>
                        <div className={`${styles.statBadge} ${styles.statActive}`}>
                            <span>{users.length}</span> Total Users
                        </div>
                        <div className={`${styles.statBadge} ${styles.statExpiring}`}>
                            <span>{subscriptions.filter(s => s.status === 'active').length}</span> Active Subs
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <div className={styles.dateFilters}>
                        <button
                            className={`${styles.dateBtn} ${dateFilter === 'all' ? styles.dateBtnActive : ''}`}
                            onClick={() => setDateFilter('all')}
                        >
                            All Users
                        </button>
                        <button
                            className={`${styles.dateBtn} ${dateFilter === '7days' ? styles.dateBtnActive : ''}`}
                            onClick={() => setDateFilter('7days')}
                        >
                            New (7 Days)
                        </button>
                        <button
                            className={`${styles.dateBtn} ${dateFilter === '30days' ? styles.dateBtnActive : ''}`}
                            onClick={() => setDateFilter('30days')}
                        >
                            New (30 Days)
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Registered</th>
                                <th>Status</th>
                                <th>Services</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const userStatus = getUserStatus(user.id);
                                const userSubs = userSubscriptionMap[user.id] || [];

                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {getInitials(user.full_name || user.email)}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{user.full_name || 'No name'}</span>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusBadgeClass(userStatus.color)}`}>
                                                {userStatus.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.servicesCell}>
                                                {userSubs.length > 0 ? (
                                                    userSubs.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            className={styles.serviceTag}
                                                            onClick={() => handleEditSubscription(sub)}
                                                            title={`Click to edit - Status: ${sub.status}`}
                                                        >
                                                            {sub.service?.name || 'Unknown'}
                                                            {sub.expires_at && (
                                                                <span className={styles.serviceExpiry}>
                                                                    Exp: {new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <span className={styles.noServices}>No services</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={`${styles.actionBtn} ${styles.addServiceBtn}`}
                                                    onClick={() => handleManageUser(user)}
                                                    title="Add/Extend Subscription"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <h3>No users found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Add Subscription Modal */}
            {
                showModal && selectedUser && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Add Subscription</h2>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.subSummary}>
                                    <div className={styles.summaryRow}>
                                        <span>User</span>
                                        <span>{selectedUser.full_name || selectedUser.email}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Email</span>
                                        <span>{selectedUser.email}</span>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Service</label>
                                    <select
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    >
                                        <option value="">-- Select Service --</option>
                                        {services.filter(s => s.is_active).map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name} - {formatCurrency(service.price_monthly)}/mo
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Plan Type</label>
                                        <select
                                            value={formData.plan_type}
                                            onChange={(e) => {
                                                const newPlan = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    plan_type: newPlan,
                                                    expires_at: getDefaultExpiry(newPlan)
                                                });
                                            }}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="lifetime">Lifetime</option>
                                            <option value="trial">Trial</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Date</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.starts_at}
                                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Expiry Date</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className={styles.saveBtn}
                                    onClick={handleCreateSubscription}
                                    disabled={processing || !formData.service_id}
                                >
                                    {processing ? 'Creating...' : 'Add Subscription'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Subscription Modal */}
            {
                showEditModal && selectedSub && (
                    <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Edit Subscription</h2>
                                <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.subSummary}>
                                    <div className={styles.summaryRow}>
                                        <span>User</span>
                                        <span>{selectedSub.user?.full_name || selectedSub.user?.email}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Current Service</span>
                                        <span>{selectedSub.service?.name}</span>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Service</label>
                                    <select
                                        value={formData.service_id}
                                        onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    >
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Plan Type</label>
                                        <select
                                            value={formData.plan_type}
                                            onChange={(e) => {
                                                const newPlan = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    plan_type: newPlan,
                                                    expires_at: getDefaultExpiry(newPlan)
                                                });
                                            }}
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="lifetime">Lifetime</option>
                                            <option value="trial">Trial</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="expired">Expired</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Date</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.starts_at}
                                            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Expiry Date</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.dangerZone}>
                                    <h4>Danger Zone</h4>
                                    <button
                                        className={styles.endBtn}
                                        onClick={handleEndSubscription}
                                        disabled={processing}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        End Subscription Now
                                    </button>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className={styles.saveBtn}
                                    onClick={handleUpdateSubscription}
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
