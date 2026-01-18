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
import {
    ChevronLeft, Eye, Save, Check, Globe, X, Plus, Edit, Trash2, Palette, Settings, Share2,
    AlertTriangle, ImageIcon, LayoutGrid, Type, DollarSign, MapPin, Phone, Wifi, ExternalLink,
    Download, Copy, Info, Sparkles, Loader2, Upload, Utensils, ArrowRight, MousePointer2
} from 'lucide-react';

const MENU_THEMES = [
    { id: 'classic', name: 'Classic', preview: '📋', colors: { primary: '#1a1a1a', accent: '#c4a44a', bg: '#ffffff' } },
    { id: 'elegant', name: 'Elegant', preview: '🍽️', colors: { primary: '#2d3436', accent: '#6c5ce7', bg: '#fafafa' } },
    { id: 'vintage', name: 'Vintage', preview: '📜', colors: { primary: '#5c4033', accent: '#8b4513', bg: '#f5f5dc' } },
    { id: 'modern', name: 'Modern', preview: '✨', colors: { primary: '#1e293b', accent: '#3b82f6', bg: '#ffffff' } },
    { id: 'minimalist', name: 'Minimalist', preview: '⬜', colors: { primary: '#000000', accent: '#666666', bg: '#ffffff' } },
    { id: 'bold', name: 'Bold', preview: '🔥', colors: { primary: '#dc2626', accent: '#f97316', bg: '#ffffff' } },
    { id: 'luxury', name: 'Luxury', preview: '💎', colors: { primary: '#1c1917', accent: '#d4af37', bg: '#0c0a09' } },
    { id: 'neon', name: 'Neon', preview: '🌈', colors: { primary: '#f0abfc', accent: '#22d3ee', bg: '#18181b' } },
    { id: 'organic', name: 'Organic', preview: '🌿', colors: { primary: '#365314', accent: '#84cc16', bg: '#f7fee7' } },
    { id: 'poster', name: 'Poster', preview: '🖼️', colors: { primary: '#1a1a1a', accent: '#333333', bg: '#f5f5f0' } },
    { id: 'chalkboard', name: 'Chalkboard', preview: '🎨', colors: { primary: '#ffffff', accent: '#d4a537', bg: '#2d2d2d' } },
    { id: 'premium', name: 'Premium', preview: '👑', colors: { primary: '#ffffff', accent: '#f59e0b', bg: '#1a1a1a' } },
    { id: 'oddmenu', name: 'OddMenu', preview: '📱', colors: { primary: '#111827', accent: '#FF7F50', bg: '#F9FAFB' } },
];

