// @ts-nocheck
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { APP_CONFIG } from '@/lib/utils/constants';
import styles from './public-menu.module.css';
import MobileMenuNav from './MobileMenuNav';

// Menu themes with colors and layouts - each theme has a unique visual style
const MENU_THEMES = {
    // Classic & Elegant - Different elegant layouts
    classic: { primary: '#1a1a1a', accent: '#c4a44a', bg: '#ffffff', layout: 'elegant' },
    elegant: { primary: '#2d3436', accent: '#6c5ce7', bg: '#fafafa', layout: 'cards' },
    vintage: { primary: '#5c4033', accent: '#8b4513', bg: '#f5f5dc', layout: 'vintage' },
    // Modern & Minimal - Clean modern layouts
    modern: { primary: '#1e293b', accent: '#3b82f6', bg: '#ffffff', layout: 'cards' },
    minimalist: { primary: '#000000', accent: '#666666', bg: '#ffffff', layout: 'minimal' },
    bold: { primary: '#dc2626', accent: '#f97316', bg: '#ffffff', layout: 'bold' },
    // Premium & Luxury
    luxury: { primary: '#1c1917', accent: '#d4af37', bg: '#0c0a09', layout: 'premium' },
    neon: { primary: '#f0abfc', accent: '#22d3ee', bg: '#18181b', layout: 'neon' },
    organic: { primary: '#365314', accent: '#84cc16', bg: '#f7fee7', layout: 'magazine' },
    // Poster & Chalkboard Styles
    poster: { primary: '#1a1a1a', accent: '#333333', bg: '#f5f5f0', layout: 'poster' },
    chalkboard: { primary: '#ffffff', accent: '#d4a537', bg: '#2d2d2d', layout: 'chalkboard' },
    foodtruck: { primary: '#ffffff', accent: '#d4a537', bg: '#4a4033', layout: 'foodtruck' },
    premium: { primary: '#ffffff', accent: '#f59e0b', bg: '#1a1a1a', layout: 'premium' },
    // Cuisine Themed - Each with fitting layouts
    italian: { primary: '#16a34a', accent: '#dc2626', bg: '#fffbf0', layout: 'elegant' },
    asian: { primary: '#b91c1c', accent: '#fbbf24', bg: '#fff7ed', layout: 'cards' },
    mexican: { primary: '#ea580c', accent: '#16a34a', bg: '#fef3c7', layout: 'bold' },
    sushi: { primary: '#1e3a8a', accent: '#dc2626', bg: '#f0f9ff', layout: 'minimal' },
    indian: { primary: '#b45309', accent: '#dc2626', bg: '#fff7ed', layout: 'cards' },
    arabic: { primary: '#92400e', accent: '#c2410c', bg: '#fffbeb', layout: 'elegant' },
    // Casual & Specialty
    casual: { primary: '#ef4444', accent: '#fbbf24', bg: '#ffffff', layout: 'bold' },
    cafe: { primary: '#78350f', accent: '#a16207', bg: '#fef3c7', layout: 'magazine' },
    bakery: { primary: '#92400e', accent: '#ec4899', bg: '#fdf2f8', layout: 'cards' },
    pizza: { primary: '#dc2626', accent: '#16a34a', bg: '#fff7ed', layout: 'bold' },
    bar: { primary: '#1e293b', accent: '#f59e0b', bg: '#fafafa', layout: 'cards' },
    // Dark Modes
    dark: { primary: '#f1f5f9', accent: '#8b5cf6', bg: '#0f172a', layout: 'neon' },
    // OddMenu Aesthetic
    oddmenu: { primary: '#111827', accent: '#FF7F50', bg: '#F9FAFB', layout: 'oddmenu' },
};

async function getMenu(slug) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data: menu } = await supabase
        .from('menus')
        .select('id, user_id, name, slug, template_id, currency, logo_url, theme, is_published, created_at, view_count')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (!menu) return null;

    const { data: categories } = await supabase
        .from('menu_categories')
        .select('id, menu_id, name, description, image_url, is_visible, sort_order')
        .eq('menu_id', menu.id)
        .eq('is_visible', true)
        .order('sort_order');

    const { data: items } = await supabase
        .from('menu_items')
        .select('id, menu_id, category_id, name, description, price, image_url, is_featured, is_available, sort_order')
        .eq('menu_id', menu.id)
        .eq('is_available', true)
        .order('sort_order');

    // Increment view count
    await supabase
        .from('menus')
        .update({ view_count: (menu.view_count || 0) + 1 })
        .eq('id', menu.id);

    // Track page visit for analytics
    await supabase
        .from('page_visits')
        .insert({
            service_type: 'menu',
            page_slug: slug,
        });


    // Check owner's subscription status
    const trialDays = APP_CONFIG.trial?.days ?? 2;
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', menu.user_id)
        .single();

    let isOwnerSubscribed = false;
    let isInTrial = false;

    // Check if owner is in trial period
    if (ownerProfile?.created_at) {
        const createdAt = new Date(ownerProfile.created_at);
        const trialEndDate = new Date(createdAt.getTime() + (trialDays * 24 * 60 * 60 * 1000));
        isInTrial = new Date() < trialEndDate;
    }

    // Check for active Menu Maker subscription (join with services to filter by slug)
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, expires_at, service:services!inner(slug)')
        .eq('user_id', menu.user_id)
        .eq('status', 'active')
        .eq('service.slug', 'menu-maker')
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

    isOwnerSubscribed = !!subscription || isInTrial;

    return { menu, categories: categories || [], items: items || [], isOwnerSubscribed };
}

