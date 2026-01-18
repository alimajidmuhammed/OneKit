// @ts-nocheck
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import {
    FileText,
    Utensils,
    QrCode,
    Receipt,
    Palette,
    CreditCard,
    ArrowRight
} from 'lucide-react';

/**
 * ServiceIcon - Maps service types to Lucide components
 */
const ServiceIcon = ({ type, className }: { type: string, className?: string }) => {
    const icons = {
        document: <FileText className={className} />,
        menu: <Utensils className={className} />,
        qr: <QrCode className={className} />,
        invoice: <Receipt className={className} />,
        logo: <Palette className={className} />,
        card: <CreditCard className={className} />,
    };

    return icons[type as keyof typeof icons] || icons.document;
};

export default function ServiceCard({ service, showStatus = false, customPriceLabel = null }: {
    service: any,
    showStatus?: boolean,
    customPriceLabel?: string | null
}) {
    const { user } = useAuth();
    const { getSubscriptionStatus } = useSubscription();

    const status = showStatus && user ? getSubscriptionStatus(service.slug) : null;

    // Color theme mapping
    const themeClasses = {
        primary: 'border-primary-100 hover:border-primary-200 group-hover:shadow-primary-100/20',
        accent: 'border-accent-100 hover:border-accent-200 group-hover:shadow-accent-100/20',
        success: 'border-green-100 hover:border-green-200 group-hover:shadow-green-100/20',
        info: 'border-blue-100 hover:border-blue-200 group-hover:shadow-blue-100/20',
        warning: 'border-orange-100 hover:border-orange-200 group-hover:shadow-orange-100/20',
    };

    const iconBgClasses = {
        primary: 'bg-primary-50 text-primary-600',
        accent: 'bg-accent-50 text-accent-600',
        success: 'bg-green-50 text-green-600',
        info: 'bg-blue-50 text-blue-600',
        warning: 'bg-orange-50 text-orange-600',
    };

    const cardLink = user ? `/services/${service.slug}` : `/login?redirect=/services/${service.slug}`;

    return (
        <Link
            href={cardLink}
            className={`flex flex-col w-full bg-white border rounded-[40px] p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-premium-hover group relative overflow-hidden ${themeClasses[service.color as keyof typeof themeClasses] || themeClasses.primary
                }`}
        >
            {/* Hover Glow Effect */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary}`} />

            <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary
                    }`}>
                    <ServiceIcon type={service.icon} className="w-10 h-10" />
                </div>

                <div className="flex flex-col items-end">
                    {customPriceLabel ? (
                        <span className="px-4 py-1.5 bg-neutral-100 text-neutral-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">{customPriceLabel}</span>
                    ) : service.isFree ? (
                        <span className="px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">Free</span>
                    ) : service.priceLabel ? (
                        <span className="px-4 py-1.5 bg-primary-50 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">{service.priceLabel}</span>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 relative z-10">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-3 block">
                    {service.category || 'Professional Tool'}
                </span>
                <h3 className="text-3xl font-black text-neutral-900 mb-4 group-hover:text-primary-900 transition-colors tracking-tight">
                    {service.name}
                </h3>
                <p className="text-lg text-neutral-500 leading-relaxed mb-10">
                    {service.description}
                </p>
            </div>

            <div className="flex items-center gap-3 text-primary-600 font-bold text-sm group-hover:gap-4 transition-all relative z-10">
                <span className="tracking-wide">Launch Enterprise Editor</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}
