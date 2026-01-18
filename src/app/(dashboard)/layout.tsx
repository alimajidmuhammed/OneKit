// @ts-nocheck
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, LogOut, X } from 'lucide-react';
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
        <div className="flex min-h-screen bg-background">
            {/* Mobile Header: Monst Style */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-neutral-100 flex items-center px-6 gap-4 z-[1040] shadow-sm">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu className="w-5 h-5 text-neutral-600" />
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <img src="/onekit-logo.png" alt="OneKit" className="h-7 w-auto" />
                    <span className="font-display font-black text-xl text-neutral-900 tracking-tighter">OneKit</span>
                </Link>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-[1045] lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar: Monst Clean Shell */}
            <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-neutral-100 z-[1050] flex flex-col transition-all duration-500 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-8 py-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-all duration-500">
                            <img src="/onekit-logo.png" alt="OneKit" className="h-5 w-5 invert" />
                        </div>
                        <span className="font-display font-black text-2xl text-neutral-900 tracking-tighter">OneKit</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-900"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar space-y-1">
                    {DASHBOARD_NAV.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 relative group truncate ${isActive
                                    ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/25'
                                    : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-600'
                                    }`}
                            >
                                <div className={`transition-colors ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary-500'}`}>
                                    <NavIcon type={item.icon} />
                                </div>
                                {item.label}
                                {isActive && (
                                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                            </Link>
                        );
                    })}

                    {isAdmin && (
                        <>
                            <div className="h-px bg-neutral-100 mx-4 my-6" />
                            <Link
                                href="/admin"
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all group ${pathname.startsWith('/admin')
                                    ? 'bg-violet-500 text-white shadow-xl shadow-violet-500/25'
                                    : 'text-neutral-500 hover:bg-neutral-50'
                                    }`}
                            >
                                <div className={`${pathname.startsWith('/admin') ? 'text-white' : 'text-neutral-400 group-hover:text-violet-500'}`}>
                                    <NavIcon type="admin" />
                                </div>
                                Admin Panel
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-neutral-100 space-y-4">
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-neutral-50/50">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-sm border-2 border-white shadow-sm shrink-0">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <span>{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-neutral-900 truncate">{profile?.full_name || 'User'}</span>
                            <span className="text-[10px] font-bold text-neutral-400 truncate uppercase tracking-widest">{user.email}</span>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-xs text-red-500 hover:bg-red-50 transition-all active:scale-95 group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Sign Out System
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-[280px] min-h-screen pt-20 lg:pt-0 relative">
                {/* Organic Background Elements */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-primary-100/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#FEF08A]/20 rounded-full blur-[100px] pointer-events-none" />

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
