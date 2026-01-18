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
            className={`flex flex-col w-full bg-white border rounded-[32px] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group ${themeClasses[service.color as keyof typeof themeClasses] || themeClasses.primary
                }`}
        >
            <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${iconBgClasses[service.color as keyof typeof iconBgClasses] || iconBgClasses.primary
                    }`}>
                    <ServiceIcon type={service.icon} className="w-8 h-8" />
                </div>

                <div className="flex flex-col items-end gap-1">
                    {customPriceLabel ? (
                        <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full uppercase tracking-wider">{customPriceLabel}</span>
                    ) : service.isFree ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Free</span>
                    ) : service.priceLabel ? (
                        <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">{service.priceLabel}</span>
                    ) : null}
                </div>
            </div>

            <div className="flex-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block">
                    {service.category || 'Tool'}
                </span>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-primary-900 transition-colors">
                    {service.name}
                </h3>
                <p className="text-neutral-500 leading-relaxed mb-8">
                    {service.description}
                </p>
            </div>

            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm group-hover:gap-3 transition-all">
                Explore Tool
                <ArrowRight size={18} />
            </div>
        </Link>
    );
}
