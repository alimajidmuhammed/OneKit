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
        <section id="services" className="py-32 lg:py-48 bg-white overflow-visible relative">
            {/* OneKit 3.0: Subtle Section Divider */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-neutral-50/50 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="max-w-5xl mx-auto mb-24 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-12 animate-fade-in-up">
                    <div className="flex-1">
                        <span className="inline-block px-5 py-2 bg-primary-50 text-primary-700 text-xs font-black rounded-full uppercase tracking-[0.3em] border border-primary-100/50 mb-6">Master Ecosystem</span>
                        <h2 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter leading-[0.95] mb-4">
                            Tools for <br />
                            <span className="bg-brand-gradient bg-clip-text text-transparent italic px-1">Modern Iraq.</span>
                        </h2>
                    </div>
                    <p className="text-xl md:text-2xl text-neutral-500 lg:max-w-md font-medium leading-relaxed opacity-80">
                        A specialized digital infrastructure designed for the specific needs of Iraqi high-performers. One ecosystem, infinite possibilities.
                    </p>
                </div>

                {/* OneKit 3.0: Bento Grid with Enhanced Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 auto-rows-fr overflow-visible">
                    {services.map((service, index) => {
                        // Make Menu Maker a flagship card (col-span-2)
                        const isFlagship = service.slug === 'menu-maker';
                        return (
                            <div
                                key={service.id || service.slug}
                                className={`overflow-visible animate-fade-in-up ${isFlagship ? 'lg:col-span-2' : 'col-span-1'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <ServiceCard service={{ ...service, id: index + 1 }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
