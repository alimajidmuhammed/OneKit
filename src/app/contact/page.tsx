import { useState } from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import { ArrowLeft, MessageSquare, Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = `Hi OneKit! My name is ${formData.name}.\n\nSubject: ${formData.subject}\n\n${formData.message}\n\nEmail: ${formData.email}`;
        window.open(getWhatsAppLink(APP_CONFIG.whatsapp.number, message), '_blank');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary-900 selection:text-white pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-20 space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-100 text-sm font-black text-neutral-400 hover:text-primary-500 hover:border-primary-100 transition-all shadow-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-100">
                            Support Protocol
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-neutral-900 tracking-tighter leading-tight">
                            How can we <span className="text-primary-500 italic">assist you?</span>
                        </h1>
                        <p className="text-xl text-neutral-400 font-medium max-w-2xl mx-auto">
                            Connect with our technical directives for immediate resolution.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Contact Directives */}
                    <div className="lg:col-span-4 space-y-6">
                        <a
                            href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hello! I have a question about OneKit.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-premium-layered hover:-translate-y-1 transition-all group block"
                        >
                            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                <MessageSquare size={24} />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 mb-2">WhatsApp Direct</h3>
                            <p className="text-neutral-500 font-medium mb-4 text-sm">Response under 2 hours during active ops.</p>
                            <span className="inline-flex items-center gap-2 text-primary-500 font-black text-[11px] uppercase tracking-widest">
                                Initialize Chat <Send size={12} />
                            </span>
                        </a>

                        <a
                            href="mailto:support@onekit.com"
                            className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-premium-layered hover:-translate-y-1 transition-all group block"
                        >
                            <div className="w-14 h-14 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all">
                                <Mail size={24} />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 mb-2">Neural Support</h3>
                            <p className="text-neutral-500 font-medium mb-4 text-sm">support@onekit.com</p>
                            <span className="inline-flex items-center gap-2 text-primary-500 font-black text-[11px] uppercase tracking-widest">
                                Archive Request <Send size={12} />
                            </span>
                        </a>
                    </div>

                    {/* Contact Form Bento */}
                    <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[40px] border border-neutral-100 shadow-premium-layered relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-neutral-900 tracking-tight mb-8">Send a Dispatch</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Your Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Enter full name"
                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="you@domain.com"
                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Subject Header</label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                        placeholder="Technical Inquiry, Partnership, etc."
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-2">Message Body</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        rows={5}
                                        placeholder="Describe your requirement in detail..."
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-10 py-5 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/25 hover:bg-primary-600 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    Transmit Message <Send size={16} />
                                </button>

                                {submitted && (
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-fade-in-up mt-4">
                                        <CheckCircle2 size={18} />
                                        Protocol Initialized. Redirecting to WhatsApp...
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
