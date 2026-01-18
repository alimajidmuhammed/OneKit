// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  ShieldCheck,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServicesSection from '@/components/services/ServicesSection';
import ServerAuthHeader from '@/components/layout/ServerAuthHeader';

/**
 * OneKit 3.0 - The Master Operating System
 * Rebuilt for Absolute Perfection and Visual Impact.
 */
export default function HomePage() {
  return (
    <>
      <ServerAuthHeader />

      <main className="min-h-screen overflow-x-hidden bg-background pt-header">

        {/* --- HERO SECTION: MONST PROTOCOL --- */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
          {/* Organic Blobs */}
          <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-[#FEF08A]/40 rounded-full blur-[100px] animate-pulse-soft z-0" />
          <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-[120px] animate-pulse-soft z-0" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-[#1E293B] mb-8 leading-[1.1] tracking-tight animate-fade-in-up">
              Committed to Professionals <br />
              <span className="text-primary-500">Committed to the Future</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '0.2s' }}>
              We are <span className="text-primary-600 font-bold">OneKit</span>, Iraq's leading digital infrastructure for creative professionals and high-impact enterprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="h-16 px-10 text-base font-black rounded-2xl bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/25 active:scale-95 border-none">
                <Link href="/register">Key Features</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 text-base font-black rounded-2xl bg-white border-neutral-100 text-neutral-600 hover:bg-neutral-50 transition-all shadow-sm">
                <a href="#services">How We Work?</a>
              </Button>
            </div>

            {/* Hero Showcase: Clean Dashboard Preview */}
            <div className="mt-24 relative px-4 max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-20 rounded-[40px] border border-white bg-white/40 backdrop-blur-md p-3 shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-700">
                <img
                  src="/images/platform-showcase.png"
                  alt="OneKit Platform Experience"
                  className="w-full h-full object-cover rounded-[32px] opacity-95 shadow-inner"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-200/20 blur-[80px] z-10 pointer-events-none rounded-full" />
            </div>
          </div>
        </section>

        {/* --- TRUST BAR --- */}
        <div className="py-20 border-y border-neutral-100 bg-neutral-50/30 overflow-hidden relative">
          <div className="container mx-auto px-6">
            <p className="text-center text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-12 opacity-80">Trusted by 2,000+ professionals across Iraq</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {['AsiaCell', 'Zain', 'Korek', 'BusinessIQ'].map((brand) => (
                <span key={brand} className="text-2xl font-black text-neutral-400 tracking-tighter">{brand}</span>
              ))}
            </div>
          </div>
        </div>

        {/* --- SERVICES SECTION --- */}
        <section id="services" className="bg-white">
          <ServicesSection />
        </section>

        {/* --- VALUE PROPOSITION: MONST CARDS --- */}
        <section className="py-24 lg:py-32 bg-background overflow-hidden relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 text-[11px] font-black rounded-full uppercase tracking-widest border border-primary-100">Our Protocol</span>
                <h2 className="text-4xl md:text-6xl font-black text-neutral-900 leading-tight tracking-tight">Infrastructure for <br /> <span className="text-primary-500">The Modern Iraqi Era</span></h2>
                <p className="text-lg text-neutral-500 font-medium leading-relaxed">We provide the tools. You provide the vision. Together, we build the digital future of the region with absolute precision.</p>

                <ul className="space-y-6">
                  {[
                    { title: 'Bilingual Core', desc: 'Native support for Arabic and English workflows.' },
                    { title: 'Local Integration', desc: 'Secure payments via FastPay and local gateways.' },
                    { title: 'Enterprise Security', desc: 'Military grade encryption for your sensitive data.' }
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4 items-start group">
                      <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">{item.title}</h4>
                        <p className="text-sm text-neutral-500 font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-10 bg-primary-100/50 rounded-full blur-[100px] animate-pulse-soft" />
                <div className="relative bg-white p-8 rounded-[48px] shadow-2xl border border-neutral-100 group">
                  <div className="aspect-square bg-neutral-50 rounded-[32px] flex items-center justify-center overflow-hidden border border-neutral-100">
                    <Zap className="w-32 h-32 text-primary-200 group-hover:text-primary-500 group-hover:scale-110 transition-all duration-700" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-neutral-100 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center text-white"><Globe className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Global Reach</p>
                        <p className="text-lg font-black text-neutral-900">99.9% Uptime</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-32 lg:py-56 bg-[#050505] relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto mb-28">
              <span className="inline-block px-5 py-2 bg-white/5 text-primary-200 text-[10px] font-black rounded-full uppercase tracking-[0.4em] border border-white/10 mb-8">Premium Protocol</span>
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-[0.9]">Simple Costs. <br /> High Impact.</h2>
              <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed max-w-2xl mx-auto">One-time yearly subscriptions designed for consistent professional growth. No hidden friction.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Free Tier: Professional Foundation */}
              <div className="bg-white/[0.02] backdrop-blur-3xl p-10 md:p-16 rounded-[48px] border border-white/5 hover:border-white/10 transition-all duration-700 group relative overflow-hidden cursor-default">
                <div className="texture-noise absolute inset-0 opacity-[0.02]" />
                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Essential</h3>
                    <p className="text-sm text-neutral-500 font-medium">Professional Base Layer</p>
                  </div>
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-400">Current Node</span>
                </div>
                <div className="mb-16 relative z-10">
                  <div className="text-7xl font-black text-white mb-2 leading-none">$0</div>
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">Free Forever</p>
                </div>
                <ul className="space-y-6 mb-16 relative z-10">
                  {['Standard Templates', 'Basic QR Engine', 'Core Platform Access'].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-neutral-400 font-medium">
                      <CheckCircle2 className="text-neutral-700 w-5 h-5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full h-18 text-base rounded-2xl border-white/5 text-neutral-600 cursor-not-allowed font-black uppercase tracking-widest relative z-10 bg-transparent" disabled>
                  Active Module
                </Button>
              </div>

              {/* Premium Tier: Enterprise Suite */}
              <div className="bg-primary-950 p-10 md:p-16 rounded-[48px] text-white relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(59,92,255,0.2)] transition-all duration-700 hover:-translate-y-4 cursor-default">
                <div className="texture-noise absolute inset-0 opacity-10" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-primary-500/20 transition-colors duration-1000" />

                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Pro Access</h3>
                    <p className="text-sm text-primary-200 font-medium opacity-80">Full Ecosystem Power</p>
                  </div>
                  <span className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-pulse">Advanced</span>
                </div>
                <div className="mb-16 relative z-10">
                  <div className="text-7xl font-black mb-2 leading-none">$10<span className="text-xl opacity-40 font-medium">/yr</span></div>
                  <p className="text-[10px] text-primary-300 font-black uppercase tracking-[0.3em]">Enterprise Infrastructure</p>
                </div>
                <ul className="space-y-6 mb-16 relative z-10">
                  {['All Premium Themes', 'White-label Export', 'Bulk QR Protocol', 'Priority Support'].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-primary-50 font-medium">
                      <CheckCircle2 className="text-accent-500 w-5 h-5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-20 text-lg rounded-2xl bg-white text-primary-950 hover:bg-neutral-100 transition-all duration-500 font-black uppercase tracking-widest shadow-2xl btn-premium border-none">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 lg:py-40 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px]" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tight">Ready to start your <br /> <span className="text-primary-500">Digital Journey?</span></h2>
            <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-12 font-medium">Join thousands of professionals who have already simplified their workflow with OneKit.</p>
            <Button asChild size="lg" className="h-16 px-12 text-base font-black rounded-2xl bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/25 border-none">
              <Link href="/register">Get Started Now</Link>
            </Button>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-background border-t border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white"><img src="/onekit-logo.png" className="w-4 h-4 invert" /></div>
                <span className="font-display font-black text-xl text-neutral-900">OneKit</span>
              </Link>
              <p className="text-neutral-500 font-medium max-w-sm">Iraq's most trusted digital toolkit for modern professionals. Precision at every scale.</p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-6">Connect</h4>
              <ul className="space-y-4 text-sm font-medium text-neutral-500">
                <li><Link href="/contact" className="hover:text-primary-500">Contact Sales</Link></li>
                <li><Link href="/support" className="hover:text-primary-500">Help Center</Link></li>
                <li><Link href="/blog" className="hover:text-primary-500">Product Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-neutral-500">
                <li><Link href="/terms" className="hover:text-primary-500">Terms of Use</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-500">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-neutral-100 gap-6">
            <p className="text-neutral-400 text-xs font-bold tracking-widest uppercase">© 2026 ONEKIT. BUILT IN BAGHDAD.</p>
            <div className="flex gap-6 text-neutral-400">
              <Globe className="w-5 h-5 hover:text-primary-500 cursor-pointer" />
              <Zap className="w-5 h-5 hover:text-primary-500 cursor-pointer" />
              <ShieldCheck className="w-5 h-5 hover:text-primary-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
