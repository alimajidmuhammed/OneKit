// @ts-nocheck
'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/lib/hooks/useMenu';
import { useAuth } from '@/components/auth/AuthProvider';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { formatCurrency, getWhatsAppLink } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import PhotoStudio from '@/components/menu/PhotoStudio';
import styles from './editor.module.css';


// Menu themes with colors and styles
const MENU_THEMES = [
    // Classic styles
    { id: 'classic', name: 'Classic', preview: '📋', colors: { primary: '#1a1a1a', accent: '#c4a44a', bg: '#ffffff' } },
    { id: 'elegant', name: 'Elegant', preview: '🍽️', colors: { primary: '#2d3436', accent: '#6c5ce7', bg: '#fafafa' } },
    { id: 'vintage', name: 'Vintage', preview: '📜', colors: { primary: '#5c4033', accent: '#8b4513', bg: '#f5f5dc' } },
    // Modern styles
    { id: 'modern', name: 'Modern', preview: '✨', colors: { primary: '#1e293b', accent: '#3b82f6', bg: '#ffffff' } },
    { id: 'minimalist', name: 'Minimalist', preview: '⬜', colors: { primary: '#000000', accent: '#666666', bg: '#ffffff' } },
    { id: 'bold', name: 'Bold', preview: '🔥', colors: { primary: '#dc2626', accent: '#f97316', bg: '#ffffff' } },
    // Premium & Luxury
    { id: 'luxury', name: 'Luxury', preview: '💎', colors: { primary: '#1c1917', accent: '#d4af37', bg: '#0c0a09' } },
    { id: 'neon', name: 'Neon', preview: '🌈', colors: { primary: '#f0abfc', accent: '#22d3ee', bg: '#18181b' } },
    { id: 'organic', name: 'Organic', preview: '🌿', colors: { primary: '#365314', accent: '#84cc16', bg: '#f7fee7' } },
    // NEW: Inspired Templates
    { id: 'poster', name: 'Poster', preview: '🖼️', colors: { primary: '#1a1a1a', accent: '#333333', bg: '#f5f5f0' } },
    { id: 'chalkboard', name: 'Chalkboard', preview: '🎨', colors: { primary: '#ffffff', accent: '#d4a537', bg: '#2d2d2d' } },
    { id: 'foodtruck', name: 'Food Truck', preview: '🚚', colors: { primary: '#ffffff', accent: '#d4a537', bg: '#4a4033' } },
    { id: 'premium', name: 'Premium', preview: '👑', colors: { primary: '#ffffff', accent: '#f59e0b', bg: '#1a1a1a' } },
    // Cuisine themed
    { id: 'italian', name: 'Italian', preview: '🍝', colors: { primary: '#16a34a', accent: '#dc2626', bg: '#fffbf0' } },
    { id: 'asian', name: 'Asian', preview: '🍜', colors: { primary: '#b91c1c', accent: '#fbbf24', bg: '#fff7ed' } },
    { id: 'mexican', name: 'Mexican', preview: '🌮', colors: { primary: '#ea580c', accent: '#16a34a', bg: '#fef3c7' } },
    { id: 'sushi', name: 'Sushi', preview: '🍣', colors: { primary: '#1e3a8a', accent: '#dc2626', bg: '#f0f9ff' } },
    { id: 'indian', name: 'Indian', preview: '🍛', colors: { primary: '#b45309', accent: '#dc2626', bg: '#fff7ed' } },
    { id: 'arabic', name: 'Arabic', preview: '🧆', colors: { primary: '#92400e', accent: '#c2410c', bg: '#fffbeb' } },
    // Casual & Specialty
    { id: 'casual', name: 'Casual', preview: '🍔', colors: { primary: '#ef4444', accent: '#fbbf24', bg: '#ffffff' } },
    { id: 'cafe', name: 'Cafe', preview: '☕', colors: { primary: '#78350f', accent: '#a16207', bg: '#fef3c7' } },
    { id: 'bakery', name: 'Bakery', preview: '🥐', colors: { primary: '#92400e', accent: '#ec4899', bg: '#fdf2f8' } },
    { id: 'pizza', name: 'Pizzeria', preview: '🍕', colors: { primary: '#dc2626', accent: '#16a34a', bg: '#fff7ed' } },
    { id: 'bar', name: 'Bar & Grill', preview: '🍺', colors: { primary: '#1e293b', accent: '#f59e0b', bg: '#fafafa' } },
    // Dark mode
    { id: 'dark', name: 'Dark Mode', preview: '🌙', colors: { primary: '#f1f5f9', accent: '#8b5cf6', bg: '#0f172a' } },
    // NEW: OddMenu
    { id: 'oddmenu', name: 'OddMenu', preview: '📱', colors: { primary: '#111827', accent: '#FF7F50', bg: '#F9FAFB' } },
];

