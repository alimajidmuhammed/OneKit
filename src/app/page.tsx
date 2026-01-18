import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ServerAuthHeader from '@/components/layout/ServerAuthHeader';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/services/ServicesSection';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import {
  Rocket,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Globe,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

/**
 * OneKit Landing Page 2.0 - Rebuilt for Maximum Impact
 * Features a high-end Bento grid, animated hero, and premium professional aesthetic.
 */
export default function HomePage() {
  return (
    <>
      <ServerAuthHeader />

      <main className="min-h-screen overflow-x-hidden bg-white pt-header selection:bg-primary-100 selection:text-primary-900">

        {/* --- HERO SECTION: Impact & Clarity --- */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(10,36,114,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.03),transparent_40%)]">
          {/* Animated Background Orbs */}
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-100/30 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent-100/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* Badge Reveal */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-full shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-sm font-bold text-neutral-600 uppercase tracking-widest leading-none">Standard of Excellence In Iraq</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-neutral-900 mb-8 leading-[1] tracking-tighter animate-reveal">
              The Professional <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">Operating System.</span>
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

            {/* Hero Showcase Mockup */}
            <div className="mt-20 relative px-4 max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative z-20 rounded-[40px] border border-white/50 bg-white p-2 shadow-[0_50px_100px_-20px_rgba(10,36,114,0.15)] ring-1 ring-neutral-200/50">
                <div className="rounded-[32px] overflow-hidden bg-neutral-50 aspect-[16/9] lg:aspect-[21/9]">
                  <img
                    src="/images/platform-showcase.png"
                    alt="OneKit Platform Experience"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
              {/* Decorative Glow behind mockup */}
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

        {/* --- BENTO SERVICES SECTION --- */}
        <section id="services" className="py-24 lg:py-40 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto mb-20 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-4">Ecosystem</span>
                <h2 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter">Tools Built for <br /> <span className="bg-brand-gradient bg-clip-text text-transparent italic">Perfectionists.</span></h2>
              </div>
              <p className="text-xl text-neutral-500 lg:max-w-md">Our specialized editor landscape allows you to create high-resolution assets with unprecedented speed and efficiency.</p>
            </div>

            <ServicesSection />
          </div>
        </section>

        {/* --- VALUE PROPOSITION: BENTO STYLE --- */}
        <section className="py-24 lg:py-40 bg-neutral-950 text-white overflow-hidden rounded-[80px_80px_0_0] lg:rounded-[120px_120px_0_0]">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

              {/* Feature Big Card */}
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 lg:p-16 rounded-[48px] relative overflow-hidden group">
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
              <div className="lg:col-span-4 bg-accent-600 p-10 lg:p-12 rounded-[48px] flex flex-col justify-between group cursor-default">
                <Globe className="text-white w-10 h-10 group-hover:rotate-12 transition-transform" />
                <div>
                  <div className="text-6xl lg:text-7xl font-black mb-4 tracking-tighter">99.9%</div>
                  <p className="text-lg font-bold text-accent-100 uppercase tracking-widest">Uptime for your digital assets</p>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="lg:col-span-4 bg-primary-900 p-10 lg:p-12 rounded-[48px] flex flex-col justify-between group border border-white/10 hover:border-primary-500 transition-colors">
                <ShieldCheck className="text-primary-300 w-10 h-10" />
                <div>
                  <div className="text-5xl font-black mb-4 tracking-tighter text-white">Bank-Grade</div>
                  <p className="text-lg font-bold text-primary-300 uppercase tracking-widest">Secure Data Encryption</p>
                </div>
              </div>

              {/* Feature Text Card */}
              <div className="lg:col-span-8 bg-neutral-900 border border-white/5 p-10 lg:p-12 rounded-[48px] relative overflow-hidden">
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
                  <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl rotate-3 flex items-center justify-center p-8 group-hover:rotate-6 transition-transform">
                    <Users className="text-white w-24 h-24" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- PRICING SECTION: CRYSTAL CLEAR --- */}
        <section id="pricing" className="py-24 lg:py-40 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-bold rounded-full uppercase tracking-widest border border-primary-100 mb-6">Investment</span>
              <h2 className="text-4xl md:text-6xl font-black text-neutral-900 mb-8 tracking-tighter leading-tight">Simple Pricing for <br /> Serious Professionals.</h2>
              <p className="text-xl text-neutral-500">No monthly surprises. One-time yearly subscriptions designed for business growth.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Free Tier */}
              <div className="bg-neutral-50 p-10 lg:p-16 rounded-[48px] border border-neutral-100 hover:border-neutral-200 transition-all group">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">Essential Suite</h3>
                    <p className="text-neutral-400">Perfect for individuals getting started.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-neutral-900">Free</div>
                    <div className="text-xs font-bold text-neutral-400 tracking-widest uppercase">Forever</div>
                  </div>
                </div>
                <ul className="space-y-4 mb-12">
                  <li className="flex items-center gap-3 text-neutral-600 font-medium">
                    <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" /> Professional CV Maker
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600 font-medium">
                    <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" /> Professional Invoice Maker
                  </li>
                  <li className="flex items-center gap-3 text-neutral-600 font-medium opacity-40">
                    <CheckCircle2 className="text-neutral-300 w-5 h-5 flex-shrink-0" /> Digital Menu Maker
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full h-16 text-lg tracking-wide rounded-2xl group-hover:bg-primary-900 group-hover:text-white group-hover:border-primary-900 transition-all">
                  <Link href="/register">Start with Free</Link>
                </Button>
              </div>

              {/* Premium Tier */}
              <div className="bg-primary-950 p-10 lg:p-16 rounded-[48px] relative overflow-hidden text-white shadow-[0_40px_80px_-15px_rgba(10,36,114,0.3)] group border border-primary-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-12">
                    <div>
                      <div className="inline-block px-3 py-1 bg-accent-500/20 border border-accent-500/30 text-accent-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Recommended</div>
                      <h3 className="text-2xl font-bold text-white mb-2">Power Tools</h3>
                      <p className="text-primary-200/60">Unlock your full business potential.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl lg:text-4xl font-black text-accent-400">10k-25k</div>
                      <div className="text-[10px] font-bold text-primary-400 tracking-widest uppercase mt-1">IQD / Per Service / Year</div>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-12">
                    <li className="flex items-center gap-3 text-primary-100 font-medium">
                      <CheckCircle2 className="text-accent-400 w-5 h-5 flex-shrink-0" /> Unlimited Digital Menus
                    </li>
                    <li className="flex items-center gap-3 text-primary-100 font-medium">
                      <CheckCircle2 className="text-accent-400 w-5 h-5 flex-shrink-0" /> Dynamic QR Code Engine
                    </li>
                    <li className="flex items-center gap-3 text-primary-100 font-medium">
                      <CheckCircle2 className="text-accent-400 w-5 h-5 flex-shrink-0" /> Real-time Analytics Dashboard
                    </li>
                    <li className="flex items-center gap-3 text-primary-100 font-medium">
                      <CheckCircle2 className="text-accent-400 w-5 h-5 flex-shrink-0" /> Enterprise-grade Customization
                    </li>
                  </ul>
                  <Button asChild variant="accent" className="w-full h-16 text-lg tracking-wide rounded-2xl shadow-premium-hover">
                    <Link href="/register">Go Premium Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA: REVEAL STYLE --- */}
        <section id="contact" className="py-24 lg:py-48 bg-brand-gradient relative overflow-hidden animate-background-drift">
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="max-w-4xl mx-auto glass-premium p-12 md:p-24 rounded-[64px] border border-white/20 shadow-2xl">
              <Sparkles className="w-16 h-16 text-primary-900 mx-auto mb-8 animate-float" />
              <h2 className="text-4xl md:text-7xl font-black text-primary-950 mb-8 tracking-tighter">Own Your Future.</h2>
              <p className="text-xl md:text-2xl text-primary-900/70 mb-12 max-w-2xl mx-auto font-medium">Join the professional elite using OneKit to dominate the Iraqi digital landscape.</p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button asChild size="lg" className="h-16 px-12 text-lg rounded-2xl bg-primary-950 hover:bg-black text-white shadow-2xl">
                  <Link href="/register">Create Your Account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 text-lg rounded-2xl border-white bg-white/20 hover:bg-white/40 text-primary-950 font-bold backdrop-blur-md"
                >
                  <a
                    href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    Direct Support
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
