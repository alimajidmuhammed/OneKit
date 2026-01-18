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

      <main className="min-h-screen overflow-x-hidden bg-white pt-header selection:bg-primary-900 selection:text-white">

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(10,36,114,0.04),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.04),transparent_50%)]">
          {/* OneKit 3.0: Texture Overlay */}
          <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />

          {/* Animated Background Elements */}
          <div className="absolute top-10 -right-20 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[140px] animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-neutral-100 rounded-full shadow-premium-layered mb-10 animate-fade-in-up">
              <span className="flex h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
              <span className="text-xs font-black text-neutral-800 uppercase tracking-[0.25em] leading-none">The standard of excellence in Iraq</span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] font-black text-neutral-900 mb-12 leading-[0.9] tracking-tighter animate-reveal selection:bg-primary-900 selection:text-white lg:-translate-x-2">
              The Digital <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent italic px-4">Ecosystem.</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '0.2s' }}>
              OneKit provides the high-end digital infrastructure used by the world's most demanding professionals. Pure precision in every pixel.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="h-20 px-14 text-xl rounded-[28px] group shadow-premium-layered bg-primary-900 hover:bg-primary-950 transition-all duration-500 btn-premium overflow-hidden">
                <Link href="/register">
                  Deploy OneKit
                  <ArrowRight className="ml-3 w-7 h-7 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-20 px-14 text-xl rounded-[28px] bg-white/40 backdrop-blur-md shadow-xl border-neutral-200 hover:border-primary-400 transition-all duration-500">
                <a href="#services">Research Features</a>
              </Button>
            </div>

            {/* Hero Showcase */}
            <div className="mt-32 relative px-4 max-w-7xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-20 rounded-[64px] border border-white/50 bg-white p-3 shadow-premium-layered ring-1 ring-neutral-200/50">
                <div className="rounded-[52px] overflow-hidden bg-neutral-50 aspect-[16/9] lg:aspect-[21/9]">
                  <img
                    src="/images/platform-showcase.png"
                    alt="OneKit Platform Experience"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
              <div className="absolute -inset-20 bg-brand-gradient opacity-[0.08] blur-[120px] z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* --- TRUST BAR --- */}
        <div className="py-20 border-y border-neutral-100 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm font-black text-neutral-400 uppercase tracking-[0.4em] mb-12 opacity-80">Trusted by industry leaders across Iraq</p>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
              <div className="h-10 w-40 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="h-10 w-40 bg-neutral-200 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-10 w-40 bg-neutral-200 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="h-10 w-40 bg-neutral-200 rounded-lg animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>

        {/* --- SERVICES SECTION --- */}
        <ServicesSection />

        {/* --- VALUE PROPOSITION --- */}
        <section className="py-32 lg:py-56 bg-neutral-950 text-white overflow-hidden rounded-t-[100px] lg:rounded-t-[160px] relative">
          <div className="texture-noise absolute inset-0 opacity-10 pointer-events-none" />

          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 auto-rows-fr">

              {/* Feature Big Card */}
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 p-12 lg:p-20 rounded-[72px] relative overflow-hidden group z-10 shadow-2xl transition-all duration-700 hover:bg-white/[0.08]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 blur-[120px] rounded-full -mr-40 -mt-40 group-hover:bg-primary-500/30 transition-colors" />
                <Zap className="text-accent-400 w-16 h-16 mb-10 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-4xl md:text-6xl font-black mb-8 leading-[0.95] tracking-tighter font-display">Lightning Fast Output. <br /> <span className="text-accent-500 italic">Zero Compromise.</span></h3>
                <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mb-16 leading-relaxed font-medium">OneKit's automated engine handles the complex layout logic, allowing you to focus purely on high-impact content delivery.</p>

                <div className="grid sm:grid-cols-2 gap-10">
                  <div className="flex items-start gap-5 group/item">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover/item:bg-accent-500/20 transition-colors">
                      <CheckCircle2 className="text-accent-500 w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2 tracking-tight">Instant PDF Export</h4>
                      <p className="text-neutral-500 text-lg">Print-ready CMYK files at your fingertips.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 group/item">
                    <div className="p-3 bg-white/5 rounded-2xl group-hover/item:bg-accent-500/20 transition-colors">
                      <CheckCircle2 className="text-accent-500 w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2 tracking-tight">Vector Clarity</h4>
                      <p className="text-neutral-500 text-lg">Infinite scalability for industrial formats.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 1 */}
              <div className="lg:col-span-4 bg-accent-600 p-12 lg:p-16 rounded-[72px] flex flex-col justify-between group cursor-default transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl">
                <Globe className="text-white w-12 h-12 group-hover:rotate-[30deg] transition-transform duration-700" />
                <div>
                  <div className="text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-none">99.9%</div>
                  <p className="text-xl font-black text-accent-100 uppercase tracking-[0.2em] leading-tight">Platform Uptime <br /> Guaranteed</p>
                </div>
              </div>

              {/* Enterprise Feature Card */}
              <div className="lg:col-span-8 bg-neutral-900 border border-white/5 p-12 lg:p-20 rounded-[72px] relative overflow-hidden group transition-all duration-700 hover:border-white/20">
                <div className="flex flex-col md:flex-row items-center gap-16">
                  <div className="flex-1">
                    <h3 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Built for the <br /> <span className="text-primary-400">Iraqi Enterprise.</span></h3>
                    <p className="text-xl text-neutral-400 leading-relaxed mb-12 font-medium">Localized IQD pricing, bilingual support, and local payment integration come standard. No workarounds needed.</p>
                    <div className="flex flex-wrap gap-4">
                      {['IQD Support', 'Arabic/English', 'Local Payments'].map((tag) => (
                        <span key={tag} className="px-6 py-2.5 bg-white/5 rounded-full text-xs font-black border border-white/10 uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-72 aspect-square bg-brand-gradient rounded-[56px] rotate-3 flex items-center justify-center p-12 group-hover:rotate-6 group-hover:scale-105 transition-all duration-700 shadow-2xl relative">
                    <Users className="text-white w-32 h-32 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-50 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="lg:col-span-4 bg-primary-900 p-12 lg:p-16 rounded-[72px] flex flex-col justify-between group border border-white/5 hover:border-primary-500/50 transition-all duration-700 shadow-xl">
                <ShieldCheck className="text-primary-300 w-12 h-12 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-none">Military <br /> Grade</div>
                  <p className="text-xl font-black text-primary-300 uppercase tracking-[0.2em] leading-tight">Secure Data <br /> Encryption</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-32 lg:py-56 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto mb-28">
              <span className="inline-block px-5 py-2 bg-primary-50 text-primary-700 text-xs font-black rounded-full uppercase tracking-[0.3em] border border-primary-100/50 mb-8">Premium Tiers</span>
              <h2 className="text-5xl md:text-8xl font-black text-neutral-900 mb-10 tracking-tighter leading-[0.9]">Simple Pricing. <br /> High Value.</h2>
              <p className="text-xl md:text-2xl text-neutral-500 font-medium leading-relaxed max-w-2xl mx-auto">No hidden fees. One-time yearly subscriptions designed for serious business growth.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              {/* Free Tier */}
              <div className="bg-neutral-50 p-12 lg:p-20 rounded-[80px] border border-neutral-100 hover:border-neutral-300 transition-all duration-700 group relative overflow-hidden">
                <div className="texture-noise absolute inset-0 opacity-[0.01]" />
                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div>
                    <h3 className="text-3xl font-black mb-3 tracking-tight">Essential</h3>
                    <p className="text-xl text-neutral-500 font-medium">Perfect for exploration.</p>
                  </div>
                  <span className="px-5 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">Current Plan</span>
                </div>
                <div className="mb-16 relative z-10">
                  <div className="text-7xl font-black text-neutral-900 mb-2 leading-none">$0</div>
                  <p className="text-xs text-neutral-400 font-black uppercase tracking-[0.3em]">Forever Free Access</p>
                </div>
                <ul className="space-y-6 mb-16 relative z-10">
                  {['Standard CV Templates', 'Basic QR Generation', 'Platform Access', 'Community Forum'].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-neutral-600 font-medium text-lg">
                      <CheckCircle2 className="text-neutral-300 w-6 h-6 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full h-18 text-lg rounded-[24px] border-neutral-200 text-neutral-400 cursor-not-allowed font-black uppercase tracking-widest relative z-10" disabled>
                  Active Plan
                </Button>
              </div>

              {/* Premium Tier */}
              <div className="bg-primary-950 p-12 lg:p-20 rounded-[80px] text-white relative overflow-hidden group shadow-premium-layered transition-all duration-700 hover:-translate-y-4">
                <div className="texture-noise absolute inset-0 opacity-10" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-primary-500/20 transition-colors" />

                <div className="flex justify-between items-start mb-16 relative z-10">
                  <div>
                    <h3 className="text-3xl font-black mb-3 tracking-tight">Pro Access</h3>
                    <p className="text-xl text-primary-200 font-medium opacity-80">Full ecosystem power.</p>
                  </div>
                  <span className="px-5 py-2 bg-primary-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">Most Popular</span>
                </div>
                <div className="mb-16 relative z-10">
                  <div className="text-7xl font-black mb-2 leading-none">$10<span className="text-2xl opacity-40 font-medium">/yr</span></div>
                  <p className="text-xs text-primary-300 font-black uppercase tracking-[0.3em]">Full Enterprise Suite</p>
                </div>
                <ul className="space-y-6 mb-16 relative z-10">
                  {['Menu Maker (All Themes)', 'CV Maker (Premium Templates)', 'Invoice Maker (White-label)', 'Bulk QR Generator', 'Priority 24/7 Support'].map((item) => (
                    <li key={item} className="flex items-center gap-4 text-primary-50 font-medium text-lg">
                      <CheckCircle2 className="text-accent-500 w-6 h-6 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-20 text-xl rounded-[24px] bg-white text-primary-900 hover:bg-white/90 transition-all duration-500 font-black uppercase tracking-widest shadow-2xl btn-premium overflow-hidden border-none transform group-hover:scale-[1.02]">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-32 lg:py-56 bg-neutral-950 text-white overflow-hidden relative">
          <div className="texture-noise absolute inset-0 opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,92,255,0.08),transparent_70%)] animate-pulse-glow" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-black mb-12 tracking-tighter leading-[0.85] animate-reveal">
              Ready to <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent italic px-4">Innovate?</span>
            </h2>
            <p className="text-xl md:text-3xl text-neutral-400 max-w-3xl mx-auto mb-20 leading-relaxed font-medium">
              Join Iraq's fastest-growing professional ecosystem today. No credit card required to explore.
            </p>
            <Button asChild size="lg" className="h-24 px-16 text-2xl rounded-[32px] bg-white text-primary-900 hover:bg-white/90 transition-all duration-500 group shadow-2xl btn-premium border-none">
              <Link href="/register">
                Initialize System
                <ChevronRight className="ml-3 w-8 h-8 transition-transform group-hover:translate-x-3" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-white border-t border-neutral-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
              <img src="/onekit-logo.png" alt="OneKit" className="h-10 w-auto" />
              <span className="font-display font-black text-3xl text-primary-900 tracking-tighter">OneKit</span>
            </div>
            <div className="flex gap-10 text-sm font-black text-neutral-400 uppercase tracking-widest">
              <Link href="/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
            </div>
            <p className="text-neutral-400 text-sm font-medium">© 2026 OneKit Ecosystem. Built with precision.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
