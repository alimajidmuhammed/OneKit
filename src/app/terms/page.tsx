import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | OneKit',
    description: 'OneKit Terms of Service - Read our terms and conditions.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary-900 selection:text-white pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-16 space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-100 text-sm font-black text-neutral-400 hover:text-primary-500 hover:border-primary-100 transition-all shadow-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-100">
                            Legal Protocol
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter leading-tight">
                            Terms of <span className="text-primary-500 italic">Service</span>
                        </h1>
                        <p className="text-sm text-neutral-400 font-black uppercase tracking-widest">
                            Last updated: January 2026
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white p-8 md:p-16 rounded-[48px] border border-neutral-100 shadow-premium-layered space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-sm">01</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-neutral-500 leading-relaxed font-medium pl-11">By accessing and using OneKit, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-sm">02</span>
                            Services Ecosystem
                        </h2>
                        <p className="text-neutral-500 leading-relaxed font-medium pl-11">OneKit provides a suite of professional tools including CV Maker, Menu Maker, QR Generator, Invoice Maker, Logo Maker, and Business Card Maker. Access to these services requires an active subscription.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-sm">03</span>
                            Subscriptions & Assets
                        </h2>
                        <div className="pl-11 space-y-4">
                            <p className="text-neutral-500 leading-relaxed font-medium">Subscriptions are provided on a per-service basis. Each subscription grants access to a specific tool for the duration of the subscription period (monthly or yearly).</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {['Non-transferable Protocol', 'No Auto-renewal Sync', 'Manual Renewal Required', 'Account-locked Access'].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-[11px] font-black text-neutral-400 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-sm">04</span>
                            Payment Directives
                        </h2>
                        <p className="text-neutral-500 leading-relaxed font-medium pl-11">All payments are processed manually via WhatsApp. Users must provide proof of payment which will be reviewed and approved by our team.</p>
                        <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Standard Cycle</span>
                                <span className="text-lg font-black text-neutral-900">15,000 IQD / Month</span>
                            </div>
                            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block mb-1">Nexus Annual</span>
                                <span className="text-lg font-black text-primary-600">150,000 IQD / Year</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-neutral-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center text-sm">05</span>
                            Governance & Contact
                        </h2>
                        <p className="text-neutral-500 leading-relaxed font-medium pl-11">OneKit retains all intellectual property rights to the platform. Content created by users belongs to them. For questions regarding these directives, initialize contact via our official channels.</p>
                    </section>
                </div>

                <div className="mt-12 flex items-center justify-center gap-4 text-neutral-400">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">End of Document Protocol</span>
                </div>
            </div>
        </div>
    );
}
