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
import {
    ChevronLeft,
    Eye,
    Save,
    Check,
    Globe,
    X,
    Plus,
    Edit,
    Trash2,
    Palette,
    Settings,
    Share2,
    AlertTriangle,
    ImageIcon,
    LayoutGrid,
    Type,
    DollarSign,
    MapPin,
    Phone,
    Wifi,
    ExternalLink,
    Download,
    Copy,
    Info,
    Sparkles,
    Loader2,
    Upload,
    Utensils
} from 'lucide-react';


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

export default function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 text-neutral-500">
                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                <span className="font-medium animate-pulse">Loading menu...</span>
            </div>
        );
    }

    if (!menu) return null;

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-sm">
                <button
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-100 text-neutral-600 border-none rounded-xl cursor-pointer text-sm font-semibold hover:bg-neutral-200 transition-all hover:-translate-x-0.5"
                    onClick={() => router.push('/dashboard/menu-maker')}
                >
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="flex-1 text-lg font-bold text-neutral-900 truncate">{menu.name}</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                    {menu.is_published && (
                        <a
                            href={`/menu/${menu.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-100 text-neutral-900 no-underline rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors"
                        >
                            <Eye size={18} />
                            <span className="hidden md:inline">View Live</span>
                        </a>
                    )}
                    <button
                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${saveStatus === 'saved'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                            }`}
                        onClick={handleSave}
                        disabled={!hasChanges || saveStatus === 'saving' || !canEdit}
                    >
                        {saveStatus === 'saving' ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : saveStatus === 'saved' ? (
                            <Check size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span className="hidden md:inline">
                            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
                        </span>
                    </button>
                    <button
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${menu.is_published
                            ? 'bg-neutral-800 text-white hover:bg-neutral-900'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'
                            }`}
                        onClick={handlePublish}
                        disabled={saving}
                    >
                        {menu.is_published ? <X size={18} /> : <Globe size={18} />}
                        <span>{menu.is_published ? 'Unpublish' : 'Publish'}</span>
                    </button>
                </div>
            </div>

            {!canEdit && (
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 text-amber-800 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <AlertTriangle size={16} />
                    <span>Your trial has expired.</span>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to Menu Maker')}
                        target="_blank"
                        className="text-primary-600 font-bold hover:underline"
                    >
                        Subscribe to edit
                    </a>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 px-4 sm:px-6 py-3 bg-white border-b border-neutral-200 sticky top-[73px] z-20 overflow-x-auto no-scrollbar">
                {[
                    { id: 'categories', label: 'Categories & Items', icon: LayoutGrid },
                    { id: 'theme', label: 'Theme & Style', icon: Palette },
                    { id: 'settings', label: 'Settings', icon: Settings },
                    { id: 'share', label: 'Share', icon: Share2 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-500 hover:bg-neutral-50'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Container */}
            <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {activeTab === 'categories' && (
                        <div className="flex flex-col gap-4">
                            {canEdit && (
                                <button
                                    className="flex items-center justify-center gap-2 w-full p-5 bg-white text-primary-600 border-2 border-dashed border-primary-200 rounded-2xl font-black hover:bg-primary-50 hover:border-primary-400 transition-all active:scale-[0.98] shadow-sm"
                                    onClick={() => openCategoryModal()}
                                >
                                    <Plus size={20} />
                                    Add New Category
                                </button>
                            )}

                            {categories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
                                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-300">
                                        <LayoutGrid size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No categories yet</h3>
                                    <p className="max-w-xs text-center">Add your first category (e.g., Appetizers, Main Course) to start building your menu.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-8">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start p-6 bg-neutral-50/50 border-b border-neutral-100">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                                        <span className="w-2 h-6 bg-primary-500 rounded-full" />
                                                        {cat.name}
                                                    </h3>
                                                    {cat.description && <p className="text-sm text-neutral-500 font-medium pl-4">{cat.description}</p>}
                                                </div>
                                                {canEdit && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openCategoryModal(cat)}
                                                            title="Edit"
                                                            className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            title="Delete"
                                                            className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-90"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-4 p-6">
                                                {items.filter(i => i.category_id === cat.id).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all group relative">
                                                        {item.image_url ? (
                                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-100 shadow-sm transition-transform group-hover:scale-105">
                                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-20 h-20 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100 text-neutral-300">
                                                                <ImageIcon size={32} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="text-base font-bold text-neutral-900 truncate">
                                                                    {item.name}
                                                                </h4>
                                                                {item.is_featured && (
                                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                                        <Sparkles size={10} /> Chef's Choice
                                                                    </span>
                                                                )}
                                                                {!item.is_available && (
                                                                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                                        Unavailable
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.description && <p className="text-xs text-neutral-500 font-medium line-clamp-2 mb-2">{item.description}</p>}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                                                                    {formatCurrency(item.price, menu.currency)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {canEdit && (
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => openItemModal(cat.id, item)}
                                                                    className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                                                                >
                                                                    <Edit size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {canEdit && (
                                                    <button
                                                        className="flex items-center justify-center gap-2 w-full p-4 bg-neutral-50 text-neutral-500 border border-dashed border-neutral-200 rounded-2xl font-bold hover:bg-neutral-100 hover:text-neutral-700 hover:border-neutral-300 transition-all group"
                                                        onClick={() => openItemModal(cat.id)}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                            <Plus size={16} />
                                                        </div>
                                                        Add New Item to {cat.name}
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
                        <div className="flex flex-col gap-8 bg-white border border-neutral-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3 mb-2">
                                    <Palette className="text-primary-500" size={28} />
                                    Choose Theme
                                </h2>
                                <p className="text-neutral-500 font-medium">Select a theme that matches your restaurant's brand and personality.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {MENU_THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={`group relative flex flex-col items-center gap-4 p-4 sm:p-6 bg-white border-2 rounded-[2rem] transition-all duration-300 cursor-pointer active:scale-95 ${menu.template_id === theme.id
                                            ? 'border-primary-500 bg-primary-50/30 shadow-xl shadow-primary-500/10 scale-105 z-10'
                                            : 'border-neutral-100 hover:border-primary-200 hover:scale-[1.02]'
                                            }`}
                                        onClick={() => changeTheme(theme.id)}
                                        disabled={!canEdit}
                                    >
                                        <div
                                            className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 shadow-inner group-hover:rotate-2 transition-transform"
                                            style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.accent, borderWidth: '2px' }}
                                        >
                                            <div className="text-4xl drop-shadow-md" style={{ color: theme.colors.primary }}>{theme.preview}</div>
                                            <div className="flex gap-1.5">
                                                <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                                                <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: theme.colors.accent }} />
                                            </div>
                                        </div>
                                        <span className={`text-sm font-black transition-colors ${menu.template_id === theme.id ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-900'}`}>{theme.name}</span>
                                        {menu.template_id === theme.id && (
                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-in zoom-in duration-300">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="flex flex-col gap-8 bg-white border border-neutral-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm max-w-2xl">
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3 mb-2">
                                    <Settings className="text-primary-500" size={28} />
                                    General Settings
                                </h2>
                                <p className="text-neutral-500 font-medium">Configure your restaurant's basic information and preferences.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <Type size={16} className="text-primary-500" />
                                        Menu Name
                                    </label>
                                    <input
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        type="text"
                                        value={menu.name}
                                        onChange={(e) => {
                                            setMenu(prev => ({ ...prev, name: e.target.value }));
                                            setHasChanges(true);
                                        }}
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-primary-500" />
                                        Restaurant Logo
                                    </label>
                                    {menu.logo_url ? (
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl group">
                                            <img src={menu.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                            <button
                                                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                                                onClick={() => {
                                                    setMenu(prev => ({ ...prev, logo_url: null }));
                                                    setHasChanges(true);
                                                }}
                                                disabled={!canEdit}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative flex flex-col items-center justify-center gap-3 p-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[2rem] hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer group">
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
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <Upload className="text-neutral-300 group-hover:text-primary-500 transition-colors" size={32} />
                                            <span className="text-xs font-bold text-neutral-500">Upload Logo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <ImageIcon className="text-primary-500" size={16} />
                                        Hero Background Image
                                    </label>
                                    {menu.theme?.hero_image ? (
                                        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 shadow-lg group">
                                            <img src={menu.theme.hero_image} alt="Hero" className="w-full h-40 object-cover" />
                                            <button
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setMenu(prev => ({
                                                        ...prev,
                                                        theme: { ...(prev.theme || {}), hero_image: null }
                                                    }));
                                                    setHasChanges(true);
                                                }}
                                                disabled={!canEdit}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative flex flex-col items-center justify-center gap-3 p-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[2rem] hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer group">
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
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <Upload className="text-neutral-300 group-hover:text-primary-500 transition-colors" size={32} />
                                            <span className="text-xs font-bold text-neutral-500">Upload Background</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <DollarSign size={16} className="text-primary-500" />
                                        Currency
                                    </label>
                                    <select
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base font-bold focus:bg-white focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
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

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <MapPin size={16} className="text-primary-500" />
                                        Restaurant Address
                                    </label>
                                    <input
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
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

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <Phone size={16} className="text-primary-500" />
                                        Contact Phone
                                    </label>
                                    <input
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
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

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <Wifi size={16} className="text-primary-500" />
                                        WiFi Details
                                    </label>
                                    <input
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-base font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        type="text"
                                        value={menu.theme?.wifi || ''}
                                        onChange={(e) => {
                                            setMenu(prev => ({
                                                ...prev,
                                                theme: { ...(prev.theme || {}), wifi: e.target.value }
                                            }));
                                            setHasChanges(true);
                                        }}
                                        placeholder="SSID / Password (Optional)"
                                        disabled={!canEdit}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                                        <Globe size={16} className="text-primary-500" />
                                        Public URL
                                    </label>
                                    <div className="p-4 bg-primary-50 text-primary-700 border border-primary-100 rounded-2xl text-sm font-black break-all flex items-center justify-between gap-4 group">
                                        <span className="truncate">{APP_CONFIG.url || 'http://localhost:3000'}/menu/{menu.slug}</span>
                                        <ExternalLink size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'share' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                                {/* QR Card */}
                                <div className="lg:col-span-4 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-100 sticky top-24" ref={qrCardRef}>
                                    <div className="p-8 text-center text-white" style={{ background: currentTheme.colors.primary }}>
                                        <div className="text-5xl mb-4 animate-bounce duration-1000">{currentTheme.preview}</div>
                                        <h3 className="text-2xl font-black mb-1">{menu.name}</h3>
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Scan to view menu</p>
                                    </div>
                                    <div className="p-10 bg-white flex justify-center">
                                        <div className="w-full aspect-square p-4 bg-neutral-50 rounded-[2rem] border-8 border-neutral-100 shadow-inner flex items-center justify-center">
                                            <img src={getQRCodeUrl()} alt="Menu QR Code" crossOrigin="anonymous" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                    </div>
                                    <div className="p-5 bg-neutral-50 text-center border-t border-neutral-100">
                                        <span className="text-[10px] font-black text-neutral-300 tracking-[0.3em] uppercase">Powered by OneKit</span>
                                    </div>
                                </div>

                                {/* Share Info */}
                                <div className="lg:col-span-8 flex flex-col gap-8 py-6">
                                    <div>
                                        <h2 className="text-4xl sm:text-5xl font-black text-neutral-900 leading-tight mb-4 italic">
                                            Ready to <span className="text-primary-600 underline">go live?</span>
                                        </h2>
                                        <p className="text-lg text-neutral-500 font-medium max-w-xl">
                                            Your digital menu is ready. Download your unique QR code to place on your tables, windows, or promotional materials.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            className="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50"
                                            onClick={downloadBadge}
                                            disabled={downloading}
                                        >
                                            {downloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                            {downloading ? 'Generating...' : 'Download Full Badge'}
                                        </button>

                                        <button
                                            className="flex items-center gap-3 px-6 py-4 bg-white text-neutral-900 border-2 border-neutral-100 rounded-2xl font-black text-sm transition-all active:scale-95 hover:border-primary-200 hover:bg-neutral-50 disabled:opacity-50"
                                            onClick={downloadQRCode}
                                            disabled={downloading}
                                        >
                                            <ImageIcon size={20} className="text-primary-500" />
                                            QR Only
                                        </button>

                                        <button
                                            className="flex items-center gap-3 px-6 py-4 bg-white text-neutral-900 border-2 border-neutral-100 rounded-2xl font-black text-sm transition-all active:scale-95 hover:border-primary-200 hover:bg-neutral-50"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/menu/${menu.slug}`);
                                                alert('Menu link copied to clipboard!');
                                            }}
                                        >
                                            <Copy size={20} className="text-primary-500" />
                                            Copy Link
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                            <h4 className="font-black text-amber-800 flex items-center gap-2 mb-2">
                                                <Sparkles size={18} />
                                                Pro Tip
                                            </h4>
                                            <p className="text-sm text-amber-700 font-medium leading-relaxed">
                                                Print your QR code and place it in clear acrylic stands on every table for a contactless experience.
                                            </p>
                                        </div>
                                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                            <h4 className="font-black text-blue-800 flex items-center gap-2 mb-2">
                                                <Info size={18} />
                                                Marketing
                                            </h4>
                                            <p className="text-sm text-blue-700 font-medium leading-relaxed">
                                                Add the menu link to your Instagram and Facebook bios to let customers browse before they arrive.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCategoryModal(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
                            <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                <Plus className="text-primary-500" size={24} />
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                <X size={20} className="text-neutral-400" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Category Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        placeholder="e.g., Main Dishes"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Category Description (Optional)</label>
                                    <textarea
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        placeholder="Brief description of this category..."
                                        rows={2}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Category Image</label>
                                    <div className="relative group">
                                        {categoryForm.image_url ? (
                                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 shadow-lg">
                                                <img src={categoryForm.image_url} alt="Category" className="w-full h-full object-cover" />
                                                <button
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setCategoryForm(prev => ({ ...prev, image_url: '' }))}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative flex flex-col items-center justify-center gap-3 p-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCategoryImageUpload}
                                                    disabled={uploadingCategoryImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <Upload className={`text-neutral-300 ${uploadingCategoryImage ? 'animate-bounce text-primary-500' : 'group-hover:text-primary-500'}`} size={32} />
                                                <span className="text-xs font-bold text-neutral-500">
                                                    {uploadingCategoryImage ? 'Uploading...' : 'Upload Image'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 bg-neutral-50 border-t border-neutral-100">
                            <button
                                className="px-6 py-2.5 text-sm font-black text-neutral-500 hover:text-neutral-900 transition-colors"
                                onClick={() => setShowCategoryModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleSaveCategory}
                                disabled={saving || uploadingCategoryImage}
                            >
                                {saving ? <Loader2 className="animate-spin inline-block mr-2" size={16} /> : null}
                                {saving ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowItemModal(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
                            <h2 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                                <Utensils className="text-primary-500" size={24} />
                                {editingItem ? 'Edit Item' : 'Add Item'}
                            </h2>
                            <button
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                                onClick={() => setShowItemModal(false)}
                            >
                                <X size={20} className="text-neutral-400" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Item Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={itemForm.name}
                                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                        placeholder="e.g., Grilled Chicken"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Description (Optional)</label>
                                    <textarea
                                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 transition-all outline-none resize-none"
                                        value={itemForm.description}
                                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                        placeholder="Describe your item..."
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-black text-neutral-700">Price ({menu.currency})</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                            value={itemForm.price}
                                            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-black text-neutral-700">Availability</label>
                                        <div className="flex items-center gap-2 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl h-[58px]">
                                            <input
                                                type="checkbox"
                                                id="is_available"
                                                className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                                checked={itemForm.is_available}
                                                onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                                            />
                                            <label htmlFor="is_available" className="text-sm font-bold text-neutral-600 cursor-pointer">In Stock</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-black text-neutral-700">Item Image</label>
                                    <div className="relative group">
                                        {itemForm.image_url ? (
                                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-lg">
                                                <img src={itemForm.image_url} alt="Item" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-xl text-xs font-black shadow-lg shadow-white/10 hover:bg-neutral-50 active:scale-95 transition-all"
                                                        onClick={() => setShowPhotoStudio(true)}
                                                        type="button"
                                                    >
                                                        <Sparkles size={14} className="text-primary-500" />
                                                        Magic Studio
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/10 hover:bg-red-700 active:scale-95 transition-all"
                                                        onClick={() => setItemForm(prev => ({ ...prev, image_url: '' }))}
                                                    >
                                                        <Trash2 size={14} />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative flex flex-col items-center justify-center gap-3 p-10 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleItemImageUpload}
                                                    disabled={uploadingItemImage}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <Upload className={`text-neutral-300 ${uploadingItemImage ? 'animate-bounce text-primary-500' : 'group-hover:text-primary-500'}`} size={32} />
                                                <span className="text-xs font-bold text-neutral-500">
                                                    {uploadingItemImage ? 'Uploading...' : 'Upload Image'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        className="w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                                        checked={itemForm.is_featured}
                                        onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                                    />
                                    <label htmlFor="is_featured" className="text-sm font-black text-primary-700 cursor-pointer flex items-center gap-2">
                                        <Sparkles size={14} />
                                        Feature as Chef's Choice
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 bg-neutral-50 border-t border-neutral-100">
                            <button
                                className="px-6 py-2.5 text-sm font-black text-neutral-500 hover:text-neutral-900 transition-colors"
                                onClick={() => setShowItemModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleSaveItem}
                                disabled={saving || uploadingItemImage}
                            >
                                {saving ? <Loader2 className="animate-spin inline-block mr-2" size={16} /> : null}
                                {saving ? 'Saving...' : 'Save Item'}
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
