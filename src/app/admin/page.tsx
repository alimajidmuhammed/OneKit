// @ts-nocheck
'use client';

import { useAdmin } from '@/lib/hooks/useAdmin';
import { formatDate, formatCurrency } from '@/lib/utils/helpers';
import {
    Users,
    CheckCircle,
    Clock,
    DollarSign,
    PlusCircle,
    ShieldCheck,
    ArrowRight,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

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
        <div className="p-8 max-w-[1400px]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2 text-white">Admin Dashboard</h1>
                <p className="text-neutral-400">Overview of your platform's performance</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
                        <Users size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
                        <span className="text-sm text-neutral-500">Total Users</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                        <CheckCircle size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{stats.activeSubscriptions}</span>
                        <span className="text-sm text-neutral-500">Active Subscriptions</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                        <Clock size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{stats.pendingPayments}</span>
                        <span className="text-sm text-neutral-500">Pending Payments</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                        <DollarSign size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</span>
                        <span className="text-sm text-neutral-500">Total Revenue</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Payments */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">Pending Payments</h2>
                        <Link href="/admin/payments" className="flex items-center gap-1 text-sm text-primary-500 no-underline hover:underline">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : recentPayments.length > 0 ? (
                        <div className="p-2">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-neutral-800 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-white">
                                            {payment.user?.full_name || payment.user?.email || 'Unknown User'}
                                        </span>
                                        <span className="text-sm text-neutral-500">
                                            {payment.subscription?.service?.name || 'Unknown Service'} • {formatDate(payment.created_at)}
                                        </span>
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatCurrency(payment.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            <p>No pending payments</p>
                        </div>
                    )}
                </div>

                {/* Recent Subscriptions */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-800">
                        <h2 className="text-lg font-semibold text-white">Recent Subscriptions</h2>
                        <Link href="/admin/subscriptions" className="flex items-center gap-1 text-sm text-primary-500 no-underline hover:underline">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : recentSubscriptions.length > 0 ? (
                        <div className="p-2">
                            {recentSubscriptions.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-neutral-800 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-white">
                                            {sub.user?.full_name || sub.user?.email || 'Unknown User'}
                                        </span>
                                        <span className="text-sm text-neutral-500">
                                            {sub.service?.name || 'Unknown Service'}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${sub.status === 'active'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-neutral-700 text-neutral-400'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-neutral-500">
                            <p>No subscriptions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Link href="/admin/users" className="flex flex-col items-center gap-3 p-6 bg-neutral-900 border border-neutral-800 rounded-xl no-underline transition-all hover:border-primary-500/50 hover:shadow-lg hover:-translate-y-0.5">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary-500/10 rounded-lg">
                            <Users size={24} className="text-primary-500" />
                        </div>
                        <span className="font-medium text-white">Manage Users</span>
                    </Link>

                    <Link href="/admin/payments" className="flex flex-col items-center gap-3 p-6 bg-neutral-900 border border-neutral-800 rounded-xl no-underline transition-all hover:border-primary-500/50 hover:shadow-lg hover:-translate-y-0.5">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary-500/10 rounded-lg">
                            <CheckCircle size={24} className="text-primary-500" />
                        </div>
                        <span className="font-medium text-white">Approve Payments</span>
                    </Link>

                    <Link href="/admin/subscriptions" className="flex flex-col items-center gap-3 p-6 bg-neutral-900 border border-neutral-800 rounded-xl no-underline transition-all hover:border-primary-500/50 hover:shadow-lg hover:-translate-y-0.5">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary-500/10 rounded-lg">
                            <PlusCircle size={24} className="text-primary-500" />
                        </div>
                        <span className="font-medium text-white">Renew Subscriptions</span>
                    </Link>

                    <Link href="/admin/roles" className="flex flex-col items-center gap-3 p-6 bg-neutral-900 border border-neutral-800 rounded-xl no-underline transition-all hover:border-primary-500/50 hover:shadow-lg hover:-translate-y-0.5">
                        <div className="w-12 h-12 flex items-center justify-center bg-primary-500/10 rounded-lg">
                            <ShieldCheck size={24} className="text-primary-500" />
                        </div>
                        <span className="font-medium text-white">Manage Roles</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
