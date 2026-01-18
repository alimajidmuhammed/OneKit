import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServerAuthHeader from '@/components/layout/ServerAuthHeader';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/services/ServicesSection';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';

/**
 * OneKit Landing Page - Migrated to Tailwind CSS
 * High-performance, SEO-optimized, and premium designed.
 */
export default function HomePage() {
  return (
    <>
      <ServerAuthHeader />

      <main className="min-h-screen overflow-x-hidden bg-white">
        {/* Light Mode Professional Hero */}
        <section className="relative pt-[180px] pb-[120px] bg-white overflow-hidden">
          {/* Soft Glow Effects */}
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(10,36,114,0.03)_0%,transparent_70%)] blur-[80px] z-[1]"></div>
          <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(20,184,166,0.05)_0%,transparent_70%)] blur-[80px] z-[1]"></div>

          <div className="container mx-auto px-6 md:px-10 lg:px-12 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.1] text-neutral-900 mb-6 tracking-tight">
                Craft Your Professional <span className="bg-brand-gradient bg-clip-text text-transparent">Identity.</span>
              </h1>
              <p className="text-xl font-normal text-neutral-500 leading-relaxed mb-10 max-w-[540px] mx-auto lg:ml-0">
                The premium all-in-one suite for Iraqi professionals. Build high-end CVs, Menus, and Invoices with a platform designed for perfection.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 mb-12 justify-center lg:justify-start">
                <Button asChild size="lg" className="rounded-2xl group">
                  <Link href="/register">
                    Get Started Free
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14m-7-7l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl">
                  <a href="#services">Explore Services</a>
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center items-center mt-12 lg:mt-0">
              <div className="w-full max-w-[500px] rounded-[32px] bg-white p-3 border border-neutral-100 shadow-2xl relative z-20 transform transition-all duration-500 hover:scale-[1.02]">
                <img src="/images/platform-showcase.png" alt="OneKit Platform Showcase" className="w-full h-auto rounded-[24px] block" />
                <div className="absolute -bottom-10 left-[10%] right-[10%] h-5 bg-black/10 blur-[30px] rounded-[50%] z-[-1]"></div>
              </div>
              {/* Decorative background element for mobile */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-50/50 blur-[100px] rounded-full z-[0] lg:hidden"></div>
            </div>

          </div>
        </section>

        {/* Services Section */}
        <div id="services">
          <ServicesSection />
        </div>

        {/* Professionals Section - Light Refined */}
        <section className="py-24 lg:py-32 bg-neutral-50 border-t border-neutral-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4 tracking-tight">Engineered for Professionals</h2>
              <p className="text-xl text-neutral-500">Sophisticated tools tailored for the Iraqi business ecosystem.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[32px] border border-neutral-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-premium-hover hover:border-primary-100 group">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 transition-colors group-hover:bg-primary-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">Enterprise Quality</h3>
                <p className="text-neutral-500 leading-relaxed">High-resolution outputs that command respect from clients and employers.</p>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-neutral-100 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-primary-100 group">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 transition-colors group-hover:bg-primary-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">Max Efficiency</h3>
                <p className="text-neutral-500 leading-relaxed">Eliminate repetitive tasks with our high-speed automated editor engine.</p>
              </div>

              <div className="bg-white p-10 rounded-[32px] border border-neutral-100 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:border-primary-100 group">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 transition-colors group-hover:bg-primary-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-neutral-900">24/7 Support</h3>
                <p className="text-neutral-500 leading-relaxed">Localized help whenever you need it via WhatsApp and live chat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-4">Pricing</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">Simple, Per-Service Pricing</h2>
              <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                Pay only for what you need. One-time yearly subscriptions with no hidden fees.
              </p>
            </div>

            <div className="flex flex-col gap-16">
              {/* Free Forever Group */}
              <div className="flex flex-col gap-6">
                <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
                  Free Forever
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Link href="/services/cv-maker" className="bg-white p-8 border border-neutral-100 rounded-[32px] transition-all duration-500 hover:border-primary-100 hover:shadow-premium-hover group">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold group-hover:text-primary-600 transition-colors">CV Maker</h4>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">FREE</span>
                    </div>
                    <p className="text-neutral-500">Professional templates for your career.</p>
                  </Link>
                  <Link href="/services/invoice-maker" className="bg-white p-8 border border-neutral-100 rounded-[32px] transition-all duration-500 hover:border-primary-100 hover:shadow-premium-hover group">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xl font-bold group-hover:text-primary-600 transition-colors">Invoice Maker</h4>
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">FREE</span>
                    </div>
                    <p className="text-neutral-500">Expert billing for small businesses.</p>
                  </Link>
                </div>
              </div>

              {/* Premium Tools Group */}
              <div className="flex flex-col gap-6">
                <h3 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                  <span className="w-2 h-8 bg-accent-500 rounded-full"></span>
                  Premium Tools
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Link href="/services/menu-maker" className="bg-primary-950 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-premium-hover">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 blur-[60px]"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-2">Menu Maker</h4>
                          <span className="px-3 py-1 bg-accent-500/20 text-accent-400 text-xs font-bold rounded-full border border-accent-500/30">Most Popular</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap">25,000</div>
                          <div className="text-xs sm:text-sm text-neutral-400 whitespace-nowrap">IQD / Year</div>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 text-neutral-300">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                          Unlimited Digital Menus
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                          QR Code Integration
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                          Multi-language Support
                        </li>
                      </ul>
                      <div className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-4 rounded-2xl text-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-accent-600/20 active:scale-[0.98]">Select Menu Maker</div>
                    </div>
                  </Link>

                  <Link href="/services/qr-generator" className="bg-white p-8 border-2 border-primary-950 rounded-[32px] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-premium-hover">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-2xl font-bold text-neutral-900 mb-2">QR Generator</h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl sm:text-3xl font-bold text-neutral-900 whitespace-nowrap">10,000</div>
                          <div className="text-xs sm:text-sm text-neutral-500 whitespace-nowrap">IQD / Year</div>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-8 text-neutral-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                          Dynamic QR Tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                          Scan Analytics Dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                          Custom Branding & Colors
                        </li>
                      </ul>
                      <div className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl text-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary-900/20 active:scale-[0.98]">Select QR Generator</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 bg-primary-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-gradient opacity-10"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-primary-200 mb-10">Join thousands of professionals using OneKit to create amazing things.</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" variant="outline" className="bg-white border-none hover:bg-primary-50 rounded-2xl shadow-2xl">
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="accent"
                  className="rounded-2xl shadow-2xl"
                >
                  <a
                    href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contact on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
