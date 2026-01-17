// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import styles from './public-menu.module.css';

export default function MenuClient({
    menu,
    categories,
    items,
    theme
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
    }, [items, searchQuery]);

    const categoriesWithItems = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            items: filteredItems.filter(item => item.category_id === cat.id)
        })).filter(cat => cat.items.length > 0);
    }, [categories, filteredItems]);

    const formatPrice = (price, currency = 'IQD') => {
        if (!price) return '';
        return new Intl.NumberFormat('en-IQ', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(price) + ' ' + currency;
    };

    // --- Layout Components ---

    const OddMenuLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={styles.oddCategorySection}>
            <div className={styles.oddCategoryCard}>
                <img
                    src={cat.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"}
                    alt={cat.name}
                />
                <h2>{cat.name}</h2>
            </div>

            <div className={styles.oddItemsList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.oddItemCard}>
                        {item.image_url && (
                            <div className={styles.oddItemImage}>
                                <img src={item.image_url} alt={item.name} />
                            </div>
                        )}
                        <div className={styles.oddItemContent}>
                            <div className={styles.oddItemHeader}>
                                <h3 className={styles.oddItemName}>{item.name}</h3>
                                <span className={styles.oddItemPrice} style={{ color: theme.accent }}>
                                    {formatPrice(item.price, menu.currency)}
                                </span>
                            </div>
                            <div className={styles.oddItemMeta}>
                                {item.weight && <span>{item.weight}</span>}
                                {item.calories && <span> • {item.calories} kcal</span>}
                            </div>
                            {item.description && <p className={styles.oddItemDesc}>{item.description}</p>}

                            <button className={styles.oddActionBtn} style={{ background: theme.accent }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

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
                                <span className={styles.price} style={{ color: theme.accent }}>
                                    {formatPrice(item.price, menu.currency)}
                                </span>
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
                                <span className={styles.price} style={{ color: theme.accent }}>
                                    {formatPrice(item.price, menu.currency)}
                                </span>
                            </div>
                            {item.description && <p className={styles.magazineDesc}>{item.description}</p>}
                        </div>
                    ))}
                </div>
            </div>
            {(cat.image_url || catItems[0]?.image_url) && (
                <div className={styles.magazineImageWrap}>
                    <img src={cat.image_url || catItems[0]?.image_url} alt={cat.name} className={styles.magazineFeatureImage} />
                </div>
            )}
        </section>
    );

    // Other layouts (Poster, Chalkboard, etc.) simplified for clarity
    const ListLayout = ({ cat, catItems }) => (
        <section key={cat.id} id={cat.id} className={styles.category}>
            <h2 className={styles.minimalTitle} style={{ color: theme.primary }}>{cat.name}</h2>
            <div className={styles.minimalList}>
                {catItems.map((item) => (
                    <div key={item.id} className={styles.minimalItem}>
                        <div className={styles.minimalLeft}>
                            <h3 style={{ color: theme.primary }}>{item.name}</h3>
                            {item.description && <p>{item.description}</p>}
                        </div>
                        <span className={styles.price} style={{ color: theme.accent }}>
                            {formatPrice(item.price, menu.currency)}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );

    const renderLayout = (cat, catItems) => {
        if (theme.layout === 'oddmenu') {
            return <OddMenuLayout key={cat.id} cat={cat} catItems={catItems} />;
        }

        switch (theme.layout) {
            case 'magazine': return <MagazineLayout key={cat.id} cat={cat} catItems={catItems} />;
            case 'minimal': return <ListLayout key={cat.id} cat={cat} catItems={catItems} />;
            // Default to grid for all others to keep it simple but functional
            default: return <ModernGridLayout key={cat.id} cat={cat} catItems={catItems} />;
        }
    };

    return (
        <>
            {/* OddMenu Specific Header Details */}
            {theme.layout === 'oddmenu' && (
                <div className={styles.oddHeader}>
                    {menu.logo_url && (
                        <img src={menu.logo_url} alt={menu.name} className={styles.oddLogo} />
                    )}
                    <h1 className={styles.oddTitle}>{menu.name}</h1>
                    <div className={styles.oddDetails}>
                        {(menu.theme?.address || menu.address || menu.location) && (
                            <div className={styles.oddDetailItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span>{menu.theme?.address || menu.address || menu.location}</span>
                            </div>
                        )}
                        {(menu.theme?.phone || menu.phone) && (
                            <div className={styles.oddDetailItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                </svg>
                                <span>{menu.theme?.phone || menu.phone}</span>
                            </div>
                        )}
                        {menu.theme?.wifi && (
                            <div className={styles.oddDetailItem}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
                                </svg>
                                <span>WiFi: {menu.theme.wifi}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Live Search Bar */}
            <div className={styles.oddSearchWrap}>
                <div className={styles.oddSearchIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search for dishes..."
                    className={styles.oddSearch}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <main className={styles.content}>
                {categoriesWithItems.map((cat) => renderLayout(cat, cat.items))}

                {categoriesWithItems.length === 0 && (
                    <div className={styles.empty}>
                        <p>{searchQuery ? "No items found matching your search." : "This menu is exceptionally curated. Please check back soon!"}</p>
                    </div>
                )}
            </main>
        </>
    );
}
