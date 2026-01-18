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
        <div className="p-10 max-w-[1400px] mx-auto space-y-12">
            {/* Header */}
            <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-100">
                    Neural Governance
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">
                    Admin <span className="text-primary-500 italic">Dashboard</span>
                </h1>
                <p className="text-base text-neutral-400 font-medium max-w-lg mt-2">Overseeing the Iraqi Professional Infrastructure.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-primary-50 text-primary-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <Users size={28} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-3xl font-black text-neutral-900 leading-none mb-1">{stats.totalUsers}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Users</span>
                    </div>
                </div>

                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-green-50 text-green-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <CheckCircle size={28} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-3xl font-black text-neutral-900 leading-none mb-1">{stats.activeSubscriptions}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Plans</span>
                    </div>
                </div>

                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-amber-50 text-amber-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <Clock size={28} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-3xl font-black text-neutral-900 leading-none mb-1">{stats.pendingPayments}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pending</span>
                    </div>
                </div>

                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-purple-50 text-purple-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <DollarSign size={28} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-3xl font-black text-neutral-900 leading-none mb-1">{formatCurrency(stats.totalRevenue)}</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Revenue</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <div className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-100 bg-neutral-50/30">
                        <h2 className="text-lg font-black text-neutral-900 tracking-tight">Pending Payments</h2>
                        <Link href="/admin/payments" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100 hover:bg-primary-100 transition-all">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : recentPayments.length > 0 ? (
                        <div className="p-4 space-y-2">
                            {recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-neutral-50 transition-colors group">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black text-neutral-900 tracking-tight">
                                            {payment.user?.full_name || payment.user?.email || 'Unknown User'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                                {payment.subscription?.service?.name || 'Unknown Service'}
                                            </span>
                                            <span className="text-[10px] text-neutral-400">•</span>
                                            <span className="text-[10px] font-bold text-neutral-400">
                                                {formatDate(payment.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-neutral-900 group-hover:scale-105 transition-transform">
                                        {formatCurrency(payment.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-neutral-400 font-medium">No pending payments</p>
                        </div>
                    )}
                </div>

                {/* Recent Subscriptions */}
                <div className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-100 bg-neutral-50/30">
                        <h2 className="text-lg font-black text-neutral-900 tracking-tight">Recent Subscriptions</h2>
                        <Link href="/admin/subscriptions" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-100 hover:bg-primary-100 transition-all">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : recentSubscriptions.length > 0 ? (
                        <div className="p-4 space-y-2">
                            {recentSubscriptions.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-neutral-50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black text-neutral-900 tracking-tight">
                                            {sub.user?.full_name || sub.user?.email || 'Unknown User'}
                                        </span>
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                            {sub.service?.name || 'Unknown Service'}
                                        </span>
                                    </div>
                                    <span className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full border ${sub.status === 'active'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-neutral-500">
                            <p className="text-neutral-400 font-medium">No active subscriptions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-8">
                <h2 className="text-xl font-black text-neutral-900 mb-6 tracking-tight">Protocol Shortcuts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href="/admin/users" className="flex flex-col items-center gap-4 p-8 bg-white border border-neutral-100 rounded-[32px] no-underline transition-all hover:shadow-premium-layered hover:-translate-y-1 group">
                        <div className="w-14 h-14 flex items-center justify-center bg-primary-50 text-primary-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="font-black text-neutral-900 tracking-tight">Manage Users</span>
                    </Link>

                    <Link href="/admin/payments" className="flex flex-col items-center gap-4 p-8 bg-white border border-neutral-100 rounded-[32px] no-underline transition-all hover:shadow-premium-layered hover:-translate-y-1 group">
                        <div className="w-14 h-14 flex items-center justify-center bg-green-50 text-green-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                        <span className="font-black text-neutral-900 tracking-tight">Approve Ledger</span>
                    </Link>

                    <Link href="/admin/subscriptions" className="flex flex-col items-center gap-4 p-8 bg-white border border-neutral-100 rounded-[32px] no-underline transition-all hover:shadow-premium-layered hover:-translate-y-1 group">
                        <div className="w-14 h-14 flex items-center justify-center bg-amber-50 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                        <span className="font-black text-neutral-900 tracking-tight">Renew Assets</span>
                    </Link>

                    <Link href="/admin/roles" className="flex flex-col items-center gap-4 p-8 bg-white border border-neutral-100 rounded-[32px] no-underline transition-all hover:shadow-premium-layered hover:-translate-y-1 group">
                        <div className="w-14 h-14 flex items-center justify-center bg-purple-50 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="font-black text-neutral-900 tracking-tight">Govern Roles</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
