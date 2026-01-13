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
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (!menu) return null;

    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('menu_id', menu.id)
        .eq('is_visible', true)
        .order('sort_order');

    const { data: items } = await supabase
        .from('menu_items')
        .select('*')
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

    // --- Layout Components ---

    const ModernGridLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={styles.category}>
            <div className={styles.categoryTitleWrap}>
                <h2 style={{ color: theme.primary }}>{cat.name}</h2>
                {cat.description && <p className={styles.categoryDesc}>{cat.description}</p>}
                <div style={{ position: 'absolute', left: '-20px', top: '0', bottom: '0', width: '4px', background: theme.accent, borderRadius: '2px' }} />
            </div>

            <div className={styles.itemsGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.itemCard}>
                        {item.is_featured && <div className={styles.badge}>Chef's Choice</div>}
                        {item.image_url && (
                            <div className={styles.itemImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.itemInfo}>
                            <h3 style={{ color: theme.primary }}>{item.name}</h3>
                            {item.description && <p>{item.description}</p>}
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {formatPrice(item.price, menu.currency, theme)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    const MagazineLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.magazineRow}`}>
            <div className={styles.magazineContent}>
                <div className={styles.categoryTitleWrap}>
                    <h2 style={{ color: theme.primary }}>{cat.name}</h2>
                    {cat.description && <p className={styles.categoryDesc}>{cat.description}</p>}
                </div>

                <div className={styles.magazineList}>
                    {catItems.map((item) => (
                        <div key={item.id} className={styles.magazineItem}>
                            <div className={styles.magazineItemHeader}>
                                <h3 style={{ color: theme.primary }}>
                                    {item.name}
                                    {item.is_featured && <span className={styles.magazineBadge}>★ Featured</span>}
                                </h3>
                                <div className={styles.magazineDots} />
                                {formatPrice(item.price, menu.currency, theme)}
                            </div>
                            {item.description && <p className={styles.magazineDesc}>{item.description}</p>}
                        </div>
                    ))}
                </div>
            </div>

            {(cat.image_url || catItems[0]?.image_url) && (
                <div className={styles.magazineImageWrap}>
                    <img
                        src={cat.image_url || catItems[0]?.image_url}
                        alt={cat.name}
                        className={styles.magazineFeatureImage}
                    />
                </div>
            )}
        </section>
    );

    // Poster Layout - Clean 2-column grid with circular food images (Like Image 0)
    const PosterLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.posterSection}`}>
            <h2 className={styles.posterCategoryTitle} style={{ color: theme.primary }}>{cat.name}</h2>
            <div className={styles.posterGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.posterItem}>
                        <div className={styles.posterItemText}>
                            <h3 style={{ color: theme.primary }}>
                                {item.name}
                                {item.is_featured && <span className={styles.posterBadge}>Chef's Choice</span>}
                            </h3>
                            {formatPrice(item.price, menu.currency, theme)}
                            {item.description && <p>{item.description}</p>}
                        </div>
                        {item.image_url && (
                            <div className={styles.posterImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );

    // Chalkboard Layout - Dark elegant with golden accents (Like Image 1)
    const ChalkboardLayout = ({ cat, catItems }) => {
        // Get up to 3 images for the side display
        const displayImages = catItems.filter(item => item.image_url).slice(0, 3);

        return (
            <section key={cat.id} id={cat.id} className={styles.chalkboardSection}>
                <h2 className={styles.chalkboardTitle} style={{ color: theme.accent }}>{cat.name}</h2>
                <div className={styles.chalkboardContent}>
                    <div className={styles.chalkboardList}>
                        {catItems.map((item) => (
                            <div key={item.id} className={styles.chalkboardItem}>
                                <span style={{ color: theme.primary }}>
                                    {item.name}
                                    {item.is_featured && <span className={styles.chalkboardBadge}>★ Featured</span>}
                                </span>
                                <span className={styles.chalkboardDash}>—</span>
                                {formatPrice(item.price, menu.currency, theme)}
                            </div>
                        ))}
                    </div>
                    {displayImages.length > 0 && (
                        <div className={styles.chalkboardImages}>
                            {displayImages.map((item) => (
                                <div key={item.id} className={styles.chalkboardImage}>
                                    <img src={item.image_url} alt={item.name} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        );
    };

    // Foodtruck Layout - Compact 2-column with small circular icons
    const FoodtruckLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={styles.foodtruckSection}>
            <h2 className={styles.foodtruckTitle} style={{ borderColor: theme.accent }}>{cat.name}</h2>
            <div className={styles.foodtruckList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.foodtruckItem}>
                        {item.image_url && (
                            <div className={styles.foodtruckIcon}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.foodtruckInfo}>
                            <h3 style={{ color: theme.accent }}>
                                {item.name}
                                {item.is_featured && <span className={styles.foodtruckBadge}>NEW</span>}
                            </h3>
                            {item.description && <p>{item.description}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    // Premium Layout - Dark luxury with gold-ringed circular images
    const PremiumLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={styles.premiumSection}>
            <h2 className={styles.premiumTitle} style={{ color: theme.accent }}>{cat.name}</h2>
            <div className={styles.premiumGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.premiumCard}>
                        {item.is_featured && <div className={styles.premiumBadge}>Chef's Choice</div>}
                        {item.image_url && (
                            <div className={styles.premiumImageWrap} style={{ borderColor: theme.accent }}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <h3 style={{ color: theme.primary }}>{item.name}</h3>
                        {formatPrice(item.price, menu.currency, theme)}
                    </div>
                ))}
            </div>
        </section>
    );

    // Elegant Layout - Classic serif typography with bordered items
    const ElegantLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.elegantSection}`}>
            <h2 className={styles.elegantTitle} style={{ color: theme.primary, borderColor: theme.accent }}>{cat.name}</h2>
            <div className={styles.elegantList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.elegantItem} style={{ borderColor: `${theme.accent}30` }}>
                        <div className={styles.elegantItemContent}>
                            <h3 style={{ color: theme.primary }}>{item.name}</h3>
                            {item.description && <p>{item.description}</p>}
                        </div>
                        <div className={styles.elegantItemRight}>
                            {formatPrice(item.price, menu.currency, theme)}
                            {item.is_featured && (
                                <div className={styles.badge}>Chef's Choice</div>
                            )}
                            {item.image_url && (
                                <div className={styles.elegantThumb}>
                                    <img src={item.image_url} alt={item.name} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    // Cards Layout - Full image cards in a clean grid
    const CardsLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.cardsSection}`}>
            <h2 style={{ color: theme.primary }}>{cat.name}</h2>
            <div className={styles.cardsGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.cardItem}>
                        {item.image_url && (
                            <div className={styles.cardImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.cardContent}>
                            <h3 style={{ color: theme.primary }}>
                                {item.name}
                                {item.is_featured && <span className={styles.cardBadge}>★</span>}
                            </h3>
                            {item.description && <p>{item.description}</p>}
                            {formatPrice(item.price, menu.currency, theme)}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    // Vintage Layout - Decorative ornaments and classic styling
    const VintageLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.vintageSection}`}>
            <div className={styles.vintageHeader}>
                <span className={styles.vintageOrnament}>❦</span>
                <h2 style={{ color: theme.primary }}>{cat.name}</h2>
                <span className={styles.vintageOrnament}>❦</span>
            </div>
            <div className={styles.vintageList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.vintageItem}>
                        <div className={styles.vintageItemName}>
                            <span style={{ color: theme.primary }}>
                                {item.name}
                                {item.is_featured && <span className={styles.vintageFeatured}> (Chef's Choice)</span>}
                            </span>
                            <span className={styles.vintageDots} style={{ borderColor: theme.accent }}></span>
                            {formatPrice(item.price, menu.currency, theme)}
                        </div>
                        {item.description && <p className={styles.vintageDesc}>{item.description}</p>}
                    </div>
                ))}
            </div>
        </section>
    );

    // Minimal Layout - Clean list, no images, pure text
    const MinimalLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.minimalSection}`}>
            <h2 className={styles.minimalTitle} style={{ color: theme.primary }}>{cat.name}</h2>
            <div className={styles.minimalList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.minimalItem}>
                        <div className={styles.minimalLeft}>
                            <h3 style={{ color: theme.primary }}>
                                {item.name}
                                {item.is_featured && <span className={styles.minimalBadge}>Chef's Choice</span>}
                            </h3>
                            {item.description && <p>{item.description}</p>}
                        </div>
                        {formatPrice(item.price, menu.currency, theme)}
                    </div>
                ))}
            </div>
        </section>
    );

    // Bold Layout - Large text, vibrant colors, full bleed images
    const BoldLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.boldSection}`}>
            <h2 className={styles.boldTitle} style={{ color: theme.accent }}>{cat.name}</h2>
            <div className={styles.boldGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.boldCard} style={{ borderColor: theme.accent }}>
                        {item.image_url && (
                            <div className={styles.boldImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.boldContent}>
                            <h3 style={{ color: theme.primary }}>
                                {item.name}
                                {item.is_featured && <span className={styles.boldBadge}>MUST TRY</span>}
                            </h3>
                            {formatPrice(item.price, menu.currency, theme)}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    // Neon Layout - Glowing effects and cyber aesthetic
    const NeonLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={`${styles.category} ${styles.neonSection}`}>
            <h2 className={styles.neonTitle} style={{ color: theme.accent, textShadow: `0 0 20px ${theme.accent}` }}>{cat.name}</h2>
            <div className={styles.neonGrid}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.neonCard} style={{ borderColor: `${theme.accent}50` }}>
                        {item.image_url && (
                            <div className={styles.neonImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.neonContent}>
                            <h3 style={{ color: theme.primary }}>{item.name}</h3>
                            {item.description && <p>{item.description}</p>}
                            <div className={styles.neonPrice} style={{ color: theme.accent }}>{formatPrice(item.price, menu.currency, theme)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    // Layout selector function
    const renderLayout = (cat, catItems) => {
        switch (theme.layout) {
            case 'magazine': return <MagazineLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'poster': return <PosterLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'chalkboard': return <ChalkboardLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'foodtruck': return <FoodtruckLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'premium': return <PremiumLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'elegant': return <ElegantLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'cards': return <CardsLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'vintage': return <VintageLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'minimal': return <MinimalLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'bold': return <BoldLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'neon': return <NeonLayout key={cat.id} cat={cat} catItems={catItems} />;
            default: return <ModernGridLayout key={cat.id} cat={cat} catItems={catItems} />;
        }
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

            {/* Mobile Hamburger Menu */}
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

            {/* High Impact Hero Section */}
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

            {/* Smart Sticky Nav */}
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

            {/* Main Menu Experience */}
            <main className={styles.content} style={!isOwnerSubscribed ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
                {categories.map((cat) => {
                    const catItems = items.filter(item => item.category_id === cat.id);
                    return renderLayout(cat, catItems);
                })}

                {categories.length === 0 && (
                    <div className={styles.empty}>
                        <p>This menu is exceptionally curated. Please check back soon!</p>
                    </div>
                )}
            </main>

            {/* Modern Footer */}
            <footer className={styles.footer} style={!isOwnerSubscribed ? { filter: 'blur(8px)', pointerEvents: 'none' } : {}}>
                <p>Designed with excellence via <strong style={{ color: theme.accent }}>OneKit</strong></p>
                <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>© {new Date().getFullYear()} {menu.name}</p>
            </footer>
        </div>
    );
}
