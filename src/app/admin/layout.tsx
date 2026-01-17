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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                <p className="text-neutral-400">Loading...</p>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-15 bg-neutral-900 items-center px-4 gap-3 z-50 hidden lg:hidden flex">
                <button
                    className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-transparent border-none cursor-pointer p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Menu className="w-6 h-6 text-white" />
                    )}
                </button>
                <span className="text-lg font-semibold text-white">OneKit Admin</span>
            </header>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-70 bg-neutral-900 flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-neutral-800">
                    <Link href="/admin" className="flex items-center gap-3 no-underline">
                        <div className="w-9 h-9 text-primary-400">
                            <Shield className="w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">OneKit</span>
                            <span className="text-xs text-primary-400 uppercase tracking-wider">Admin</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    {ADMIN_NAV.map((item) => {
                        const IconComponent = iconMap[item.icon] || LayoutDashboard;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium no-underline rounded-lg mb-1 transition-all ${isActive
                                        ? 'text-white bg-primary-600 hover:bg-primary-700'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="h-px bg-neutral-800 my-4" />

                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 no-underline rounded-lg hover:text-white hover:bg-neutral-800 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                </nav>

                <div className="p-4 border-t border-neutral-800 flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {profile?.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</span>
                            <span className="text-xs text-neutral-500 capitalize">{profile?.role || 'admin'}</span>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="w-9 h-9 flex items-center justify-center bg-transparent border-none rounded-lg cursor-pointer text-neutral-500 transition-all hover:bg-neutral-800 hover:text-red-400"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 lg:ml-70 min-h-screen bg-neutral-950 pt-15 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
