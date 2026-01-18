// @ts-nocheck
'use client';

import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import Link from 'next/link';
import ServiceCard from '@/components/services/ServiceCard';
import { LayoutGrid, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

/**
 * ServicesPage - OneKit 3.0 Global Ecosystem
 * Rebuilt with pure Tailwind v4 and OneKit 3.0 visual language.
 */
export default function ServicesPage() {
    const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
    const { services, loading: servicesLoading } = useServices();
    const loading = subscriptionLoading || servicesLoading;

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-20 animate-reveal">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-200/50">
                        Ecosystem Pulse
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none italic">
                        Control <span className="text-primary-600">Center</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Manage your active nodes or deploy new professional tools from the OneKit network.
                    </p>
                </div>
            </div>

            {/* Active Services: Glassmorphism 2.0 */}
            <section className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-green-500 rounded-full" />
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-3 italic">
                        <CheckCircle2 size={24} className="text-green-500" />
                        Operational Nodes
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Synchronizing...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {services.filter(service => hasActiveSubscription(service.slug)).length > 0 ? (
                            services.filter(service => hasActiveSubscription(service.slug)).map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    showStatus={true}
                                    customPriceLabel="(Operational)"
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 px-10 bg-white border border-dashed border-neutral-200 rounded-[48px] flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                                    <Sparkles size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">No Active Protocols</h3>
                                    <p className="text-neutral-400 font-medium italic">Your infrastructure is ready for deployment.</p>
                                </div>
                                <Link href="/#services" className="px-8 py-3.5 bg-neutral-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-neutral-900/10">
                                    Browse All Services
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* All Services Terminal */}
            <section className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-primary-600 rounded-full" />
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-3 italic">
                        <LayoutGrid size={24} className="text-primary-600" />
                        Global Repository
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            showStatus={true}
                            customPriceLabel={hasActiveSubscription(service.slug) ? "(Operational)" : null}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