export default function MenuEditorPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const {
        fetchMenu, updateMenu,
        categories, addCategory, updateCategory, deleteCategory,
        items, addItem, updateItem, deleteItem,
        saving
    } = useMenu();
    const { user } = useAuth();
    const { hasAccess, getAccessStatus } = useSubscription();
    const { uploadImage } = useImageUpload();


    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('categories');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [showPhotoStudio, setShowPhotoStudio] = useState(false);
    const qrCardRef = useRef(null);

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' });
    const [itemForm, setItemForm] = useState({
        name: '', description: '', price: '', image_url: '', is_available: true, is_featured: false
    });

    // Auto-save & Status State
    const [hasChanges, setHasChanges] = useState(false);
    const [uploadingItemImage, setUploadingItemImage] = useState(false);
    const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'

    const menuRef = useRef(menu);
    useEffect(() => {
        menuRef.current = menu;
    }, [menu]);

    const accessStatus = getAccessStatus('menu-maker');
    const canEdit = accessStatus?.hasAccess || false;

    const currentTheme = MENU_THEMES.find(t => t.id === menu?.template_id) || MENU_THEMES[0];

    useEffect(() => {
        const loadMenu = async () => {
            const data = await fetchMenu(id);
            if (data) {
                setMenu(data);
                // Track initial state for changes
                lastSavedStateRef.current = JSON.stringify({
                    name: data.name,
                    currency: data.currency,
                    template_id: data.template_id,
                    logo_url: data.logo_url,
                    theme: data.theme
                });
            } else {
                router.push('/dashboard/menu-maker');
            }
            setLoading(false);
        };
        loadMenu();
    }, [id]);

    const handlePublish = async () => {
        await updateMenu(id, { is_published: !menu.is_published });
        setMenu(prev => ({ ...prev, is_published: !prev.is_published }));
    };

    // QR Code helpers
    const getQRCodeUrl = () => {
        const pageUrl = `${window.location.origin}/menu/${menu?.slug}`;
        const accentColor = currentTheme?.colors?.accent?.replace('#', '') || '1a1a1a';
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pageUrl)}&color=${accentColor}`;
    };

    const downloadQRCode = async () => {
        if (!menu) return;
        setDownloading(true);
        try {
            const response = await fetch(getQRCodeUrl());
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${menu.slug}-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download QR code:', error);
            alert('Failed to download QR code. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBadge = async () => {
        if (!qrCardRef.current || !menu) return;
        setDownloading(true);
        try {
            // Wait a tiny bit for any layout/image updates
            await new Promise(r => setTimeout(r, 100));

            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(qrCardRef.current, {
                useCORS: true,
                scale: 3, // Higher resolution
                backgroundColor: null,
                logging: false,
            });

            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `${menu.slug}-badge.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download badge:', error);
            alert('Failed to download badge. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Theme change - force update with spreading full object
    const changeTheme = (themeId) => {
        setMenu(prev => ({ ...prev, template_id: themeId }));
        setHasChanges(true);
    };

    const isMounted = useRef(true);
    const lastSavedStateRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Auto-save logic
    const handleSave = useCallback(async () => {
        if (!hasChanges || !menu || saveStatus === 'saving') return;

        console.log('🚀 Starting handleSave...', { hasChanges, saveStatus });

        // Capture what we are about to save
        const stateToSave = {
            name: menu.name,
            currency: menu.currency,
            template_id: menu.template_id,
            logo_url: menu.logo_url,
            theme: menu.theme
        };
        const stateToSaveStr = JSON.stringify(stateToSave);

        setSaveStatus('saving');

        // Safety timeout for UI state
        const safetyTimer = setTimeout(() => {
            console.warn('⚠️ handleSave safety timer triggered after 10s');
            setSaveStatus(prev => prev === 'saving' ? 'idle' : prev);
        }, 10000);

        try {
            console.log('📡 Calling updateMenu with:', stateToSave);
            const { data, error } = await updateMenu(id, stateToSave);
            clearTimeout(safetyTimer);

            if (!isMounted.current) {
                console.log('🛑 handleSave: Component unmounted, ignoring result');
                return;
            }

            if (error) {
                console.error('❌ handleSave: updateMenu returned error:', error);
                setSaveStatus('idle');
                return;
            }

            console.log('✅ handleSave: updateMenu successful');

            // Update local menu state with server response to stay in sync
            if (data) {
                setMenu(data);
            }

            lastSavedStateRef.current = stateToSaveStr;

            const latestMenu = menuRef.current;
            const currentStateStr = JSON.stringify({
                name: latestMenu.name,
                currency: latestMenu.currency,
                template_id: latestMenu.template_id,
                logo_url: latestMenu.logo_url,
                theme: latestMenu.theme
            });

            if (currentStateStr === stateToSaveStr) {
                console.log('✨ handleSave: State synchronized, resetting hasChanges');
                setHasChanges(false);
            } else {
                console.log('⏳ handleSave: More changes detected, keeping hasChanges true');
            }

            setSaveStatus('saved');
            const statusTimer = setTimeout(() => {
                if (isMounted.current) {
                    console.log('💤 handleSave: Resetting saveStatus to idle');
                    setSaveStatus('idle');
                }
            }, 3000);
        } catch (error) {
            console.error('💥 Auto-save failed (catch):', error);
            if (isMounted.current) {
                if (error.name !== 'AbortError' && !error.message?.includes('aborted')) {
                    // Silence
                }
                setSaveStatus('idle');
            }
        }
    }, [id, menu, hasChanges, updateMenu, saveStatus]);

    useEffect(() => {
        if (!hasChanges) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 2500); // Increased debounce for smoother auto-save

        return () => clearTimeout(timer);
    }, [hasChanges, handleSave]);

    // Category handlers
    const openCategoryModal = (cat = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCategoryForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
        } else {
            setEditingCategory(null);
            setCategoryForm({ name: '', description: '', image_url: '' });
        }
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryForm.name.trim()) return;

        const data = {
            name: categoryForm.name,
            description: categoryForm.description,
            image_url: categoryForm.image_url
        };

        if (editingCategory) {
            await updateCategory(editingCategory.id, data);
        } else {
            await addCategory(id, data.name, data.description, data.image_url);
        }
        setShowCategoryModal(false);
    };

    const handleDeleteCategory = async (catId) => {
        if (confirm('Delete this category and all its items?')) {
            await deleteCategory(catId);
        }
    };

    // Item handlers
    const openItemModal = (catId, item = null) => {
        setSelectedCategory(catId);
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                description: item.description || '',
                price: item.price?.toString() || '',
                image_url: item.image_url || '',
                is_available: item.is_available !== false,
                is_featured: item.is_featured === true,
            });
        } else {
            setEditingItem(null);
            setItemForm({ name: '', description: '', price: '', image_url: '', is_available: true, is_featured: false });
        }
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.name.trim()) return;

        const data = {
            name: itemForm.name,
            description: itemForm.description,
            price: itemForm.price ? parseFloat(itemForm.price) : null,
            image_url: itemForm.image_url,
            is_available: itemForm.is_available,
            is_featured: itemForm.is_featured,
        };

        if (editingItem) {
            await updateItem(editingItem.id, data);
        } else {
            await addItem(id, selectedCategory, data);
        }
        setShowItemModal(false);
    };

    const handleCategoryImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setUploadingCategoryImage(true);
        try {
            const publicUrl = await uploadImage(file, { folder: 'menu-categories', type: 'photo' });
            if (publicUrl) {
                setCategoryForm(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                alert('Failed to upload image.');
            }
        } finally {
            setUploadingCategoryImage(false);
        }
    };

    const handleItemImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setUploadingItemImage(true);
        try {
            const publicUrl = await uploadImage(file, { folder: 'menu-items', type: 'photo' });
            if (publicUrl) {
                setItemForm(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } finally {
            setUploadingItemImage(false);
        }
    };

    const handleStudioSave = async (editedBlob) => {
        if (!user) return;
        setUploadingItemImage(true);
        setShowPhotoStudio(false);

        try {
            // Create a File from the blob for the upload hook
            const file = new File([editedBlob], 'edited-image.png', { type: 'image/png' });
            const publicUrl = await uploadImage(file, { folder: 'menu-items', type: 'photo' });
            if (publicUrl) {
                setItemForm(prev => ({ ...prev, image_url: publicUrl }));
            } else {
                alert('Failed to save edited image.');
            }
        } finally {
            setUploadingItemImage(false);
        }
    };


    const handleDeleteItem = async (itemId) => {
        if (confirm('Delete this item?')) {
            await deleteItem(itemId);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <span>Loading menu...</span>
            </div>
        );
    }

    if (!menu) return null;

    return (
        <div className={styles.editor}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/dashboard/menu-maker')}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Back
                </button>
                <h1>{menu.name}</h1>
                <div className={styles.headerActions}>
                    {menu.is_published && (
                        <a
                            href={`/menu/${menu.slug}`}
                            target="_blank"
                            className={styles.previewBtn}
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            View Live
                        </a>
                    )}
                    <button
                        className={`${styles.saveBtn} ${saveStatus === 'saved' ? styles.saveBtnSuccess : ''}`}
                        onClick={handleSave}
                        disabled={!hasChanges || saveStatus === 'saving' || !canEdit}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Changes'}
                    </button>
                    <button
                        className={`${styles.publishBtn} ${menu.is_published ? styles.unpublish : ''}`}
                        onClick={handlePublish}
                        disabled={saving}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            {menu.is_published ? (
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            ) : (
                                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            )}
                        </svg>
                        {menu.is_published ? 'Unpublish' : 'Publish Menu'}
                    </button>
                </div>
            </div>

            {!canEdit && (
                <div className={styles.expiredNotice}>
                    <span>⚠️ Your trial has expired. </span>
                    <a href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to Menu Maker')} target="_blank">
                        Subscribe to edit
                    </a>
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'categories' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Categories & Items
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'theme' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('theme')}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="13.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <circle cx="17.5" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <circle cx="6.5" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
                        <path d="M19.07 4.93c-3.538 3.538-9.602 3.538-13.14 0" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Theme & Style
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Settings
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'share' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('share')}
                >
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Share
                </button>
            </div>

            {/* Content Container */}
            <div className={styles.content} style={{ position: 'relative', overflow: 'hidden', minHeight: '600px', backgroundColor: 'var(--theme-bg, #ffffff)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {activeTab === 'categories' && (
                        <div className={styles.categoriesSection}>
                            {canEdit && (
                                <button className={styles.addCategoryBtn} onClick={() => openCategoryModal()}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Add Category
                                </button>
                            )}

                            {categories.length === 0 ? (
                                <div className={styles.emptyCategories}>
                                    <div className={styles.emptyIcon}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <h3>No categories yet</h3>
                                    <p>Add your first category to start building your menu.</p>
                                </div>
                            ) : (
                                <div className={styles.categoriesList}>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className={styles.categoryCard}>
                                            <div className={styles.categoryHeader}>
                                                <div className={styles.categoryInfo}>
                                                    <h3>
                                                        <span className={styles.categoryIcon}></span>
                                                        {cat.name}
                                                    </h3>
                                                    {cat.description && <p>{cat.description}</p>}
                                                </div>
                                                {canEdit && (
                                                    <div className={styles.categoryActions}>
                                                        <button onClick={() => openCategoryModal(cat)} title="Edit" className={styles.editBtn}>
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDeleteCategory(cat.id)} title="Delete" className={styles.deleteBtn}>
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.itemsList}>
                                                {items.filter(i => i.category_id === cat.id).map((item) => (
                                                    <div key={item.id} className={styles.itemCard}>
                                                        {item.image_url && (
                                                            <div className={styles.itemImage}>
                                                                <img src={item.image_url} alt={item.name} />
                                                            </div>
                                                        )}
                                                        <div className={styles.itemInfo}>
                                                            <h4>
                                                                <span className={styles.itemIcon}>🍽️</span>
                                                                {item.name}
                                                            </h4>
                                                            {item.description && <p>{item.description}</p>}
                                                            {item.price && (
                                                                <span className={styles.itemPrice}>
                                                                    {formatCurrency(item.price, menu.currency)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!item.is_available && (
                                                            <span className={styles.unavailableBadge}>Unavailable</span>
                                                        )}
                                                        {canEdit && (
                                                            <div className={styles.itemActions}>
                                                                <button onClick={() => openItemModal(cat.id, item)}>Edit</button>
                                                                <button onClick={() => handleDeleteItem(item.id)}>×</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {canEdit && (
                                                    <button
                                                        className={styles.addItemBtn}
                                                        onClick={() => openItemModal(cat.id)}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                        Add Item
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className={styles.themeSection}>
                            <h2>
                                <svg viewBox="0 0 24 24" fill="none">
                                    <circle cx="13.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Choose Theme
                            </h2>
                            <div className={styles.themeGrid}>
                                {MENU_THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={`${styles.themeCard} ${menu.template_id === theme.id ? styles.themeActive : ''}`}
                                        onClick={() => changeTheme(theme.id)}
                                        disabled={!canEdit}
                                    >
                                        <div
                                            className={styles.themePreview}
                                            style={{
                                                background: theme.colors.bg,
                                                borderColor: theme.colors.accent
                                            }}
                                        >
                                            <div style={{ color: theme.colors.primary, fontSize: '24px' }}>{theme.preview}</div>
                                            <div className={styles.themeColors}>
                                                <span style={{ background: theme.colors.primary }} />
                                                <span style={{ background: theme.colors.accent }} />
                                            </div>
                                        </div>
                                        <span className={styles.themeName}>{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className={styles.settingsSection}>
                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Menu Name
                                </label>
                                <input
                                    type="text"
                                    value={menu.name}
                                    onChange={(e) => {
                                        setMenu(prev => ({ ...prev, name: e.target.value }));
                                        setHasChanges(true);
                                    }}
                                    disabled={!canEdit}
                                />
                            </div>

                            {/* Logo Upload */}
                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                                        <path d="M7 20.662V19a2 2 0 012-2h6a2 2 0 012 2v1.662" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Restaurant Logo
                                </label>
                                {menu.logo_url ? (
                                    <div className={styles.thumbnailPreview}>
                                        <img src={menu.logo_url} alt="Logo" style={{ borderRadius: '50%' }} />
                                        <div className={styles.thumbnailActions}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenu(prev => ({ ...prev, logo_url: null }));
                                                    setHasChanges(true);
                                                }}
                                                disabled={!canEdit}
                                            >
                                                Remove Logo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.uploadArea} style={{ padding: 'var(--space-4)', position: 'relative' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file || !canEdit) return;

                                                try {
                                                    const publicUrl = await uploadImage(file, { folder: 'logos', type: 'logo' });
                                                    if (publicUrl) {
                                                        setMenu(prev => ({ ...prev, logo_url: publicUrl }));
                                                        setHasChanges(true);
                                                    }
                                                } catch (err) {
                                                    console.error('Logo upload failed:', err);
                                                }
                                            }}

                                            disabled={!canEdit}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: canEdit ? 'pointer' : 'not-allowed',
                                                zIndex: 10
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <svg viewBox="0 0 24 24" fill="none" style={{ width: '32px', height: '32px', opacity: 0.5 }}>
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="currentColor" strokeWidth="2" />
                                                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Upload Logo</span>
                                            <small style={{ opacity: 0.5 }}>Square image recommended</small>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hero Image Upload */}
                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
                                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Hero Background Image
                                </label>
                                {menu.theme?.hero_image ? (
                                    <div className={styles.thumbnailPreview}>
                                        <img src={menu.theme.hero_image} alt="Hero Background" style={{ aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px' }} />
                                        <div className={styles.thumbnailActions}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenu(prev => ({
                                                        ...prev,
                                                        theme: { ...(prev.theme || {}), hero_image: null }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                                disabled={!canEdit}
                                            >
                                                Remove Background
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.uploadArea} style={{ padding: 'var(--space-4)', position: 'relative' }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file || !canEdit) return;

                                                try {
                                                    const publicUrl = await uploadImage(file, { folder: 'backgrounds', type: 'background' });
                                                    if (publicUrl) {
                                                        setMenu(prev => ({
                                                            ...prev,
                                                            theme: { ...(prev.theme || {}), hero_image: publicUrl }
                                                        }));
                                                        setHasChanges(true);
                                                    }
                                                } catch (err) {
                                                    console.error('Hero background upload failed:', err);
                                                }
                                            }}

                                            disabled={!canEdit}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                opacity: 0,
                                                cursor: canEdit ? 'pointer' : 'not-allowed',
                                                zIndex: 10
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                                            <svg viewBox="0 0 24 24" fill="none" style={{ width: '32px', height: '32px', opacity: 0.5 }}>
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="currentColor" strokeWidth="2" />
                                                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Upload Background</span>
                                            <small style={{ opacity: 0.5 }}>Landscape image recommended</small>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Currency
                                </label>
                                <select
                                    value={menu.currency}
                                    onChange={(e) => {
                                        setMenu(prev => ({ ...prev, currency: e.target.value }));
                                        setHasChanges(true);
                                    }}
                                    disabled={!canEdit}
                                >
                                    <option value="IQD">IQD - Iraqi Dinar</option>
                                    <option value="USD">USD - US Dollar</option>
                                </select>
                            </div>

                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Restaurant Address
                                </label>
                                <input
                                    type="text"
                                    value={menu.theme?.address || ''}
                                    onChange={(e) => {
                                        setMenu(prev => ({
                                            ...prev,
                                            theme: { ...(prev.theme || {}), address: e.target.value }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    placeholder="e.g., 123 Main St, Baghdad"
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.81 12.81 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                    Contact Phone
                                </label>
                                <input
                                    type="text"
                                    value={menu.theme?.phone || ''}
                                    onChange={(e) => {
                                        setMenu(prev => ({
                                            ...prev,
                                            theme: { ...(prev.theme || {}), phone: e.target.value }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    placeholder="e.g., +964 770 123 4567"
                                    disabled={!canEdit}
                                />
                            </div>

                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
                                    </svg>
                                    WiFi Name / Password
                                </label>
                                <input
                                    type="text"
                                    value={menu.theme?.wifi || ''}
                                    onChange={(e) => {
                                        setMenu(prev => ({
                                            ...prev,
                                            theme: { ...(prev.theme || {}), wifi: e.target.value }
                                        }));
                                        setHasChanges(true);
                                    }}
                                    placeholder="e.g., GuestWifi / 12345678"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className={styles.settingGroup}>
                                <label>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    Public URL
                                </label>
                                <div className={styles.urlPreview}>
                                    {APP_CONFIG.url || 'http://localhost:3000'}/menu/{menu.slug}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'share' && (
                        <div className={styles.shareSection}>
                            <div className={styles.shareGrid}>
                                <div className={styles.qrCard} ref={qrCardRef}>
                                    <div className={styles.qrHeader} style={{ background: currentTheme.colors.accent }}>
                                        <div className={styles.qrIcon}>{currentTheme.preview}</div>
                                        <h3>{menu.name}</h3>
                                        <p>Scan to view menu</p>
                                    </div>
                                    <div className={styles.qrBody}>
                                        <div className={styles.qrCode}>
                                            <img src={getQRCodeUrl()} alt="Menu QR Code" crossOrigin="anonymous" />
                                        </div>
                                    </div>
                                    <div className={styles.qrFooter}>
                                        <span>Powered by OneKit</span>
                                    </div>
                                </div>

                                <div className={styles.shareInfo}>
                                    <h2>Ready to go live?</h2>
                                    <p>Download your unique QR code to place on your tables, menus, or windows.</p>

                                    <div className={styles.shareActions}>
                                        <button
                                            className={styles.downloadBtn}
                                            onClick={downloadBadge}
                                            disabled={downloading}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="currentColor" strokeWidth="2" />
                                                <path d="M8 12l4 4 4-4M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            {downloading ? 'Capturing...' : 'Download Full Badge'}
                                        </button>

                                        <button
                                            className={styles.copyBtn}
                                            onClick={downloadQRCode}
                                            disabled={downloading}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            QR Only
                                        </button>

                                        <button
                                            className={styles.copyBtn}
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/menu/${menu.slug}`);
                                                alert('Menu link copied to clipboard!');
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            Copy Link
                                        </button>
                                    </div>

                                    <div className={styles.tipsSection}>
                                        <h4>💡 Pro Tips:</h4>
                                        <ul>
                                            <li>Place QR codes on every table for contactless ordering</li>
                                            <li>Add them to your social media bios</li>
                                            <li>Print them on your physical receipts</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Category Modal */}
            {showCategoryModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCategoryModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g., Main Dishes"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (optional)</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    placeholder="Brief description..."
                                    rows={2}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category Image (Highly recommended for Magazine layout)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCategoryImageUpload}
                                    className={styles.fileInput}
                                    disabled={uploadingCategoryImage}
                                />
                                {uploadingCategoryImage && <span className={styles.uploadingNote}>Uploading...</span>}
                                {categoryForm.image_url && (
                                    <div className={styles.thumbnailPreview}>
                                        <img src={categoryForm.image_url} alt="Category Thumbnail" />
                                        <button onClick={() => setCategoryForm(prev => ({ ...prev, image_url: '' }))}>Remove</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowCategoryModal(false)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handleSaveCategory} disabled={saving}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className={styles.modalOverlay} onClick={() => setShowItemModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                            <button onClick={() => setShowItemModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="e.g., Grilled Chicken"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (optional)</label>
                                <textarea
                                    value={itemForm.description}
                                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                    placeholder="Item description..."
                                    rows={2}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Price ({menu.currency})</label>
                                    <input
                                        type="number"
                                        value={itemForm.price}
                                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Item Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleItemImageUpload}
                                        className={styles.fileInput}
                                        disabled={uploadingItemImage}
                                    />
                                    {uploadingItemImage && <span className={styles.uploadingNote}>Uploading...</span>}
                                    {itemForm.image_url && (
                                        <div className={styles.thumbnailPreview}>
                                            <img src={itemForm.image_url} alt="Thumbnail" />
                                            <div className={styles.thumbnailActions}>
                                                <button
                                                    onClick={() => setShowPhotoStudio(true)}
                                                    className={styles.studioOpenBtn}
                                                    type="button"
                                                >
                                                    ✨ Magic Studio
                                                </button>
                                                <button onClick={() => setItemForm(prev => ({ ...prev, image_url: '' }))}>Remove</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={itemForm.is_available}
                                        onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                                    />
                                    Available
                                </label>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={itemForm.is_featured}
                                        onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                                    />
                                    Featured (Chef's Choice)
                                </label>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setShowItemModal(false)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={handleSaveItem} disabled={saving || uploadingItemImage}>
                                {(saving || uploadingItemImage) ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPhotoStudio && (
                <PhotoStudio
                    imageUrl={itemForm.image_url}
                    onSave={handleStudioSave}
                    onClose={() => setShowPhotoStudio(false)}
                />
            )}
        </div>
    );
}
