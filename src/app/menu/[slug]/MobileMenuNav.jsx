'use client';
import { useState, useEffect } from 'react';
import styles from './public-menu.module.css';

export default function MobileMenuNav({ categories, theme, menuName, logo_url }) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleNavClick = (catId) => {
        setIsOpen(false);
        setTimeout(() => {
            const element = document.getElementById(catId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const hasLogo = logo_url && typeof logo_url === 'string' && logo_url.length > 5;

    return (
        <>
            {/* Mobile Header Bar */}
            <div
                className={`${styles.mobileHeader} ${scrolled ? styles.mobileHeaderScrolled : ''}`}
                style={{
                    '--header-bg': theme.bg,
                    '--header-color': theme.primary,
                    '--header-accent': theme.accent,
                    opacity: scrolled ? 1 : 0,
                    transform: scrolled ? 'translateY(0)' : 'translateY(-20px)',
                    pointerEvents: scrolled ? 'all' : 'none'
                }}
            >
                <div className={styles.mobileHeaderContent}>
                    {hasLogo && (
                        <img src={logo_url} alt={menuName} className={styles.mobileLogo} />
                    )}
                    <span className={styles.mobileMenuName}>{menuName}</span>
                </div>
                <button
                    className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* Mobile Overlay */}
            <div
                className={`${styles.mobileOverlay} ${isOpen ? styles.mobileOverlayOpen : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Drawer */}
            <nav
                className={`${styles.mobileDrawer} ${isOpen ? styles.mobileDrawerOpen : ''}`}
                style={{
                    '--drawer-bg': theme.bg,
                    '--drawer-color': theme.primary,
                    '--drawer-accent': theme.accent
                }}
            >
                <div className={styles.drawerHeader}>
                    {hasLogo && (
                        <img src={logo_url} alt={menuName} className={styles.drawerLogo} />
                    )}
                    <h2 style={{ color: theme.primary }}>{menuName}</h2>
                    <div style={{ width: '30px', height: '3px', background: theme.accent, borderRadius: '2px', marginTop: '0.5rem' }} />
                </div>

                <div className={styles.drawerNav}>
                    <p className={styles.drawerLabel}>MENU</p>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleNavClick(cat.id)}
                            className={styles.drawerLink}
                            style={{ color: theme.primary }}
                        >
                            <span className={styles.drawerLinkIcon} style={{ background: theme.accent }} />
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className={styles.drawerFooter}>
                    <p style={{ color: theme.primary, opacity: 0.5 }}>Powered by <strong style={{ color: theme.accent }}>OneKit</strong></p>
                </div>
            </nav>
        </>
    );
}
