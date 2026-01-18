// @ts-nocheck
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useServices } from '@/lib/hooks/useServices';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink, formatCurrency } from '@/lib/utils/helpers';
import { sendPaymentRequest } from '@/lib/utils/whatsapp';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Zap, ArrowLeft, Star } from 'lucide-react';

export default function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    const { slug } = resolvedParams;
    const { user } = useAuth();
    const { hasAccess, getAccessStatus, loading } = useSubscription();
    // @ts-ignore
    const { services, loading: servicesLoading } = useServices();

    const service = services.find(s => s.slug === slug);

    // Show loading while services are being fetched
    if (servicesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!service) {
        notFound();
    }

    // @ts-ignore
    const accessStatus = user ? getAccessStatus(slug) : null;
    const canAccess = accessStatus?.hasAccess || false;

    const getServiceIcon = (iconType: string) => {
        const icons: Record<string, JSX.Element> = {
            document: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            menu: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            qr: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                    <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                    <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
            invoice: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            logo: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            card: (
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                </svg>
            ),
        };
        return icons[iconType] || icons.document;
    };

    const handleSubscribe = (e: React.MouseEvent) => {
        e.preventDefault();
        sendPaymentRequest({
            serviceName: service.name,
            userName: user?.email?.split('@')[0] || 'Guest', // Fallback name
            userEmail: user?.email || 'Not provided',
            amount: service.price_yearly || service.price_monthly || 0,
            currency: 'IQD'
        }, APP_CONFIG.whatsapp.number);
    };

    // Color theme map for dynamic styling based on service color
    const colorThemes: Record<string, string> = {
        primary: 'text-primary-600 bg-primary-50 border-primary-100',
        accent: 'text-accent-600 bg-accent-50 border-accent-100',
        success: 'text-green-600 bg-green-50 border-green-100',
        warning: 'text-orange-600 bg-orange-50 border-orange-100',
        info: 'text-blue-600 bg-blue-50 border-blue-100',
    };

    const themeClass = colorThemes[service.color] || colorThemes.primary;

    return (
        <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-primary-900 selection:text-white pt-header">
            {/* --- HERO SECTION --- */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-100/30 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                        <Link href="/#services" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-primary-600 transition-colors mb-12 uppercase tracking-widest">
                            <ArrowLeft size={16} />
                            Back to Services
                        </Link>

                        {/* Animated Icon */}
                        <div className={`w-32 h-32 rounded-[32px] flex items-center justify-center mb-10 shadow-premium-layered transform hover:scale-105 transition-transform duration-500 ${themeClass}`}>
                            {getServiceIcon(service.icon)}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-8 tracking-tighter leading-tight font-display animate-reveal">
                            {service.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-500 font-medium leading-relaxed max-w-2xl mb-12 animate-fade-in-up">
                            {service.description}
                        </p>

                        {/* Pricing Badge / Area */}
                        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {service.isFree ? (
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-full border border-green-100 shadow-sm">
                                    <Zap size={20} fill="currentColor" />
                                    <span className="font-black uppercase tracking-widest text-sm">Free Forever</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-2 text-neutral-900">
                                        <span className="text-5xl font-black tracking-tighter">
                                            {formatCurrency(service.price_yearly)}
                                        </span>
                                        <span className="text-xl text-neutral-400 font-bold uppercase tracking-widest">/ year</span>
                                    </div>
                                    <div className="mt-2 text-sm font-bold text-primary-600 uppercase tracking-widest">
                                        Simple Yearly Billing
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            {loading ? (
                                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                            ) : canAccess ? (
                                <Link
                                    href={service.dashboardPath}
                                    className="inline-flex items-center gap-3 px-10 py-5 bg-primary-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-primary-950 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    Launch Tool <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-4 items-center">
                                    <button
                                        onClick={handleSubscribe}
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-primary-900 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-primary-950 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        Subscribe via WhatsApp <ChevronRight size={20} />
                                    </button>
                                    <p className="text-xs text-neutral-400 font-medium">
                                        Instant activation upon payment
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="py-24 bg-neutral-50 border-t border-neutral-200 relative overflow-hidden">
                <div className="texture-noise absolute inset-0 opacity-[0.03]" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary-600 font-black uppercase tracking-[0.2em] text-xs block mb-4">Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter">Everything Included</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {service.features.map((feature: string, index: number) => (
                            <div key={index} className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${themeClass.replace('text-', 'text-opacity-100 text-').split(' ')[1]} ${themeClass.split(' ')[0]}`}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature}</h3>
                                <p className="text-neutral-500 text-sm leading-relaxed">
                                    Professional grade tools optimised for efficiency and output quality.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            {!service.isFree && !canAccess && (
                <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-gradient opacity-10" />
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Ready to Deploy?</h2>
                            <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-medium">
                                Join thousands of Iraqi professionals upgrading their workflow with OneKit today.
                            </p>
                            <a
                                href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-12 py-6 bg-white text-neutral-900 rounded-[28px] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105"
                            >
                                Start Subscription <ArrowRight size={20} />
                            </a>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
