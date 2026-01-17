// @ts-nocheck
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency, getDaysRemaining, getInitials } from '@/lib/utils/helpers';
import { Search, Plus, X, Users, XCircle, Loader2 } from 'lucide-react';

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
    const [dateFilter, setDateFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [processing, setProcessing] = useState(false);

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

    const getUserStatus = (userId) => {
        const userSubs = userSubscriptionMap[userId] || [];
        if (userSubs.length === 0) return { status: 'no_subscription', label: 'No Subscription', color: 'neutral' };

        const activeSubs = userSubs.filter(s => s.status === 'active');
        const expiredSubs = userSubs.filter(s => s.status === 'expired');
        const pendingSubs = userSubs.filter(s => s.status === 'pending');

        if (activeSubs.length > 0) {
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

    const filteredUsers = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return users.filter(user => {
            let matchesDate = true;
            if (dateFilter === '7days') {
                matchesDate = new Date(user.created_at) >= sevenDaysAgo;
            } else if (dateFilter === '30days') {
                matchesDate = new Date(user.created_at) >= thirtyDaysAgo;
            }

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
                return '';
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
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
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
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
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
            case 'success': return 'bg-green-500/10 text-green-400';
            case 'warning': return 'bg-amber-500/10 text-amber-400';
            case 'error': return 'bg-red-500/10 text-red-400';
            default: return 'bg-neutral-700 text-neutral-400';
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1400px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Subscriptions</h1>
                    <p className="text-neutral-400">Manage all users and their subscriptions</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-full text-sm font-medium">
                        <span className="font-bold">{users.length}</span> Total Users
                    </div>
                    <div className="px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                        <span className="font-bold">{subscriptions.filter(s => s.status === 'active').length}</span> Active Subs
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', '7days', '30days'].map((filter) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${dateFilter === filter
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                                }`}
                            onClick={() => setDateFilter(filter)}
                        >
                            {filter === 'all' ? 'All Users' : filter === '7days' ? 'New (7 Days)' : 'New (30 Days)'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-800/50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Registered</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Services</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {filteredUsers.map((user) => {
                                    const userStatus = getUserStatus(user.id);
                                    const userSubs = userSubscriptionMap[user.id] || [];

                                    return (
                                        <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                        {getInitials(user.full_name || user.email)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium text-white truncate">{user.full_name || 'No name'}</span>
                                                        <span className="text-sm text-neutral-500 truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-neutral-400">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(userStatus.color)}`}>
                                                    {userStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {userSubs.length > 0 ? (
                                                        userSubs.map(sub => (
                                                            <button
                                                                key={sub.id}
                                                                className="px-2 py-1 bg-primary-500/10 text-primary-400 rounded text-xs font-medium hover:bg-primary-500/20 transition-colors"
                                                                onClick={() => handleEditSubscription(sub)}
                                                                title={`Click to edit - Status: ${sub.status}`}
                                                            >
                                                                {sub.service?.name || 'Unknown'}
                                                                {sub.expires_at && (
                                                                    <span className="ml-1 text-neutral-500">
                                                                        ({new Date(sub.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-neutral-500">No services</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
                                                    onClick={() => handleManageUser(user)}
                                                    title="Add/Extend Subscription"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Users className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                        <p className="text-neutral-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Add Subscription Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Add Subscription</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-neutral-800/50 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">User</span>
                                    <span className="text-white font-medium">{selectedUser.full_name || selectedUser.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Email</span>
                                    <span className="text-neutral-300">{selectedUser.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Service</label>
                                <select
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                >
                                    <option value="">-- Select Service --</option>
                                    {services.filter(s => s.is_active).map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name} - {formatCurrency(service.price_monthly)}/mo
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Plan Type</label>
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
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="lifetime">Lifetime</option>
                                        <option value="trial">Trial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.starts_at}
                                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Expiry Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                onClick={handleCreateSubscription}
                                disabled={processing || !formData.service_id}
                            >
                                {processing ? 'Creating...' : 'Add Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Subscription Modal */}
            {showEditModal && selectedSub && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Edit Subscription</h2>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-neutral-800/50 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">User</span>
                                    <span className="text-white font-medium">{selectedSub.user?.full_name || selectedSub.user?.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Current Service</span>
                                    <span className="text-neutral-300">{selectedSub.service?.name}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Service</label>
                                <select
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                >
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Plan Type</label>
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
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="lifetime">Lifetime</option>
                                        <option value="trial">Trial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500 cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="expired">Expired</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.starts_at}
                                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Expiry Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <h4 className="text-red-400 font-medium mb-3">Danger Zone</h4>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    onClick={handleEndSubscription}
                                    disabled={processing}
                                >
                                    <XCircle size={16} /> End Subscription Now
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-neutral-800">
                            <button className="flex-1 px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                onClick={handleUpdateSubscription}
                                disabled={processing}
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
