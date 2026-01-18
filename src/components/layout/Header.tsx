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
            ? 'bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-16'
            : 'bg-white h-[72px] border-b border-transparent'
            }`}>

            <div className="w-full max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group relative z-[20]">
                    <img
                        src="/onekit-logo.png"
                        alt="OneKit"
                        className="w-auto transition-transform group-hover:scale-105"
                        style={{ height: '36px', minHeight: '36px' }}
                    />
                    <span className="font-display font-extrabold text-2xl text-primary-900 tracking-tight">OneKit</span>
                </Link>


                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 translate-x-4">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-sm font-bold transition-all hover:text-primary-600 hover:scale-105 ${activeSection === item.href ? 'text-primary-600' : 'text-neutral-600'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>



                {/* Auth Actions */}
                <div className="flex items-center gap-2 sm:gap-4 relative z-[20]">

                    {auth.loading ? (
                        <div className="w-24 h-9 bg-neutral-100 animate-pulse rounded-xl" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="hidden sm:inline-flex bg-primary-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors">
                                Dashboard
                            </Link>

                            <div className="relative">
                                <button
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-50 transition-colors"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    aria-expanded={isProfileOpen}
                                >
                                    <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white overflow-hidden border-2 border-white shadow-sm">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold">{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-neutral-100 shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                                            <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                                                <p className="font-bold text-neutral-900 truncate">{profile?.full_name || 'User'}</p>
                                                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                            </div>
                                            <div className="p-2">
                                                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors">
                                                    <LayoutGrid size={18} className="text-neutral-400" />
                                                    Dashboard
                                                </Link>
                                                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors">
                                                    <Settings size={18} className="text-neutral-400" />
                                                    Settings
                                                </Link>
                                                {isAdmin && (
                                                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors">
                                                        <ShieldCheck size={18} className="text-primary-600" />
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <div className="h-px bg-neutral-100 my-2" />
                                                <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
                        <div className="hidden sm:flex items-center gap-4">
                            <Link href="/login" className="text-sm font-bold text-neutral-600 hover:text-primary-600 transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register" className="bg-primary-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors shadow-lg">
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-100 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[80vh] py-6' : 'max-h-0'
                }`}>
                <nav className="flex flex-col gap-4 px-6 font-semibold">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-lg py-2 transition-colors ${activeSection === item.href ? 'text-primary-600' : 'text-neutral-600'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="h-px bg-neutral-100 my-2" />
                    {user ? (
                        <>
                            <Link href="/dashboard" className="text-lg py-2 text-neutral-600">Dashboard</Link>
                            <Link href="/dashboard/settings" className="text-lg py-2 text-neutral-600">Settings</Link>
                            <button onClick={handleSignOut} className="text-lg py-2 text-red-600 text-left">Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-lg py-2 text-neutral-600">Sign In</Link>
                            <Link href="/register" className="text-lg py-3 text-white bg-primary-900 rounded-xl text-center">Get Started</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
