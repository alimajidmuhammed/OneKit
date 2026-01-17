// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { NAV_ITEMS } from '@/lib/utils/constants';
import styles from './Header.module.css';

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

    // Scroll-based section tracking
    useEffect(() => {
        // Only run on homepage
        if (pathname !== '/') {
            setActiveSection(pathname);
            return;
        }

        const sections = ['services', 'pricing', 'contact'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in middle of viewport
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const newActive = sectionId ? `/#${sectionId}` : '/';
                    // Debounce to prevent rapid flickering
                    setTimeout(() => setActiveSection(newActive), 100);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        // Observe hero section (top of page)
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
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <img src="/onekit-logo.png" alt="OneKit" className={styles.logoImg} />
                    <span className={styles.logoText}>OneKit</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${activeSection === item.href ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Actions */}
                <div className={styles.actions}>
                    {auth.loading ? (
                        <div className={styles.skeleton} />
                    ) : user ? (
                        <>
                            <Link href="/dashboard" className={styles.dashboardBtn}>
                                Dashboard
                            </Link>

                            <div className={styles.profile}>
                                <button
                                    className={styles.profileBtn}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    aria-expanded={isProfileOpen}
                                >
                                    <div className={styles.avatar}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name || 'User'} />
                                        ) : (
                                            <span>{profile?.full_name?.[0] || user.email[0].toUpperCase()}</span>
                                        )}
                                    </div>
                                    <svg className={styles.chevron} viewBox="0 0 24 24" fill="none">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className={styles.overlay} onClick={() => setIsProfileOpen(false)} />
                                        <div className={styles.dropdown}>
                                            <div className={styles.dropdownHeader}>
                                                <p className={styles.userName}>{profile?.full_name || 'User'}</p>
                                                <p className={styles.userEmail}>{user.email}</p>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <Link href="/dashboard" className={styles.dropdownItem}>
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                                Dashboard
                                            </Link>
                                            <Link href="/dashboard/settings" className={styles.dropdownItem}>
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M12 1v4m0 14v4M1 12h4m14 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                                Settings
                                            </Link>
                                            {isAdmin && (
                                                <Link href="/admin" className={styles.dropdownItem}>
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                    </svg>
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <div className={styles.dropdownDivider} />
                                            <button onClick={handleSignOut} className={`${styles.dropdownItem} ${styles.signOut}`}>
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.loginBtn}>
                                Sign In
                            </Link>
                            <Link href="/register" className={styles.registerBtn}>
                                Get Started
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.mobileToggle}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                <nav className={styles.mobileNav}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.mobileNavLink} ${activeSection === item.href ? styles.active : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <div className={styles.mobileDivider} />
                            <Link href="/dashboard" className={styles.mobileNavLink}>
                                Dashboard
                            </Link>
                            <Link href="/dashboard/settings" className={styles.mobileNavLink}>
                                Settings
                            </Link>
                            <button onClick={handleSignOut} className={`${styles.mobileNavLink} ${styles.logoutBtn}`}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={styles.mobileDivider} />
                            <Link href="/login" className={styles.mobileNavLink}>
                                Sign In
                            </Link>
                            <Link href="/register" className={`${styles.mobileNavLink} ${styles.highlight}`}>
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
