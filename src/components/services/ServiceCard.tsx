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
            className={`flex flex-col w-full h-full bg-white border border-neutral-100 rounded-[48px] p-8 md:p-10 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 group relative overflow-hidden`}
        >
            {/* Monst: Dynamic Spotlight Effect */}
            <div
                className="absolute inset-0 rounded-[48px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.05), transparent 40%)`
                }}
            />

            {/* Header: Icon (Left) & Badge (Right) */}
            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[24px] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 translate-z-10 ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary
                    }`}>
                    <ServiceIcon type={service.icon} className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                <div className="flex flex-col items-end gap-3 pt-2">
                    {/* Price/Type Badge */}
                    <div className="flex items-center">
                        {customPriceLabel ? (
                            <span className="px-5 py-2 bg-primary-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
                                {customPriceLabel}
                            </span>
                        ) : service.isFree ? (
                            <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">
                                Free
                            </span>
                        ) : (
                            <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-primary-100">
                                {service.priceLabel || 'Premium'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative z-10">
                <h3 className="text-3xl md:text-4xl font-black text-[#1E293B] mb-4 group-hover:text-primary-500 transition-colors tracking-tight leading-[1.1] font-display">
                    {service.name}
                </h3>
                <p className="text-lg text-neutral-500 leading-relaxed mb-10 font-medium group-hover:text-neutral-600 transition-colors">
                    {service.description}
                </p>
            </div>

            {/* Footer Link: Monst Style */}
            <div className="flex items-center justify-between relative z-10 mt-auto">
                <div className="flex items-center gap-2 text-primary-500 font-black text-[14px] transition-all">
                    <span>Explore Tool</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </div>

                <span className="text-neutral-100 font-display font-black text-6xl absolute -bottom-4 right-0 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none select-none">
                    0{service.id || '?'}
                </span>
            </div>
        </Link>
    );
}
