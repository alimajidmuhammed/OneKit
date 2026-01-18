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
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          {/* OneKit 3.0: High-Fidelity Background Architecture */}
          <div className="absolute inset-0 bg-[#050505] z-0" />
          <div className="texture-noise absolute inset-0 opacity-[0.05] pointer-events-none z-10" />

          {/* Dynamic Mesh Gradients */}
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[140px] animate-pulse-slow opacity-60 z-0" />
          <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[120px] animate-pulse-slow opacity-40 z-0" style={{ animationDelay: '3s' }} />

          {/* Orbiting Elements for Depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border border-white/[0.03] rounded-full z-0 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] border border-white/[0.02] rounded-full z-0 pointer-events-none" />

          <div className="container mx-auto px-6 relative z-20 text-center">
            {/* High-End Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-12 animate-fade-in-up shadow-2xl">
              <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-[10px] font-black text-primary-200 uppercase tracking-[0.4em] leading-none">Iraq's Professional OS</span>
            </div>

            <h1 className="font-display text-5xl md:text-8xl lg:text-[11rem] font-black text-white mb-10 leading-[0.85] tracking-tighter animate-reveal">
              Absolute <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent italic px-2">Perfection.</span>
            </h1>

            <p className="text-lg md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-16 leading-relaxed animate-fade-in-up font-medium" style={{ animationDelay: '0.2s' }}>
              OneKit 3.0 provides the digital infrastructure used by the world's most demanding professionals. Pure precision in every pixel.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="h-18 md:h-20 px-10 md:px-14 text-lg md:text-xl rounded-[24px] md:rounded-[28px] group shadow-2xl bg-white text-primary-950 hover:bg-white/90 transition-all duration-500 btn-premium overflow-hidden border-none cursor-pointer">
                <Link href="/register">
                  Deploy OneKit
                  <ArrowRight className="ml-3 w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-18 md:h-20 px-10 md:px-14 text-lg md:text-xl rounded-[24px] md:rounded-[28px] bg-white/5 backdrop-blur-xl shadow-xl border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer">
                <a href="#services">Research Modules</a>
              </Button>
            </div>

            {/* Hero Showcase: Floating Viewport */}
            <div className="mt-32 relative px-4 max-w-7xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-20 rounded-[48px] md:rounded-[64px] border border-white/10 bg-white/5 backdrop-blur-3xl p-2 md:p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="rounded-[40px] md:rounded-[52px] overflow-hidden bg-neutral-900 aspect-[16/10] lg:aspect-[21/9]">
                  <img
                    src="/images/platform-showcase.png"
                    alt="OneKit Platform Experience"
                    className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-1000 opacity-90"
                  />
                </div>
              </div>
              <div className="absolute -inset-20 bg-primary-600/20 blur-[120px] z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* --- TRUST BAR --- */}
        <div className="py-20 bg-[#050505] overflow-hidden relative border-y border-white/[0.03]">
          <div className="container mx-auto px-6 relative z-10">
            <p className="text-center text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-12 opacity-60">Trusted by industry leaders across Iraq</p>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>

        {/* --- SERVICES SECTION --- */}
        <div className="bg-[#050505] py-20">
          <ServicesSection />
        </div>

        {/* --- VALUE PROPOSITION: BENTO PROTOCOL --- */}
        <section className="py-32 lg:py-56 bg-[#050505] text-white overflow-hidden relative">
          <div className="texture-noise absolute inset-0 opacity-5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,92,255,0.03),transparent_70%)] pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-fr">

              {/* High-Impact Feature Card */}
              <div className="lg:col-span-8 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 md:p-16 rounded-[48px] md:rounded-[64px] relative overflow-hidden group transition-all duration-700 hover:bg-white/[0.04] hover:border-white/10 cursor-default">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full -mr-40 -mt-40 group-hover:bg-primary-500/20 transition-colors duration-1000" />
                <Zap className="text-accent-400 w-14 h-14 mb-10 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-4xl md:text-6xl font-black mb-8 leading-[0.95] tracking-tighter">Lightning Speed. <br /> <span className="text-accent-500 italic">Zero Compromise.</span></h3>
                <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-16 leading-relaxed font-medium">OneKit's automated engine handles complex layout logic, allowing you to focus purely on high-impact content delivery.</p>

                <div className="grid sm:grid-cols-2 gap-10">
                  {[
                    { title: 'Instant Export', desc: 'Print-ready high-dpi files.' },
                    { title: 'Vector Clarity', desc: 'Infinite scalability.' }
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-4">
                      <div className="p-2 bg-white/5 rounded-xl"><CheckCircle2 className="text-accent-500 w-6 h-6" /></div>
                      <div>
                        <h4 className="font-black text-lg mb-1 tracking-tight">{f.title}</h4>
                        <p className="text-neutral-500 text-sm font-medium">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uptime Stat Card */}
              <div className="lg:col-span-4 bg-accent-600 p-10 md:p-16 rounded-[48px] md:rounded-[64px] flex flex-col justify-between group transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_rgba(20,184,166,0.3)] shadow-xl cursor-default">
                <Globe className="text-white w-12 h-12 group-hover:rotate-[30deg] transition-transform duration-1000" />
                <div>
                  <div className="text-7xl md:text-8xl font-black mb-6 tracking-tighter leading-none">99.9%</div>
                  <p className="text-lg font-black text-accent-100 uppercase tracking-[0.2em] leading-tight">Uptime Guaranteed</p>
                </div>
              </div>

              {/* Localization Feature Card */}
              <div className="lg:col-span-12 bg-neutral-900/50 border border-white/5 p-10 md:p-16 rounded-[48px] md:rounded-[64px] relative overflow-hidden group transition-all duration-700 hover:border-white/10 cursor-default">
                <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                  <div className="flex-1">
                    <h3 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Native to the <br /> <span className="text-primary-400">Iraqi Professional.</span></h3>
                    <p className="text-lg text-neutral-400 leading-relaxed mb-12 font-medium max-w-xl">Localized IQD pricing, bilingual support, and local payment integration come standard. No workarounds needed.</p>
                    <div className="flex flex-wrap gap-3">
                      {['IQD Native', 'Bilingual Support', 'Local Gateway'].map((tag) => (
                        <span key={tag} className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black border border-white/10 uppercase tracking-widest">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-80 aspect-video bg-brand-gradient rounded-[40px] flex items-center justify-center p-12 group-hover:scale-105 transition-transform duration-1000 shadow-2xl relative overflow-hidden">
                    <Users className="text-white w-24 h-24 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-1000" />
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

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-32 lg:py-64 bg-[#050505] text-white overflow-hidden relative">
          <div className="texture-noise absolute inset-0 opacity-5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,92,255,0.1),transparent_70%)] opacity-60" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl md:text-8xl lg:text-[11rem] font-black mb-12 tracking-tighter leading-[0.8] animate-reveal">
              The Next <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent italic px-2">Ecosystem.</span>
            </h2>
            <p className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-20 leading-relaxed font-medium">
              Join Iraq's fastest-growing professional network today. Experience digital symmetry.
            </p>
            <Button asChild size="lg" className="h-20 md:h-24 px-12 md:px-16 text-xl md:text-2xl rounded-3xl bg-white text-primary-950 hover:bg-neutral-100 transition-all duration-500 group shadow-[0_20px_60px_-15px_rgba(255,255,255,0.2)] btn-premium border-none cursor-pointer">
              <Link href="/register">
                Initialize System
                <ChevronRight className="ml-3 w-7 h-7 md:w-8 md:h-8 transition-transform group-hover:translate-x-3" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-[#050505] border-t border-white/[0.03] text-neutral-500">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center p-1.5 shadow-xl">
                <img src="/onekit-logo.png" alt="OneKit" className="w-full h-full object-contain invert" />
              </div>
              <span className="font-display font-black text-2xl text-white tracking-tighter">OneKit</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-[9px] font-black uppercase tracking-[0.3em]">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Inquiries</Link>
            </div>
            <p className="text-[10px] font-bold tracking-widest opacity-60">© 2026 ONEKIT OPERATING SYSTEM. ALL RIGHTS SECURED.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