function formatPrice(price, currency = 'IQD', theme) {
    if (!price) return '';
    const formatted = new Intl.NumberFormat('en-IQ', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(price) + ' ' + currency;

    return (
        <span className={styles.price} style={{ color: theme.accent }}>
            {formatted}
        </span>
    );
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getMenu(slug);

    if (!data) {
        return { title: 'Menu Not Found' };
    }

    return {
        title: `${data.menu.name} - Menu`,
        description: `View the menu of ${data.menu.name}`,
    };
}

import MenuClient from './MenuClient';

export default async function PublicMenuPage({ params }) {
    const { slug } = await params;
    const data = await getMenu(slug);

    if (!data) {
        notFound();
    }

    const { menu, categories, items, isOwnerSubscribed } = data;
    const theme = MENU_THEMES[menu.template_id] || MENU_THEMES.classic;

    // Convert hex to rgb for backdrop support
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    const themeRgb = hexToRgb(theme.bg);
    const primaryRgb = hexToRgb(theme.primary);
    const accentRgb = hexToRgb(theme.accent);

    const pageStyle = {
        '--theme-primary': theme.primary,
        '--theme-primary-rgb': primaryRgb,
        '--theme-accent': theme.accent,
        '--theme-accent-rgb': accentRgb,
        '--theme-bg': theme.bg,
        '--theme-bg-rgb': themeRgb,
        '--category-bg': theme.bg === '#0f172a' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        color: theme.primary,
        minHeight: '100vh',
    };

    return (
        <div className={styles.page} style={pageStyle}>
            {/* Smooth Background */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: theme.bg,
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 100%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Mobile Horizontal Pill Nav (OddMenu only) or Hamburger (Others) */}
            <MobileMenuNav
                categories={categories}
                theme={theme}
                menuName={menu.name}
                logo_url={menu.logo_url}
            />

            {/* Subscription Paywall Overlay */}
            {!isOwnerSubscribed && (
                <div className={styles.paywallOverlay}>
                    <div className={styles.paywallCard}>
                        <div className={styles.paywallIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <h2>Menu Temporarily Unavailable</h2>
                        <p>
                            The owner's subscription has expired. Please contact <strong>{menu.name}</strong> directly to notify them.
                        </p>
                        <a
                            href={`https://wa.me/${APP_CONFIG.whatsapp?.number}?text=Hi! The menu for ${encodeURIComponent(menu.name)} seems to be unavailable.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.paywallBtn}
                        >
                            Contact via WhatsApp
                        </a>
                    </div>
                </div>
            )}

            {/* High Impact Hero Section (Hidden for OddMenu) */}
            {theme.layout !== 'oddmenu' && (
                <section className={styles.hero} style={!isOwnerSubscribed ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
                    <div className={styles.heroBg}>
                        <img
                            src={menu.theme?.hero_image || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"}
                            alt="Restaurant Ambience"
                        />
                    </div>
                    <div className={styles.heroOverlay} />
                    <div className={styles.heroContent}>
                        <div className={styles.brandCard}>
                            {menu.logo_url && (
                                <img src={menu.logo_url} alt={menu.name} className={styles.heroLogo} />
                            )}
                            <h1>{menu.name}</h1>
                            <div className={styles.brandSlogan}>EST. {new Date(menu.created_at).getFullYear()} • Premium Cuisine</div>
                            <div style={{ width: '60px', height: '4px', background: theme.accent, borderRadius: '2px', marginTop: '0.5rem' }} />
                        </div>
                    </div>
                    <div className={styles.scrollIndicator}>
                        <span>Discover Menu</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                        </svg>
                    </div>
                </section>
            )}

            {/* Smart Sticky Nav (Hidden for OddMenu) */}
            {theme.layout !== 'oddmenu' && (
                <nav className={styles.categoryNav} style={!isOwnerSubscribed ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
                    {categories.map((cat) => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            className={styles.categoryLink}
                            style={{
                                backgroundColor: 'transparent',
                                color: theme.primary,
                                border: `1px solid ${theme.accent}33`
                            }}
                        >
                            {cat.name}
                        </a>
                    ))}
                </nav>
            )}

            {/* Main Menu Experience via MenuClient */}
            <MenuClient
                menu={menu}
                categories={categories}
                items={items}
                theme={theme}
            />

            {/* Modern Footer */}
            <footer className={styles.footer} style={!isOwnerSubscribed ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
                <p>Designed with excellence via <strong style={{ color: theme.accent }}>OneKit</strong></p>
                <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>© {new Date().getFullYear()} {menu.name}</p>
            </footer>
        </div>
    );

}

