// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { NAV_ITEMS } from '@/lib/utils/constants';
import {
    LayoutGrid,
    Settings,
    User as UserIcon,
    ChevronDown,
    LogOut,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';

export default function Header({ initialUser = null, initialProfile = null }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('/');
    const auth = useAuth();
    const pathname = usePathname();

    // Use initial props if context is still loading, otherwise use context
    const user = auth.loading ? initialUser : (auth.user ?? initialUser);
    const profile = auth.loading ? initialProfile : (auth.profile ?? initialProfile);
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const signOut = auth.signOut;

    useEffect(() => {
        if (pathname !== '/') {
            setActiveSection(pathname);
            return;
        }

        const sections = ['services', 'pricing', 'contact'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const newActive = sectionId ? `/#${sectionId}` : '/';
                    setTimeout(() => setActiveSection(newActive), 100);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        const heroSection = document.querySelector('main > section:first-child');
        if (heroSection) observer.observe(heroSection);

        return () => observer.disconnect();
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await signOut();
        setIsProfileOpen(false);
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-[1030] transition-all duration-500 ${isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-neutral-100 shadow-sm h-16'
            : 'bg-transparent h-20'
            }`}>
            <div className="w-full max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative z-[20]">
                    <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-transform">
                        <img
                            src="/onekit-logo.png"
                            alt="OneKit"
                            className="w-5 h-5 object-contain invert"
                        />
                    </div>
                    <span className="font-display font-black text-2xl text-neutral-900 tracking-tight">OneKit</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map((item) => (
                        <div key={item.href} className="flex items-center">
                            <Link
                                href={item.href}
                                className={`px-4 py-2 text-sm font-bold transition-all hover:text-primary-500 relative flex items-center gap-1 ${activeSection === item.href ? 'text-primary-500' : 'text-neutral-700'
                                    }`}
                            >
                                {item.label}
                                {activeSection === item.href && (
                                    <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse mt-0.5" />
                                )}
                            </Link>
                            <span className="text-neutral-300 font-light opacity-50 last:hidden">.</span>
                        </div>
                    ))}
                </nav>

                {/* Auth Actions */}
                <div className="flex items-center gap-3 relative z-[20]">
                    {auth.loading ? (
                        <div className="w-20 h-9 bg-neutral-100 animate-pulse rounded-full" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="hidden sm:inline-flex bg-primary-500 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 active:scale-95">
                                Dashboard
                            </Link>

                            <div className="relative">
                                <button
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white transition-all border border-transparent hover:border-neutral-100"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 overflow-hidden border-2 border-white shadow-sm font-black">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm">{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl border border-neutral-100 shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-300">
                                            <div className="p-5 bg-neutral-50/50 border-b border-neutral-100">
                                                <p className="font-black text-neutral-900 truncate">{profile?.full_name || 'User'}</p>
                                                <p className="text-xs text-neutral-500 truncate font-medium">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-2xl transition-all">
                                                    <LayoutGrid size={18} />
                                                    Dashboard
                                                </Link>
                                                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-2xl transition-all">
                                                    <Settings size={18} />
                                                    Account Settings
                                                </Link>
                                                {isAdmin && (
                                                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-2xl transition-all">
                                                        <ShieldCheck size={18} />
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <div className="h-px bg-neutral-100 my-2 mx-2" />
                                                <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-3">
                            <Link href="/login" className="px-5 py-2.5 text-sm font-black text-primary-500 hover:bg-primary-50 rounded-full transition-all border border-primary-500/20">
                                Log In
                            </Link>
                            <Link href="/register" className="bg-primary-500 text-white px-7 py-2.5 rounded-full text-sm font-black hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 active:scale-95">
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 shadow-2xl transition-all duration-500 overflow-hidden ${isMobileMenuOpen ? 'max-h-[100vh] py-8 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <nav className="flex flex-col gap-2 px-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-2xl font-black py-3 px-4 rounded-2xl transition-all ${activeSection === item.href ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="h-px bg-neutral-100 my-4" />
                    {user ? (
                        <Link href="/dashboard" className="text-xl font-black py-4 px-6 text-white bg-primary-500 rounded-2xl text-center shadow-lg">Dashboard</Link>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <Link href="/login" className="text-lg font-black py-3 rounded-2xl border border-primary-500/20 text-primary-600 text-center">Log In</Link>
                            <Link href="/register" className="text-lg font-black py-3 text-white bg-primary-500 rounded-2xl text-center shadow-lg">Sign Up</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
