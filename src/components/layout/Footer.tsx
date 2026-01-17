// @ts-nocheck
import Link from 'next/link';
import { APP_CONFIG, SERVICES, NAV_ITEMS } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import { Facebook, Instagram, Send, MessageCircle } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-50 border-t border-neutral-100 pt-20 pb-10">
            <div className="w-full max-w-7xl mx-auto px-6">
                {/* Top Section */}
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="inline-block mb-6 group">
                            <img
                                src="/logo.png"
                                alt="OneKit"
                                className="w-auto transition-transform group-hover:scale-105"
                                style={{ height: '40px', minHeight: '40px' }}
                            />
                        </Link>

                        <p className="text-neutral-500 text-lg leading-relaxed mb-8 max-w-sm">
                            {APP_CONFIG.tagline}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:border-primary-100 hover:shadow-md transition-all transition-colors" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-pink-600 hover:border-pink-100 hover:shadow-md transition-all transition-colors" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a
                                href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-green-600 hover:border-green-100 hover:shadow-md transition-all transition-colors"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold text-neutral-900 mb-6 tracking-wide uppercase text-xs">Services</h4>
                            <ul className="space-y-4">
                                {SERVICES.slice(0, 4).map((service) => (
                                    <li key={service.slug}>
                                        <Link href={`/services/${service.slug}`} className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">{service.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-neutral-900 mb-6 tracking-wide uppercase text-xs">Company</h4>
                            <ul className="space-y-4">
                                <li><Link href="/about" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">About Us</Link></li>
                                <li><Link href="/pricing" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Pricing</Link></li>
                                <li><Link href="/contact" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Contact</Link></li>
                                <li className="hidden sm:block"><Link href="/faq" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">FAQ</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-neutral-900 mb-6 tracking-wide uppercase text-xs">Legal</h4>
                            <ul className="space-y-4">
                                <li><Link href="/privacy" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Terms of Service</Link></li>
                                <li className="hidden sm:block"><Link href="/refund" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Refund Policy</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-neutral-900 mb-6 tracking-wide uppercase text-xs">Support</h4>
                            <ul className="space-y-4">
                                <li><Link href="/help" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Help Center</Link></li>
                                <li>
                                    <a
                                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi, I need help with OneKit.')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium"
                                    >
                                        WhatsApp Support
                                    </a>
                                </li>
                                <li className="hidden sm:block"><Link href="/feedback" className="text-neutral-500 hover:text-primary-600 transition-colors text-sm font-medium">Feedback</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-10 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-neutral-400 text-sm font-medium">
                        © {currentYear} {APP_CONFIG.name}. All rights reserved.
                    </p>
                    <p className="text-neutral-400 text-sm font-medium">
                        Made with ❤️ for Iraqi creators everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
