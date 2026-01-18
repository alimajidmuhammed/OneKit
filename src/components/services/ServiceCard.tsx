// @ts-nocheck
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';

interface ServiceCardProps {
    service: {
        id?: string;
        slug: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        category?: string;
        isFree?: boolean;
        priceLabel?: string;
    };
    customPriceLabel?: string | null;
    showStatus?: boolean;
}

/**
 * ServiceCard - Rebuilt for Perfect Layout
 * Ensures NO text truncation and perfect grid alignment.
 * Supports subscription status for dashboard usage.
 */
export default function ServiceCard({ service, customPriceLabel, showStatus = false }: ServiceCardProps) {
    const { user } = useAuth();
    const { getSubscriptionStatus } = useSubscription();

    // Status check for dashboard usage
    const status = showStatus && user ? getSubscriptionStatus(service.slug) : null;

    // Theme mapping for borders and backgrounds
    const themeClasses = {
        primary: 'border-primary-100 ring-primary-50/30 hover:border-primary-200',
        accent: 'border-accent-100 ring-accent-50/30 hover:border-accent-200',
        neutral: 'border-neutral-100 ring-neutral-50/30 hover:border-neutral-200',
        success: 'border-green-100 ring-green-50/30 hover:border-green-200',
        warning: 'border-orange-100 ring-orange-50/30 hover:border-orange-200',
        error: 'border-red-100 ring-red-50/30 hover:border-red-200',
    };

    const iconBgClasses = {
        primary: 'bg-primary-50 text-primary-600',
        accent: 'bg-accent-50 text-accent-600',
        neutral: 'bg-neutral-50 text-neutral-600',
        success: 'bg-green-50 text-green-600',
        warning: 'bg-orange-50 text-orange-600',
        error: 'bg-red-50 text-red-600',
    };

    // Redirect to login if not authenticated for certain flows
    const cardLink = user ? `/services/${service.slug}` : `/login?redirect=/services/${service.slug}`;

    return (
        <Link
            href={cardLink}
            className={`flex flex-col w-full h-full bg-white border rounded-[48px] p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(10,36,114,0.15)] group relative overflow-visible ${themeClasses[service.color as keyof typeof themeClasses] || themeClasses.primary
                }`}
        >
            {/* Header: Icon (Left) & Badge (Right) */}
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary
                    }`}>
                    <ServiceIcon type={service.icon} className="w-10 h-10" />
                </div>

                <div className="flex flex-col items-end gap-2">
                    {/* Status Badge (Dashboard only) */}
                    {status === 'active' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 mb-1">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
                        </div>
                    )}

                    {/* Price/Type Badge */}
                    {customPriceLabel ? (
                        <span className="px-4 py-1.5 bg-neutral-100 text-neutral-900 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
                            {customPriceLabel}
                        </span>
                    ) : service.isFree ? (
                        <span className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-green-100 shadow-sm">
                            Free
                        </span>
                    ) : service.priceLabel ? (
                        <span className="px-4 py-1.5 bg-primary-50 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-primary-100 shadow-sm">
                            {service.priceLabel}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative z-10">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-3 block">
                    {service.category || 'Professional Tool'}
                </span>
                <h3 className="text-3xl font-black text-neutral-900 mb-4 group-hover:text-primary-900 transition-colors tracking-tighter leading-tight">
                    {service.name}
                </h3>
                <p className="text-lg text-neutral-500 leading-relaxed mb-10">
                    {service.description}
                </p>
            </div>

            {/* Footer Link: MUST BE FULLY VISIBLE */}
            <div className="flex items-center gap-3 text-primary-600 font-bold text-sm transition-all group-hover:gap-4 mt-auto relative z-10">
                <span className="tracking-wide whitespace-nowrap">Launch Enterprise Editor</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 flex-shrink-0" />
            </div>

            {/* Subtle Gradient Glow on Hover */}
            <div className="absolute inset-0 rounded-[48px] bg-gradient-to-tr from-transparent via-transparent to-primary-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </Link>
    );
}
