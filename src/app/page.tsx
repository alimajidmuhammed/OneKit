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
 * OneKit 2.0 - The Professional Operating System
 * Rebuilt for Perfect Layout and Visual Excellence.
 */
export default function HomePage() {
  return (
    <>
      <ServerAuthHeader />

      <main className="min-h-screen overflow-x-hidden bg-white pt-header selection:bg-primary-100 selection:text-primary-900">

        {/* --- HERO SECTION --- 
            Optimized for high-impact entrance and clarity.
        */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(10,36,114,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.03),transparent_40%)]">
          {/* Animated Background Elements */}
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-100/30 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent-100/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-full shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-sm font-bold text-neutral-600 uppercase tracking-widest leading-none">Standard of Excellence In Iraq</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 mb-8 leading-[1.1] tracking-tighter animate-reveal">
              The Professional <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent italic">Operating System.</span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-500 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              OneKit provides the high-end digital infrastructure used by Iraq's elite professionals. Build stunning CVs, Menus, and Invoices with mathematical precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild size="lg" className="h-16 px-10 text-lg rounded-2xl group shadow-2xl">
                <Link href="/register">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 text-lg rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl">
                <a href="#services">Research Services</a>
              </Button>
            </div>

            {/* Hero Showcase */}
            <div className="mt-20 relative px-4 max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-20 rounded-[48px] border border-white/50 bg-white p-2 shadow-[0_50px_100px_-20px_rgba(10,36,114,0.15)] ring-1 ring-neutral-200/50">
                <div className="rounded-[40px] overflow-hidden bg-neutral-50 aspect-[16/9] lg:aspect-[21/9]">
                  <img
                    src="/images/platform-showcase.png"
                    alt="OneKit Platform Experience"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
              <div className="absolute -inset-10 bg-brand-gradient opacity-10 blur-[100px] z-10 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* --- TRUST BAR --- */}
        <div className="py-12 border-y border-neutral-100 bg-white/50 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm font-bold text-neutral-400 uppercase tracking-[0.3em] mb-8">Trusted by industry leaders across Iraq</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale group">
              <div className="h-8 w-32 bg-neutral-300 rounded-md animate-pulse" />
              <div className="h-8 w-32 bg-neutral-300 rounded-md animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-8 w-32 bg-neutral-300 rounded-md animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="h-8 w-32 bg-neutral-300 rounded-md animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>

        {/* --- FIXED SERVICES SECTION --- 
            Integrated with the core layout logic.
        */}
        <ServicesSection />

        {/* --- VALUE PROPOSITION --- */}
        <section className="py-24 lg:py-40 bg-neutral-950 text-white overflow-hidden rounded-t-[80px] lg:rounded-t-[120px]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 auto-rows-fr">

              {/* Feature Big Card */}
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 lg:p-16 rounded-[64px] relative overflow-hidden group z-10">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[100px] rounded-full -mr-40 -mt-40 group-hover:bg-primary-500/20 transition-colors" />
                <Zap className="text-accent-400 w-12 h-12 mb-8" />
                <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Lightning Fast Output. <br /> Zero Compromise.</h3>
                <p className="text-xl text-neutral-400 max-w-xl mb-12">OneKit's automated engine handles the complex layout logic, allowing you to focus purely on high-impact content delivery.</p>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-accent-500 w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Instant PDF Export</h4>
                      <p className="text-neutral-500 text-sm">Print-ready CMYK files at your fingertips.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="text-accent-500 w-6 h-6 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Vector Clarity</h4>
                      <p className="text-neutral-500 text-sm">Infinite scalability for billboards or business cards.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 1 */}
              <div className="lg:col-span-4 bg-accent-600 p-10 lg:p-12 rounded-[64px] flex flex-col justify-between group cursor-default">
                <Globe className="text-white w-10 h-10 group-hover:rotate-12 transition-transform" />
                <div>
                  <div className="text-6xl lg:text-7xl font-black mb-4 tracking-tighter">99.9%</div>
                  <p className="text-lg font-bold text-accent-100 uppercase tracking-widest">Uptime for your digital assets</p>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="lg:col-span-4 bg-primary-900 p-10 lg:p-12 rounded-[64px] flex flex-col justify-between group border border-white/10 hover:border-primary-500 transition-all">
                <ShieldCheck className="text-primary-300 w-10 h-10" />
                <div>
                  <div className="text-5xl font-black mb-4 tracking-tighter text-white">Bank-Grade</div>
                  <p className="text-lg font-bold text-primary-300 uppercase tracking-widest">Secure Data Encryption</p>
                </div>
              </div>

              {/* Enterprise Feature Card */}
              <div className="lg:col-span-8 bg-neutral-900 border border-white/5 p-10 lg:p-16 rounded-[64px] relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1">
                    <h3 className="text-3xl font-black mb-6">Built for the <br /> Iraqi Enterprise.</h3>
                    <p className="text-neutral-400 leading-relaxed mb-8">We've spent years understanding the local business landscape. From IQD currency handling to localized template styles, OneKit is built for YOU.</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10">IQD Support</span>
                      <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10">Bilingual Arabic/English</span>
                      <span className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold border border-white/10">Local Payments</span>
                    </div>
                  </div>
                  <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-primary-500 to-accent-500 rounded-[40px] rotate-3 flex items-center justify-center p-8 group-hover:rotate-6 transition-transform">
                    <Users className="text-white w-24 h-24" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-24 lg:py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-6">Investment</span>
              <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tighter leading-tight">Simple Pricing for <br /> Serious Professionals.</h2>
              <p className="text-xl text-neutral-500">No monthly surprises. One-time yearly subscriptions designed for business growth.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Free Tier */}
              <div className="bg-neutral-50 p-10 lg:p-16 rounded-[64px] border border-neutral-100 hover:border-neutral-200 transition-all group">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Essential</h3>
                    <p className="text-neutral-500">Perfect for exploring the platform.</p>
                  </div>
                  <span className="px-4 py-1 bg-white border border-neutral-200 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-400">Current</span>
                </div>
                <div className="mb-12">
                  <div className="text-5xl font-black text-neutral-900 mb-1">$0</div>
                  <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest">Always free</p>
                </div>
                <ul className="space-y-4 mb-12">
                  <li className="flex items-center gap-3 text-neutral-600">
                    <CheckCircle2 className="text-neutral-300 w-5 h-5 flex-shrink-0" />
                    <span>Basic CV Templates</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <CheckCircle2 className="text-neutral-300 w-5 h-5 flex-shrink-0" />
                    <span>Single QR Generator</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600">
                    <CheckCircle2 className="text-neutral-300 w-5 h-5 flex-shrink-0" />
                    <span>Standard PDF Export</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full h-16 rounded-2xl text-lg group bg-white">
                  Get Started
                  <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              {/* Pro Tier */}
              <div className="bg-neutral-900 p-10 lg:p-16 rounded-[64px] border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl">
                <div className="absolute top-0 right-0 px-8 py-2 bg-accent-500 text-white text-xs font-black uppercase tracking-widest rounded-bl-3xl">Most Popular</div>
                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-white">Genesis Pro</h3>
                    <p className="text-neutral-400">The complete professional suite.</p>
                  </div>
                </div>
                <div className="mb-12 relative z-10">
                  <div className="text-5xl font-black text-white mb-1">$150<span className="text-xl text-neutral-500 font-medium">/yr</span></div>
                  <p className="text-sm text-accent-400 font-bold uppercase tracking-widest">Best value for experts</p>
                </div>
                <ul className="space-y-4 mb-12 relative z-10">
                  <li className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="text-accent-500 w-5 h-5 flex-shrink-0" />
                    <span>All Enterprise Editors</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="text-accent-500 w-5 h-5 flex-shrink-0" />
                    <span>Unlimited Cloud Sync</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="text-accent-500 w-5 h-5 flex-shrink-0" />
                    <span>Custom Branding & Themes</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-300">
                    <CheckCircle2 className="text-accent-500 w-5 h-5 flex-shrink-0" />
                    <span>Priority Expert Support</span>
                  </li>
                </ul>
                <Button className="w-full h-16 rounded-2xl text-lg group bg-brand-gradient hover:opacity-90 transition-opacity border-none shadow-xl">
                  Go Pro Now
                  <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                {/* Background Accent */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA SECTION --- */}
        <section className="py-24 lg:py-40 bg-neutral-950 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="relative bg-brand-gradient rounded-[80px] p-12 lg:p-24 text-center overflow-hidden group">
              {/* Dynamic Flowing Background */}
              <div className="absolute inset-0 opacity-20 animate-background-drift" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">Ready to Elevate Your <br /> Iraqi Enterprise?</h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">Join the 5,000+ professionals who trust OneKit for their high-end digital infrastructure.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary-900 hover:bg-neutral-50 transition-colors shadow-2xl">
                    <Link href="/register">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-white/30 text-white hover:bg-white/10 transition-colors">
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>

              {/* Decorative Orbs */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
