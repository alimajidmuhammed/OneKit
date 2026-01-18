// @ts-nocheck
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_NAV } from '@/lib/utils/constants';
import { LayoutDashboard, BarChart3, Users, Monitor, CreditCard, DollarSign, Shield, Settings, ArrowLeft, LogOut, Menu, X, Loader2 } from 'lucide-react';

const iconMap = {
    dashboard: LayoutDashboard,
    analytics: BarChart3,
    users: Users,
    services: Monitor,
    subscription: CreditCard,
    payment: DollarSign,
    roles: Shield,
    settings: Settings,
};

export default function AdminLayout({ children }) {
    const { user, profile, loading, signOut, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/admin');
        } else if (!loading && user && !isAdmin) {
            router.push('/dashboard');
        }
    }, [user, loading, isAdmin, router]);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                <p className="text-neutral-400 font-medium tracking-tight">Synchronizing Protocol...</p>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 items-center px-4 gap-3 z-50 hidden lg:hidden flex">
                <button
                    className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-transparent border-none cursor-pointer p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-neutral-900" />
                    ) : (
                        <Menu className="w-6 h-6 text-neutral-900" />
                    )}
                </button>
                <span className="text-lg font-black text-neutral-900 tracking-tighter">OneKit <span className="text-primary-500">Admin</span></span>
            </header>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-72 bg-white border-r border-neutral-100 flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-neutral-100">
                    <Link href="/" className="flex items-center gap-3 no-underline group">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-6 transition-all duration-500">
                            <img src="/onekit-logo.png" alt="OneKit" className="h-5 w-5 invert" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-neutral-900 tracking-tighter leading-none">OneKit</span>
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mt-1">Master Admin</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
                    {ADMIN_NAV.map((item) => {
                        const IconComponent = iconMap[item.icon] || LayoutDashboard;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all relative group ${isActive
                                    ? 'text-primary-600 bg-primary-50'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                    }`}
                            >
                                <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                                {item.label}
                                {isActive && (
                                    <span className="absolute left-0 w-1.5 h-6 bg-primary-500 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="h-px bg-neutral-800 my-4" />

                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 no-underline rounded-lg hover:text-white hover:bg-neutral-800 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                </nav>

                <div className="p-6 border-t border-neutral-100 bg-neutral-50/30 flex items-center gap-4">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 border-2 border-white shadow-lg overflow-hidden ring-1 ring-primary-100">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-sm font-black text-neutral-900 truncate">{profile?.full_name || 'Admin'}</span>
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{profile?.role || 'admin'}</span>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-100 rounded-xl cursor-pointer text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 lg:ml-72 min-h-screen bg-[#F8FAFC] pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
