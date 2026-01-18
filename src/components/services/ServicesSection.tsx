// @ts-nocheck
'use client';

import { useServices } from '@/lib/hooks/useServices';
import ServiceCard from '@/components/services/ServiceCard';

/**
 * ServicesSection - Fixed Grid Layout
 * Ensures 1/2/3 column layout with equal height cards and no overlapping.
 */
export default function ServicesSection() {
    const { services, loading } = useServices();

    if (loading) {
        return (
            <section id="services" className="py-24 lg:py-40 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 animate-pulse">
                        <div className="h-8 w-48 bg-neutral-100 rounded-full mx-auto mb-6" />
                        <div className="h-16 w-3/4 bg-neutral-100 rounded-2xl mx-auto mb-8" />
                        <div className="h-6 w-full max-w-md bg-neutral-100 rounded-full mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[480px] bg-neutral-50 rounded-[48px] animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="services" className="py-24 lg:py-40 bg-white overflow-visible">
            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="max-w-4xl mx-auto mb-20 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex-1">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-4">Ecosystem</span>
                        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter">Tools Built for <br /> <span className="bg-brand-gradient bg-clip-text text-transparent italic">Perfectionists.</span></h2>
                    </div>
                    <p className="text-xl text-neutral-500 lg:max-w-md">Our specialized editor landscape allows you to create high-resolution assets with unprecedented speed and efficiency.</p>
                </div>

                {/* Grid Container - auto-rows-fr ensures equal height */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr overflow-visible">
                    {services.map((service) => (
                        <ServiceCard key={service.id || service.slug} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
}
