// @ts-nocheck
'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useState } from 'react';

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
 * ServiceCard - OneKit 3.0 Premium Edition
 * Features dynamic mouse-aware glow, elevated icon states, and layered depth.
 */
export default function ServiceCard({ service, customPriceLabel, showStatus = false }: ServiceCardProps) {
    const { user } = useAuth();
    const { getSubscriptionStatus } = useSubscription();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Status check for dashboard usage
    const status = showStatus && user ? getSubscriptionStatus(service.slug) : null;

    // Theme mapping for borders and backgrounds
    const themeClasses = {
        primary: 'border-primary-100 ring-primary-50/10 hover:border-primary-300/50 hover:bg-primary-50/5',
        accent: 'border-accent-100 ring-accent-50/10 hover:border-accent-300/50 hover:bg-accent-50/5',
        neutral: 'border-neutral-100 ring-neutral-50/10 hover:border-neutral-300/50 hover:bg-neutral-50/5',
        success: 'border-green-100 ring-green-50/10 hover:border-green-300/50 hover:bg-green-50/5',
        warning: 'border-orange-100 ring-orange-50/10 hover:border-orange-300/50 hover:bg-orange-50/5',
        error: 'border-red-100 ring-red-50/10 hover:border-red-300/50 hover:bg-red-50/5',
    };

    const iconBgClasses = {
        primary: 'bg-primary-50 text-primary-600 shadow-primary-200/50',
        accent: 'bg-accent-50 text-accent-600 shadow-accent-200/50',
        neutral: 'bg-neutral-50 text-neutral-600 shadow-neutral-200/50',
        success: 'bg-green-50 text-green-600 shadow-green-200/50',
        warning: 'bg-orange-50 text-orange-600 shadow-orange-200/50',
        error: 'bg-red-50 text-red-600 shadow-red-200/50',
    };

    const cardLink = user ? `/services/${service.slug}` : `/login?redirect=/services/${service.slug}`;

    return (
        <Link
            href={cardLink}
            onMouseMove={handleMouseMove}
            className={`flex flex-col w-full h-full bg-white border rounded-[56px] p-12 transition-all duration-700 hover:-translate-y-3 hover:shadow-premium-layered group relative overflow-visible ${themeClasses[service.color as keyof typeof themeClasses] || themeClasses.primary
                }`}
        >
            {/* OneKit 3.0: Dynamic Spotlight Effect */}
            <div
                className="absolute inset-0 rounded-[56px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 92, 255, 0.04), transparent 40%)`
                }}
            />

            {/* OneKit 3.0: Noise Texture Overlay */}
            <div className="texture-noise absolute inset-0 rounded-[56px] z-0" />

            {/* Header: Icon (Left) & Badge (Right) */}
            <div className="flex justify-between items-start mb-12 relative z-10">
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-2xl translate-z-10 ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary
                    }`}>
                    <ServiceIcon type={service.icon} className="w-12 h-12" />
                </div>

                <div className="flex flex-col items-end gap-3 pt-4">
                    {/* Status Badge (Dashboard only) */}
                    {status === 'active' && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100/50 shadow-sm animate-fade-in">
                            <CheckCircle2 size={12} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                    )}

                    {/* Price/Type Badge */}
                    <div className="flex items-center">
                        {customPriceLabel ? (
                            <span className="px-5 py-2 bg-neutral-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.25em] shadow-xl">
                                {customPriceLabel}
                            </span>
                        ) : service.isFree ? (
                            <span className="px-5 py-2 bg-white text-green-700 text-[10px] font-black rounded-full uppercase tracking-[0.25em] border border-green-200 shadow-sm">
                                Free Tool
                            </span>
                        ) : service.priceLabel ? (
                            <span className="px-5 py-2 bg-primary-900 text-white text-[10px] font-black rounded-full uppercase tracking-[0.25em] border border-primary-800 shadow-xl">
                                {service.priceLabel}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative z-10">
                <span className="text-[11px] font-bold text-primary-500 uppercase tracking-[0.4em] mb-4 block opacity-80 group-hover:opacity-100 transition-opacity">
                    {service.category || 'Professional Suite'}
                </span>
                <h3 className="text-4xl font-black text-neutral-900 mb-6 group-hover:text-primary-950 transition-colors tracking-tight leading-[1.1] font-display">
                    {service.name}
                </h3>
                <p className="text-xl text-neutral-500 leading-relaxed mb-12 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                    {service.description}
                </p>
            </div>

            {/* Footer Link: OneKit 3.0 Polish */}
            <div className="flex items-center justify-between relative z-10 mt-auto">
                <div className="flex items-center gap-4 text-primary-600 font-black text-[13px] uppercase tracking-widest transition-all group-hover:gap-6">
                    <span className="whitespace-nowrap">Launch Editor</span>
                    <div className="w-12 h-px bg-primary-100 group-hover:w-20 transition-all duration-700" />
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-2 flex-shrink-0" />
                </div>

                {/* Subtle numbering for grid rhythm */}
                <span className="text-neutral-100 font-display font-black text-6xl absolute -bottom-4 right-0 group-hover:text-neutral-200/50 transition-colors pointer-events-none select-none">
                    0{service.id || '?'}
                </span>
            </div>

            {/* OneKit 3.0: Glass Border Highlight */}
            <div className="absolute inset-0 rounded-[56px] border border-white/40 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
