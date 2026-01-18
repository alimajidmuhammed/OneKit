// @ts-nocheck
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { formatDate, getDaysRemaining } from '@/lib/utils/helpers';
import Link from 'next/link';
import ServiceCard from '@/components/services/ServiceCard';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Utensils, LayoutGrid, Clock, CheckCircle2, CreditCard, FileText, ArrowRight, Zap, TrendingUp } from 'lucide-react';

/**
 * DashboardPage - OneKit 3.0 Premium Edition
 * Rebuilt with pure Tailwind v4, high-density data cards, and entrance animations.
 */
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

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const [cardsRes, menusRes, cvsRes] = await Promise.all([
                    supabase.from('business_cards').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('menus').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('cv_documents').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
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

    const recognizedSlugs = services.map(s => s.slug);
    const activeSubscriptions = subscriptions.filter(sub =>
        sub.status === 'active' && recognizedSlugs.includes(sub.service?.slug)
    );
    const expiringSoon = activeSubscriptions.filter(sub => {
        const days = getDaysRemaining(sub.expires_at);
        return days !== null && days > 0 && days <= 7;
    });

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-12 animate-reveal">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-200/50">
                        Control Center
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tighter leading-none">
                        Welcome, <span className="bg-brand-gradient bg-clip-text text-transparent italic">{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                    </h1>
                    <p className="text-xl text-neutral-400 font-medium max-w-lg">
                        Manage your professional infrastructure with OneKit's ecosystem tools.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-black text-neutral-400 uppercase tracking-widest bg-white px-6 py-4 rounded-[28px] border border-neutral-100 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    System Status: Optimal
                </div>
            </div>

            {/* Core Health Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard
                    icon={<Zap size={24} />}
                    value={loading ? '--' : activeSubscriptions.length}
                    label="Active Services"
                    color="primary"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    value={expiringSoon.length}
                    label="Expiring Soon"
                    color="warning"
                    alert={expiringSoon.length > 0}
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    value={services.length}
                    label="Available Tools"
                    color="accent"
                />
            </div>

            {/* Production Activity Activity */}
            <section className="space-y-8 pt-8">
                <div className="flex items-end justify-between border-b border-neutral-100 pb-6">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Production Traffic</h2>
                        <p className="text-neutral-400 font-medium text-sm mt-1">Real-time usage across your creative suite.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ActivityCard
                        href="/dashboard/card-maker"
                        icon={<CreditCard size={28} />}
                        value={userStats.cardsCreated}
                        label="Business Cards"
                        color="primary"
                        cta={userStats.cardsCreated === 0}
                    />
                    <ActivityCard
                        href="/dashboard/menu-maker"
                        icon={<Utensils size={28} />}
                        value={userStats.menusCreated}
                        label="Digital Menus"
                        color="success"
                        cta={userStats.menusCreated === 0}
                    />
                    <ActivityCard
                        href="/dashboard/cv-maker"
                        icon={<FileText size={28} />}
                        value={userStats.cvsCreated}
                        label="Professional CVs"
                        color="warning"
                        cta={userStats.cvsCreated === 0}
                    />
                </div>
            </section>

            {/* Global Services Landscape */}
            <section className="space-y-10 pt-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Ecosystem Status</h2>
                        <p className="text-neutral-400 font-medium text-sm mt-1">Unlock new capabilities to grow your brand.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-visible">
                    {services.map((service) => (
                        <div key={service.id} className="overflow-visible">
                            <ServiceCard
                                service={service}
                                showStatus={true}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function StatCard({ icon, value, label, color, alert }) {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600 border-primary-100/50',
        warning: 'bg-orange-50 text-orange-600 border-orange-100/50',
        accent: 'bg-accent-50 text-accent-600 border-accent-100/50'
    };

    return (
        <div className={`p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm flex items-center gap-6 group transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1 ${alert ? 'ring-2 ring-red-100' : ''}`}>
            <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-3xl font-black text-neutral-900 leading-none mb-1">{value}</span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</span>
            </div>
        </div>
    );
}

function ActivityCard({ href, icon, value, label, color, cta }) {
    const colorIcons = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-green-50 text-green-600',
        warning: 'bg-orange-50 text-orange-600'
    };

    return (
        <Link href={href} className="p-8 bg-white border border-neutral-100 rounded-[32px] shadow-sm group transition-all duration-500 hover:shadow-premium-layered hover:border-primary-200 relative overflow-hidden block">
            <div className="flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorIcons[color] || 'bg-neutral-50'}`}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-neutral-900">{value}</span>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</span>
                </div>
            </div>
            {cta && (
                <div className="mt-8 pt-6 border-t border-neutral-50 flex items-center justify-between text-primary-600 font-black text-[11px] uppercase tracking-widest relative z-10 transition-transform group-hover:translate-x-1">
                    <span>Initialize Now</span>
                    <ArrowRight size={16} />
                </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-primary-100/30 transition-colors" />
        </Link>
    );
}
