// @ts-nocheck
'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { APP_CONFIG } from '@/lib/utils/constants';
import { formatDate, formatCurrency, getDaysRemaining, getWhatsAppLink } from '@/lib/utils/helpers';
import Link from 'next/link';
import { CheckCircle2, Clock, Calendar, ArrowRight, Loader2 } from 'lucide-react';

/**
 * SubscriptionsPage - OneKit 3.0 Premium Edition
 * Migrated to pure Tailwind v4 with high-end subscription cards.
 */
export default function SubscriptionsPage() {
    const { subscriptions, loading } = useSubscription();

    const getStatusClasses = (status) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-700 border-green-100';
            case 'expired': return 'bg-red-50 text-red-700 border-red-100';
            case 'pending': return 'bg-orange-50 text-orange-700 border-orange-100';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const expiredCount = subscriptions.filter(s => s.status === 'expired').length;

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-10 animate-reveal">
            {/* Header Section */}
            <div className="space-y-4 mb-12">
                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-100">
                    Account Management
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">
                    My <span className="text-primary-500 italic">Subscriptions</span>
                </h1>
                <p className="text-base text-neutral-400 font-medium max-w-lg">
                    Manage your service subscriptions
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white border border-neutral-100 rounded-3xl shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50 text-green-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-2xl font-black text-neutral-900 leading-none mb-1">{activeCount}</span>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Active</span>
                    </div>
                </div>

                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-red-50 text-red-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <Clock size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-2xl font-black text-neutral-900 leading-none mb-1">{expiredCount}</span>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Expired</span>
                    </div>
                </div>

                <div className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-primary-50 text-primary-600 transition-all group-hover:scale-110 group-hover:rotate-6">
                        <Calendar size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-2xl font-black text-neutral-900 leading-none mb-1">{subscriptions.length}</span>
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total</span>
                    </div>
                </div>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                        <span className="text-neutral-400 font-medium">Loading subscriptions...</span>
                    </div>
                ) : subscriptions.length > 0 ? (
                    subscriptions.map((sub) => {
                        const service = sub.service;
                        const daysLeft = getDaysRemaining(sub.expires_at);
                        const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

                        const iconColors = {
                            primary: 'bg-primary-50 text-primary-600',
                            accent: 'bg-accent-50 text-accent-600',
                            success: 'bg-green-50 text-green-600',
                            warning: 'bg-orange-50 text-orange-600',
                            info: 'bg-blue-50 text-blue-600',
                        };

                        return (
                            <div key={sub.id} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-premium-layered transition-all duration-500">
                                <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconColors[service?.color || 'primary']}`}>
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8" />
                                                <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                                                <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                                                <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900 mb-1">{service?.name || 'Unknown Service'}</h3>
                                            <span className="text-sm text-neutral-400 capitalize">{sub.plan_type} plan</span>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full border ${getStatusClasses(sub.status)}`}>
                                        {sub.status}
                                    </span>
                                </div>

                                <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Started</span>
                                        <span className="font-bold text-neutral-900">{formatDate(sub.starts_at)}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Expires</span>
                                        <span className="font-bold text-neutral-900">{sub.expires_at ? formatDate(sub.expires_at) : 'Lifetime'}</span>
                                    </div>
                                    {daysLeft !== null && sub.status === 'active' && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Time Left</span>
                                            <span className={`font-bold ${isExpiringSoon ? 'text-orange-600' : 'text-neutral-900'}`}>
                                                {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
                                                {isExpiringSoon && ' ⚠️'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-100">
                                    {sub.status === 'active' ? (
                                        <Link
                                            href={`/services/${service?.slug}`}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                                        >
                                            Use Service
                                            <ArrowRight size={16} />
                                        </Link>
                                    ) : (
                                        <a
                                            href={getWhatsAppLink(
                                                APP_CONFIG.whatsapp.number,
                                                `Hi! I want to renew my ${service?.name} subscription.`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-premium inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-green-700 hover:shadow-xl transition-all active:scale-95"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                            </svg>
                                            Renew via WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl">
                        <div className="w-16 h-16 flex items-center justify-center bg-neutral-100 text-neutral-400 rounded-full mx-auto mb-6">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-black text-neutral-900 mb-2">No subscriptions yet</h3>
                        <p className="text-neutral-400 mb-8">Subscribe to a service to get started</p>
                        <Link
                            href="/#services"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                        >
                            Browse Services
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
