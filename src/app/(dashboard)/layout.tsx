// @ts-nocheck
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DASHBOARD_NAV } from '@/lib/utils/constants';

/**
 * DashboardLayout - OneKit 3.0 Premium Edition
 * Migrated to pure Tailwind v4 with advanced glassmorphism and motion.
 */
export default function DashboardLayout({ children }) {
    const { user, profile, loading, signOut, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/dashboard');
        }
    }, [user, loading, router]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (loading || (!user && pathname.startsWith('/dashboard'))) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white animate-reveal">
                <div className="spinner" />
                <p className="text-neutral-500 font-medium tracking-wide">Initializing Ecosystem...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-neutral-50 selection:bg-primary-900 selection:text-white">
            {/* Mobile Header: Glassmorphism 2.0 */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-neutral-200/50 flex items-center px-6 gap-4 z-[1040] shadow-sm">
                <button
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-neutral-50/50 hover:bg-neutral-100 transition-colors"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <div className="relative w-5 h-4">
                        <span className={`absolute left-0 w-full h-0.5 bg-neutral-900 rounded-full transition-all ${sidebarOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                        <span className={`absolute left-0 w-full h-0.5 bg-neutral-900 rounded-full top-1.5 transition-opacity ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`absolute left-0 w-full h-0.5 bg-neutral-900 rounded-full transition-all ${sidebarOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
                    </div>
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <img src="/onekit-logo.png" alt="OneKit" className="h-8 w-auto" />
                    <span className="font-display font-black text-xl text-neutral-900 tracking-tighter">OneKit</span>
                </Link>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[1045] lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar: Premium Shell */}
            <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-neutral-200/50 z-[1050] flex flex-col transition-all duration-500 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-premium-layered`}>
                <div className="px-8 py-10 flex items-center justify-between border-b border-neutral-100/50">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/onekit-logo.png" alt="OneKit" className="h-10 w-auto" />
                        <span className="font-display font-black text-2xl text-primary-950 tracking-tighter">OneKit</span>
                    </Link>
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar space-y-2">
                    {DASHBOARD_NAV.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-[20px] font-bold text-sm transition-all duration-300 group ${isActive
                                        ? 'bg-primary-950 text-white shadow-premium-layered translate-x-1'
                                        : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-600'
                                    }`}
                            >
                                <div className={`transition-colors ${isActive ? 'text-white' : 'text-primary-400/50 group-hover:text-primary-500'}`}>
                                    <NavIcon type={item.icon} />
                                </div>
                                {item.label}
                            </Link>
                        );
                    })}

                    {isAdmin && (
                        <>
                            <div className="h-px bg-neutral-100/50 mx-4 my-6" />
                            <Link
                                href="/admin"
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-[20px] font-bold text-sm transition-all group ${pathname.startsWith('/admin')
                                        ? 'bg-accent-600 text-white shadow-lg'
                                        : 'text-neutral-500 hover:bg-neutral-50'
                                    }`}
                            >
                                <div className="text-accent-500/50 group-hover:text-accent-600">
                                    <NavIcon type="admin" />
                                </div>
                                Admin Panel
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-neutral-100/50 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-black text-sm relative overflow-hidden ring-4 ring-neutral-50">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                            )}
                            <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-neutral-900 truncate leading-none mb-1">{profile?.full_name || 'User'}</span>
                            <span className="text-[10px] font-bold text-neutral-400 truncate uppercase tracking-widest">{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                        title="Sign Out"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-[280px] min-h-screen pt-16 lg:pt-0 relative">
                {/* OneKit 3.0: Texture Overlay & Background Motion */}
                <div className="texture-noise absolute inset-0 opacity-[0.02] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />

                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavIcon({ type }) {
    const icons = {
        home: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M9 22V12h6v10" />
            </svg>
        ),
        services: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
        subscription: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z" />
                <path d="M1 10h22" />
            </svg>
        ),
        settings: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
        ),
        admin: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    };

    return icons[type] || icons.home;
}