/**
 * MenuEditorPage - OneKit 3.0 Absolute Perfection Edition
 * Rebuilt from the ground up with native Tailwind v4.
 */
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

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' });
    const [itemForm, setItemForm] = useState({
        name: '', description: '', price: '', image_url: '', is_available: true, is_featured: false
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [uploadingItemImage, setUploadingItemImage] = useState(false);
    const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    const menuRef = useRef(menu);
    useEffect(() => { menuRef.current = menu; }, [menu]);

    const accessStatus = getAccessStatus('menu-maker');
    const canEdit = accessStatus?.hasAccess || false;
    const currentTheme = MENU_THEMES.find(t => t.id === menu?.template_id) || MENU_THEMES[0];

    useEffect(() => {
        const loadMenu = async () => {
            const data = await fetchMenu(id);
            if (data) {
                setMenu(data);
                lastSavedStateRef.current = JSON.stringify({
                    name: data.name, currency: data.currency, template_id: data.template_id,
                    logo_url: data.logo_url, theme: data.theme
                });
            } else { router.push('/dashboard/menu-maker'); }
            setLoading(false);
        };
        loadMenu();
    }, [id]);

    const handlePublish = async () => {
        await updateMenu(id, { is_published: !menu.is_published });
        setMenu(prev => ({ ...prev, is_published: !prev.is_published }));
    };

    const getQRCodeUrl = () => {
        const pageUrl = `${window.location.host === 'localhost:3000' ? 'http://' : 'https://'}${window.location.host}/menu/${menu?.slug}`;
        const accentColor = currentTheme?.colors?.accent?.replace('#', '') || '1a1a1a';
        return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(pageUrl)}&color=${accentColor}&format=png`;
    };

    const downloadBadge = async () => {
        if (!qrCardRef.current || !menu) return;
        setDownloading(true);
        try {
            await new Promise(r => setTimeout(r, 200));
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(qrCardRef.current, {
                useCORS: true, scale: 3, backgroundColor: null, logging: false,
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${menu.slug}-badge.png`;
            link.click();
        } catch (error) { alert('Failed to download badge.'); }
        finally { setDownloading(true); setTimeout(() => setDownloading(false), 2000); }
    };

    const handleSave = useCallback(async () => {
        if (!hasChanges || !menu || saveStatus === 'saving') return;
        const stateToSave = { name: menu.name, currency: menu.currency, template_id: menu.template_id, logo_url: menu.logo_url, theme: menu.theme };
        const stateToSaveStr = JSON.stringify(stateToSave);
        setSaveStatus('saving');
        try {
            const { data, error } = await updateMenu(id, stateToSave);
            if (error) { setSaveStatus('idle'); return; }
            if (data) setMenu(data);
            lastSavedStateRef.current = stateToSaveStr;
            setHasChanges(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) { setSaveStatus('idle'); }
    }, [id, menu, hasChanges, updateMenu, saveStatus]);

    useEffect(() => {
        if (!hasChanges) return;
        const timer = setTimeout(() => handleSave(), 3000);
        return () => clearTimeout(timer);
    }, [hasChanges, handleSave]);

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
        const data = { name: categoryForm.name, description: categoryForm.description, image_url: categoryForm.image_url };
        if (editingCategory) { await updateCategory(editingCategory.id, data); }
        else { await addCategory(id, data.name, data.description, data.image_url); }
        setShowCategoryModal(false);
    };

    const openItemModal = (catId, item = null) => {
        setSelectedCategory(catId);
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name, description: item.description || '', price: item.price?.toString() || '',
                image_url: item.image_url || '', is_available: item.is_available !== false, is_featured: item.is_featured === true,
            });
        } else {
            setEditingItem(null);
            setItemForm({ name: '', description: '', price: '', image_url: '', is_available: true, is_featured: false });
        }
        setShowItemModal(true);
    };

    const handleSaveItem = async () => {
        if (!itemForm.name.trim()) return;
        const data = { name: itemForm.name, description: itemForm.description, price: itemForm.price ? parseFloat(itemForm.price) : null, image_url: itemForm.image_url, is_available: itemForm.is_available, is_featured: itemForm.is_featured };
        if (editingItem) { await updateItem(editingItem.id, data); }
        else { await addItem(id, selectedCategory, data); }
        setShowItemModal(false);
    };

    const handleCategoryImageUpload = async (e) => {
        const file = e.target.files[0]; if (!file || !user) return;
        setUploadingCategoryImage(true);
        try {
            const publicUrl = await uploadImage(file, { folder: 'menu-categories', type: 'photo' });
            if (publicUrl) setCategoryForm(prev => ({ ...prev, image_url: publicUrl }));
        } finally { setUploadingCategoryImage(false); }
    };

    const handleItemImageUpload = async (e) => {
        const file = e.target.files[0]; if (!file || !user) return;
        setUploadingItemImage(true);
        try {
            const publicUrl = await uploadImage(file, { folder: 'menu-items', type: 'photo' });
            if (publicUrl) setItemForm(prev => ({ ...prev, image_url: publicUrl }));
        } finally { setUploadingItemImage(false); }
    };

    const handleStudioSave = async (editedBlob) => {
        if (!user) return; setUploadingItemImage(true); setShowPhotoStudio(false);
        try {
            const file = new File([editedBlob], 'edited-image.png', { type: 'image/png' });
            const publicUrl = await uploadImage(file, { folder: 'menu-items', type: 'photo' });
            if (publicUrl) setItemForm(prev => ({ ...prev, image_url: publicUrl }));
        } finally { setUploadingItemImage(false); }
    };

    const isMounted = useRef(true);
    const lastSavedStateRef = useRef(null);
    useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white selection:bg-primary-900 selection:text-white">
                <div className="spinner" />
                <span className="text-sm font-black text-neutral-400 uppercase tracking-[0.3em] animate-pulse">Syncing Studio...</span>
            </div>
        );
    }
    if (!menu) return null;

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50/50">
            {/* Header: OneKit 3.0 Glass Editor Shell */}
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-neutral-200/50 px-6 py-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push('/dashboard/menu-maker')}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all group"
                    >
                        <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-neutral-900 line-clamp-1 tracking-tight">{menu.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${menu.is_published ? 'bg-green-500 animate-pulse' : 'bg-neutral-300'}`} />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                {menu.is_published ? 'Protocol Live' : 'Draft Mode'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {menu.is_published && (
                        <a href={`/menu/${menu.slug}`} target="_blank" className="hidden md:flex items-center gap-2 px-6 py-3 bg-neutral-50 text-neutral-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-neutral-100 transition-all border border-neutral-100">
                            <Eye size={16} /> Live Preview
                        </a>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saveStatus === 'saving' || !canEdit}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50'
                            }`}
                    >
                        {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={16} /> : saveStatus === 'saved' ? <Check size={16} /> : <Save size={16} />}
                        <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Syncing' : saveStatus === 'saved' ? 'Synced' : 'Sync Changes'}</span>
                    </button>
                    <button
                        onClick={handlePublish}
                        className={`btn-premium flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${menu.is_published ? 'bg-[#1E293B] hover:bg-[#0F172A] shadow-neutral-900/20' : 'bg-[#22C55E] hover:bg-[#16A34A] shadow-green-600/20'
                            }`}
                    >
                        {menu.is_published ? <X size={16} /> : <Globe size={16} />}
                        <span>{menu.is_published ? 'Deactivate' : 'Go Live'}</span>
                    </button>
                </div>
            </header>

            {/* Trial Warning: Floating Aesthetic */}
            {!canEdit && (
                <div className="mx-6 mt-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center gap-4 text-orange-800 text-sm font-bold shadow-xl shadow-orange-900/5 animate-fade-in-up">
                    <AlertTriangle size={18} />
                    <span>Trial expired. Access restricted to view-only.</span>
                    <a href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to Menu Maker')} target="_blank" className="bg-orange-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all">Subscribe</a>
                </div>
            )}

            {/* Content Explorer: Tabs */}
            <div className="px-6 mt-8 flex flex-col gap-10">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'categories', label: 'Ecosystem', icon: LayoutGrid },
                        { id: 'theme', label: 'Blueprint', icon: Palette },
                        { id: 'settings', label: 'Core', icon: Settings },
                        { id: 'share', label: 'Deploy', icon: Share2 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-500 ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'text-neutral-400 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 3 : 2} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <main className="max-w-7xl mx-auto w-full pb-32">
                    {activeTab === 'categories' && (
                        <div className="space-y-10">
                            {canEdit && (
                                <button
                                    onClick={() => openCategoryModal()}
                                    className="w-full group p-6 bg-white border-2 border-dashed border-neutral-100 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary-500 hover:bg-primary-50/20 transition-all duration-500 active:scale-[0.99] shadow-sm"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                        <Plus size={24} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-md font-black text-neutral-900 tracking-tight">Expand Infrastructure</h3>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Add new category block</p>
                                    </div>
                                </button>
                            )}

                            <div className="space-y-16">
                                {categories.map((cat) => (
                                    <section key={cat.id} className="space-y-8 animate-reveal">
                                        <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-1 h-8 bg-primary-600 rounded-full" />
                                                <div>
                                                    <h2 className="text-xl font-black text-neutral-900 tracking-tighter italic">{cat.name}</h2>
                                                    <p className="text-xs font-medium text-neutral-400">{cat.description || 'Global Protocol Active'}</p>
                                                </div>
                                            </div>
                                            {canEdit && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openCategoryModal(cat)} className="w-11 h-11 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-xl hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all"><Edit size={18} /></button>
                                                    <button onClick={() => { if (confirm('Incinerate category?')) deleteCategory(cat.id); }} className="w-11 h-11 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-xl hover:text-red-500 hover:border-red-100 shadow-sm transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {items.filter(i => i.category_id === cat.id).map((item) => (
                                                <div key={item.id} className="group relative bg-white border border-neutral-100 rounded-[28px] p-5 shadow-sm hover:shadow-premium-layered hover:-translate-y-1 transition-all duration-500">
                                                    <div className="flex gap-5 items-start">
                                                        <div className="w-20 h-20 rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                            {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-200"><ImageIcon size={24} /></div>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <h4 className="font-black text-neutral-900 truncate tracking-tight">{item.name}</h4>
                                                                {item.is_featured && <Sparkles size={14} className="text-amber-500 animate-pulse shrink-0" />}
                                                            </div>
                                                            <p className="text-xs font-bold text-neutral-400 line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-xl">
                                                                    {formatCurrency(item.price, menu.currency)}
                                                                </span>
                                                                {!item.is_available && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-100 px-2 py-0.5 rounded-full bg-red-50">Offline</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {canEdit && (
                                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                                            <button onClick={() => openItemModal(cat.id, item)} className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur shadow-xl rounded-full text-neutral-400 hover:text-primary-600 border border-neutral-100"><Edit size={14} /></button>
                                                            <button onClick={() => { if (confirm('Deactivate item?')) deleteItem(item.id); }} className="w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur shadow-xl rounded-full text-neutral-400 hover:text-red-500 border border-neutral-100"><Trash2 size={14} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {canEdit && (
                                                <button
                                                    onClick={() => openItemModal(cat.id)}
                                                    className="p-6 border-2 border-dashed border-neutral-100 rounded-[28px] flex flex-col items-center justify-center gap-3 text-neutral-400 hover:border-primary-200 hover:bg-primary-50/30 hover:text-primary-600 transition-all duration-300 group shadow-sm"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Content</span>
                                                </button>
                                            )}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-12 animate-reveal">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter italic">Vibe Architecture</h1>
                                <p className="text-sm text-neutral-400 font-medium max-w-lg">Transform your brand's digital presence with high-fidelity blueprints.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {MENU_THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => { setMenu(prev => ({ ...prev, template_id: theme.id })); setHasChanges(true); }}
                                        disabled={!canEdit}
                                        className={`group relative flex flex-col items-center gap-4 p-6 border-2 rounded-[32px] transition-all duration-500 active:scale-95 ${menu.template_id === theme.id
                                            ? 'border-primary-600 bg-white shadow-premium-layered scale-105 z-10'
                                            : 'border-neutral-50 bg-white shadow-sm hover:border-primary-200 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div
                                            className="w-full aspect-square rounded-[30px] flex flex-col items-center justify-center gap-4 transition-transform duration-700 group-hover:rotate-2 shadow-inner"
                                            style={{ backgroundColor: theme.colors.bg, border: `3px solid ${theme.colors.accent}` }}
                                        >
                                            <div className="text-6xl drop-shadow-xl" style={{ color: theme.colors.primary }}>{theme.preview}</div>
                                            <div className="flex gap-2">
                                                <div className="w-5 h-5 rounded-full ring-2 ring-white" style={{ backgroundColor: theme.colors.primary }} />
                                                <div className="w-5 h-5 rounded-full ring-2 ring-white" style={{ backgroundColor: theme.colors.accent }} />
                                            </div>
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-[0.2em] transition-colors ${menu.template_id === theme.id ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-900'}`}>{theme.name}</span>
                                        {menu.template_id === theme.id && (
                                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-in zoom-in duration-300">
                                                <Check size={20} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-reveal">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-neutral-900 tracking-tighter">Global Protocol Configuration</h2>
                                <p className="text-sm text-neutral-400 font-medium">Fine-tune the central nodes of your hospitality infrastructure.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 bg-white border border-neutral-100 rounded-[32px] p-6 lg:p-8 shadow-sm relative overflow-hidden">
                                <div className="texture-noise absolute inset-0 opacity-[0.02] pointer-events-none" />

                                <div className="space-y-3 relative z-10">
                                    <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Entity Brand Name</label>
                                    <div className="relative group">
                                        <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                        <input
                                            className="w-full pl-16 pr-6 py-3 bg-neutral-50 border border-neutral-100 rounded-[16px] font-black text-neutral-900 focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-neutral-200"
                                            value={menu.name}
                                            onChange={(e) => { setMenu(prev => ({ ...prev, name: e.target.value })); setHasChanges(true); }}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Visual Asset: Identity</label>
                                        <div className="relative group aspect-square rounded-[36px] bg-neutral-50 border-2 border-dashed border-neutral-100 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary-500 transition-all shadow-inner">
                                            {menu.logo_url ? (
                                                <>
                                                    <img src={menu.logo_url} className="w-full h-full object-cover" alt="Logo" />
                                                    <button onClick={() => { setMenu(prev => ({ ...prev, logo_url: null })); setHasChanges(true); }} className="absolute inset-0 bg-neutral-900/60 text-white font-black uppercase text-[9px] tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">Remove Identity</button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary-500"><Upload size={24} /></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-300">Upload Logo</span>
                                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => { const f = e.target.files?.[0]; if (f && canEdit) { const url = await uploadImage(f, { folder: 'logos' }); if (url) { setMenu(prev => ({ ...prev, logo_url: url })); setHasChanges(true); } } }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex flex-col">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Currency Matrix</label>
                                            <select className="w-full p-3 bg-neutral-50 border border-neutral-100 rounded-[16px] font-black text-neutral-900 outline-none appearance-none cursor-pointer hover:bg-neutral-100 transition-all" value={menu.currency} onChange={(e) => { setMenu(prev => ({ ...prev, currency: e.target.value })); setHasChanges(true); }}>
                                                <option value="IQD">IQD - Iraqi Dinar</option>
                                                <option value="USD">USD - US Dollar</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3 flex-1">
                                            <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1">Protocol Contact</label>
                                            <div className="relative h-[calc(100%-24px)] min-h-[140px] bg-neutral-50 border border-neutral-100 rounded-[28px] p-6 space-y-4 shadow-inner">
                                                <div className="flex items-center gap-3"><Phone size={14} className="text-primary-500" /><input placeholder="Phone" className="bg-transparent font-black text-xs outline-none w-full" value={menu.theme?.phone || ''} onChange={(e) => { setMenu(prev => ({ ...prev, theme: { ...prev.theme, phone: e.target.value } })); setHasChanges(true); }} /></div>
                                                <div className="flex items-center gap-3"><MapPin size={14} className="text-secondary-500" /><input placeholder="Address" className="bg-transparent font-black text-xs outline-none w-full" value={menu.theme?.address || ''} onChange={(e) => { setMenu(prev => ({ ...prev, theme: { ...prev.theme, address: e.target.value } })); setHasChanges(true); }} /></div>
                                                <div className="flex items-center gap-3"><Wifi size={14} className="text-accent-500" /><input placeholder="WiFi SSID" className="bg-transparent font-black text-xs outline-none w-full" value={menu.theme?.wifi || ''} onChange={(e) => { setMenu(prev => ({ ...prev, theme: { ...prev.theme, wifi: e.target.value } })); setHasChanges(true); }} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'share' && (
                        <div className="space-y-16 animate-reveal">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                                {/* Interactive QR Terminal */}
                                <div className="lg:col-span-5 bg-white rounded-[40px] shadow-2xl border border-neutral-100 overflow-hidden sticky top-32 group" ref={qrCardRef}>
                                    <div className="p-6 text-center text-white relative flex flex-col items-center gap-3" style={{ background: currentTheme.colors.primary }}>
                                        <div className="texture-noise absolute inset-0 opacity-10 pointer-events-none" />
                                        <div className="text-5xl group-hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-700">{currentTheme.preview}</div>
                                        <h3 className="text-xl font-black italic tracking-tighter">{menu.name}</h3>
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em]">Production Endpoint Live</div>
                                    </div>
                                    <div className="p-10 bg-white flex justify-center relative">
                                        <div className="w-full aspect-square bg-neutral-50 rounded-[32px] p-6 border-[8px] border-neutral-100 shadow-inner flex items-center justify-center cursor-none group">
                                            <img src={getQRCodeUrl()} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700" crossOrigin="anonymous" />
                                            <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-xl shadow-primary-600/40 animate-bounce"><MousePointer2 size={24} /></div>
                                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg">Scan Point</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-neutral-50/50 text-center border-t border-neutral-50">
                                        <div className="text-[10px] font-black text-neutral-300 tracking-[0.4em] uppercase">Architecture by OneKit Ecosystem</div>
                                    </div>
                                </div>

                                {/* Deployment Controls */}
                                <div className="lg:col-span-7 space-y-12 py-8">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">Ready for Production</span>
                                        <h2 className="text-3xl font-black text-neutral-900 leading-tight tracking-tighter italic">
                                            Release your <span className="bg-brand-gradient bg-clip-text text-transparent">masterpiece.</span>
                                        </h2>
                                        <p className="text-base text-neutral-400 font-medium leading-relaxed max-w-xl">
                                            Your infrastructure is optimized. Download your high-resolution deployment assets to globalize your hospitality experience.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <button
                                            onClick={downloadBadge}
                                            disabled={downloading}
                                            className="px-10 py-5 bg-primary-500 text-white rounded-[24px] font-black text-sm shadow-xl shadow-primary-500/25 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                                        >
                                            {downloading ? <Loader2 className="animate-spin" /> : <Download size={22} />}
                                            {downloading ? 'Compiling Assets...' : 'Download Full Badge'}
                                        </button>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/menu/${menu.slug}`); alert('Endpoint copied to clipboard'); }}
                                            className="px-8 py-5 bg-white border border-neutral-200 text-neutral-900 rounded-[24px] font-black text-sm shadow-sm hover:bg-neutral-50 hover:border-primary-200 transition-all flex items-center gap-4 active:scale-95"
                                        >
                                            <Copy size={20} className="text-primary-500" /> Copy Web Endpoint
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                        <div className="group p-8 bg-primary-50 rounded-[40px] border border-primary-100 shadow-sm hover:shadow-xl transition-all h-full">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform"><Sparkles size={28} /></div>
                                            <h4 className="font-black text-primary-900 text-lg mb-3">Optimization Pro</h4>
                                            <p className="text-sm font-medium text-primary-700/70 leading-relaxed">
                                                Print your assets on high-quality acrylic 3D stands for maximum customer interaction and tactile engagement.
                                            </p>
                                        </div>
                                        <div className="group p-8 bg-neutral-900 rounded-[40px] border border-neutral-800 shadow-xl hover:shadow-2xl transition-all h-full">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur shadow-sm flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"><Globe size={28} /></div>
                                            <h4 className="font-black text-white text-lg mb-3">Global Reach</h4>
                                            <p className="text-sm font-medium text-white/50 leading-relaxed">
                                                Embed your menu endpoint across your digital ecosystem—from Instagram bios to Google Maps profiles.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals & Studios: Standardized Excellence */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowCategoryModal(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col border border-neutral-100">
                        <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-neutral-900 tracking-tighter italic">{editingCategory ? 'Modify Category' : 'Initialize Category'}</h2>
                            <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors"><X /></button>
                        </div>
                        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto no-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-primary-600 uppercase tracking-widest ml-1">Block Identifer</label>
                                <input className="w-full p-5 bg-neutral-50 border border-neutral-100 rounded-[20px] font-black text-lg focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-neutral-200" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Main Nodes" autoFocus />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Block Metadata</label>
                                <textarea className="w-full p-5 bg-neutral-50 border border-neutral-100 rounded-[20px] font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all resize-none placeholder:text-neutral-200" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Describe this category protocol..." rows={3} />
                            </div>
                        </div>
                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex items-center gap-4">
                            <button className="flex-1 py-4 font-black text-neutral-400 uppercase tracking-widest text-[10px]" onClick={() => setShowCategoryModal(false)}>Abort</button>
                            <button className="flex-[2] py-4 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20 active:scale-95 transition-all" onClick={handleSaveCategory}>{editingCategory ? 'Overwrite' : 'Inject Block'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showItemModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowItemModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col border border-neutral-100 h-[90vh]">
                        <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
                            <h2 className="text-xl font-black text-neutral-900 tracking-tighter italic">{editingItem ? 'Item Overhaul' : 'Deploy New Item'}</h2>
                            <button onClick={() => setShowItemModal(false)} className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <section className="space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-primary-600 uppercase tracking-widest ml-1">Asset Designation</label>
                                        <input className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-[16px] font-black text-lg focus:bg-white focus:border-primary-500 outline-none transition-all placeholder:text-neutral-200" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g., Prime Ribsteak" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Asset Specification</label>
                                        <textarea className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-[16px] font-bold text-sm focus:bg-white focus:border-primary-500 outline-none transition-all resize-none h-32 leading-relaxed" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Detailed item specification..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-primary-600 uppercase tracking-widest ml-1">Valuation ({menu.currency})</label>
                                            <input type="number" className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[24px] font-black text-xl focus:bg-white transition-all outline-none" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Status Protocol</label>
                                            <div className={`p-6 rounded-[24px] flex items-center justify-between transition-colors border-2 ${itemForm.is_available ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{itemForm.is_available ? 'In Stock' : 'Out of Stock'}</span>
                                                <input type="checkbox" className="w-6 h-6 rounded-full cursor-pointer accent-current" checked={itemForm.is_available} onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative p-6 bg-primary-50 rounded-[28px] border border-primary-100 flex items-center justify-between group overflow-hidden">
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform"><Sparkles size={24} /></div>
                                            <span className="text-sm font-black text-primary-950">Elevate to "Chef's Choice"</span>
                                        </div>
                                        <input type="checkbox" className="w-6 h-6 rounded-full cursor-pointer accent-primary-600 relative z-10" checked={itemForm.is_featured} onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })} />
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                    </div>
                                </section>

                                <section className="space-y-10">
                                    <div className="space-y-6">
                                        <label className="text-[9px] font-black text-primary-600 uppercase tracking-widest ml-1">Visual Evidence</label>
                                        <div className="relative aspect-square rounded-[48px] bg-neutral-50 border-4 border-dashed border-neutral-100 overflow-hidden flex flex-col items-center justify-center gap-6 group hover:border-primary-500 transition-all shadow-inner">
                                            {itemForm.image_url ? (
                                                <>
                                                    <img src={itemForm.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Item" />
                                                    <div className="absolute inset-x-8 bottom-8 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                                        <button onClick={() => setShowPhotoStudio(true)} className="w-full py-4 bg-white/90 backdrop-blur rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-white"><Sparkles size={16} className="text-primary-500" /> Magic Studio</button>
                                                        <button onClick={() => setItemForm(prev => ({ ...prev, image_url: '' }))} className="w-full py-4 bg-red-600/90 backdrop-blur rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-2xl hover:bg-red-700">Remove Asset</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-6 p-10">
                                                    <div className={`w-24 h-24 rounded-[36px] bg-white shadow-2xl flex items-center justify-center ${uploadingItemImage ? 'animate-bounce text-primary-500' : 'text-neutral-200 group-hover:text-primary-500 transition-colors'}`}><Upload size={40} /></div>
                                                    <div className="text-center">
                                                        <p className="font-black text-neutral-900 tracking-tight">Upload Production Photo</p>
                                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">RAW or Post-Processed</p>
                                                    </div>
                                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleItemImageUpload} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <div className="p-10 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between gap-8">
                            <button className="flex-1 py-5 font-black text-neutral-400 uppercase tracking-widest text-[11px] hover:text-neutral-900 transition-colors" onClick={() => setShowItemModal(false)}>Abort Deployment</button>
                            <button className="flex-[2] py-5 bg-primary-500 text-white rounded-[24px] font-black text-sm shadow-xl shadow-primary-500/25 active:scale-[0.98] transition-all disabled:opacity-50" onClick={handleSaveItem} disabled={saving || uploadingItemImage}>{editingItem ? 'Finalize Master Overhaul' : 'Initialize Content Release'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showPhotoStudio && (
                <div className="fixed inset-0 z-[3000]">
                    <PhotoStudio
                        imageUrl={itemForm.image_url}
                        onSave={handleStudioSave}
                        onClose={() => setShowPhotoStudio(false)}
                    />
                </div>
            )}
        </div>
    );
}
