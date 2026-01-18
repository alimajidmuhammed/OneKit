// @ts-nocheck
'use client';

import { useServices } from '@/lib/hooks/useServices';
import ServiceCard from '@/components/services/ServiceCard';

/**
 * ServicesSection - OneKit 3.0 Bento Grid
 * Features entrance animations and refined visual hierarchy.
 */
export default function ServicesSection() {
    const { services, loading } = useServices();

    if (loading) {
        return (
            <section id="services" className="py-24 lg:py-40 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[520px] bg-neutral-50 rounded-[56px] animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="services" className="py-24 lg:py-32 bg-white overflow-visible relative">
            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="max-w-4xl mx-auto mb-20 text-center animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[11px] font-black rounded-full uppercase tracking-widest border border-primary-100 mb-6">Master Ecosystem</span>
                    <h2 className="text-4xl md:text-6xl font-black text-neutral-900 leading-tight tracking-tight mb-8">
                        The Tools Your Vision <br />
                        <span className="text-primary-500">Actually Deserves</span>
                    </h2>
                    <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Precision-engineered digital modules designed specifically for the Iraqi creative economy.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {services.map((service, index) => (
                        <div
                            key={service.id || service.slug}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <ServiceCard service={{ ...service, id: index + 1 }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
