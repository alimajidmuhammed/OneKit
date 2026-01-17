// @ts-nocheck
'use client';

import { useServices } from '@/lib/hooks/useServices';
import ServiceCard from '@/components/services/ServiceCard';

export default function ServicesSection() {
    const { services, loading } = useServices();

    if (loading) {
        return (
            <section id="services" className="py-20 lg:py-32 bg-white">
                <div className="w-full max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-4 animate-pulse">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                            Everything You Need in One Place
                        </h2>
                        <div className="h-6 w-3/4 max-w-2xl mx-auto bg-neutral-100 animate-pulse rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[300px] bg-neutral-50 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="services" className="py-20 lg:py-32 bg-white">
            <div className="w-full max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-4">Our Services</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">
                        Everything You Need in One Place
                    </h2>
                    <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                        Choose from our collection of professional tools designed to help you create amazing things.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id || service.slug}
                            className="flex"
                            style={{
                                animation: 'fadeInUp 0.6s ease forwards',
                                animationDelay: `${index * 100}ms`,
                                opacity: 0,
                                transform: 'translateY(20px)'
                            }}
                        >
                            <ServiceCard service={service} />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}
