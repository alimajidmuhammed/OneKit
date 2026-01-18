// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMenu } from '@/lib/hooks/useMenu';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { formatDate, getWhatsAppLink } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import { Plus, Utensils, Clock, AlertTriangle, Edit, Eye, Trash2, X, Sparkles, ChevronRight, Loader2 } from 'lucide-react';

const MENU_TEMPLATES = [
    { id: 'classic', name: 'Classic', preview: '📋', description: 'Traditional menu layout' },
    { id: 'elegant', name: 'Elegant', preview: '🍽️', description: 'Fancy restaurant style' },
    { id: 'vintage', name: 'Vintage', preview: '📜', description: 'Retro classic look' },
    { id: 'modern', name: 'Modern', preview: '✨', description: 'Clean and minimal' },
    { id: 'minimalist', name: 'Minimalist', preview: '⬜', description: 'Ultra clean design' },
    { id: 'bold', name: 'Bold', preview: '🔥', description: 'Strong typography' },
    { id: 'italian', name: 'Italian', preview: '🍝', description: 'Trattoria vibes' },
    { id: 'asian', name: 'Asian', preview: '🍜', description: 'Oriental inspired' },
    { id: 'mexican', name: 'Mexican', preview: '🌮', description: 'Vibrant & colorful' },
    { id: 'sushi', name: 'Sushi', preview: '🍣', description: 'Japanese style' },
    { id: 'indian', name: 'Indian', preview: '🍛', description: 'Spice themed' },
    { id: 'arabic', name: 'Arabic', preview: '🧆', description: 'Middle Eastern' },
    { id: 'casual', name: 'Casual', preview: '🍔', description: 'Fun and friendly' },
    { id: 'cafe', name: 'Cafe', preview: '☕', description: 'Coffee shop vibes' },
    { id: 'bakery', name: 'Bakery', preview: '🥐', description: 'Sweet & cozy' },
    { id: 'pizza', name: 'Pizzeria', preview: '🍕', description: 'Pizza parlor style' },
    { id: 'bar', name: 'Bar & Grill', preview: '🍺', description: 'Pub atmosphere' },
    { id: 'dark', name: 'Dark Mode', preview: '🌙', description: 'Dark themed menu' },
];

/**
 * MenuMakerPage - OneKit 3.0 Premium Edition
 * Rebuilt with pure Tailwind v4, high-end modal experiences, and glassmorphism banners.
 */
export default function MenuMakerPage() {
    const { menus, loading, createMenu, deleteMenu, saving } = useMenu();
    const {
        hasAccess,
        getAccessStatus,
        trialDaysRemaining,
        trialHoursRemaining,
    } = useSubscription();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [deleteId, setDeleteId] = useState(null);

    const accessStatus = getAccessStatus('menu-maker');
    const canAccess = hasAccess('menu-maker');
    const isTrialActive = accessStatus?.type === 'trial';
    const isTrialExpired = accessStatus?.type === 'expired';

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createMenu(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/menu-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteMenu(deleteId);
        setDeleteId(null);
    };

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-12 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-accent-100 text-accent-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-accent-200/50">
                        Hospitality Suite
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">
                        Menu <span className="text-primary-600">Maker</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Deploy world-class digital menus with QR integration in seconds.
                    </p>
                </div>
                {canAccess && (
                    <Link
                        href="/dashboard/menu-maker/new"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-2xl transition-all active:scale-95"
                    >
                        <Plus size={16} /> New Menu Build
                    </Link>
                )}
            </div>

            {/* Status Banners: Glassmorphism 2.0 */}
            {(isTrialActive || isTrialExpired) && (
                <div className={`p-6 rounded-[32px] border backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6 shadow-xl animate-fade-in ${isTrialExpired
                    ? 'bg-red-50/80 border-red-200/50 text-red-900'
                    : 'bg-primary-50/80 border-primary-200/50 text-primary-900'
                    }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isTrialExpired ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'
                        }`}>
                        {isTrialExpired ? <AlertTriangle size={28} /> : <Clock size={28} className="animate-pulse" />}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-black tracking-tight">
                            {isTrialExpired ? 'Trial Period Expired' : 'Free Trial Active'}
                        </h3>
                        <p className={`text-sm font-medium opacity-70`}>
                            {isTrialExpired
                                ? 'Subscribe now to continue editing and publishing your professional menus.'
                                : `You have ${trialDaysRemaining > 0 ? `${trialDaysRemaining} days` : `${trialHoursRemaining} hours`} left in your free trial.`
                            }
                        </p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, `Hi! I want to subscribe to Menu Maker. Status: ${isTrialExpired ? 'Expired' : 'Active'}`)}
                        target="_blank"
                        className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${isTrialExpired
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20'
                            }`}
                    >
                        {isTrialExpired ? 'Subscribe via WhatsApp' : 'Upgrade to Pro'}
                    </a>
                </div>
            )}

            {/* Menus Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                    <span className="font-black text-sm uppercase tracking-[0.3em] text-neutral-400">Syncing with Cloud...</span>
                </div>
            ) : menus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {menus.map((menu) => (
                        <div key={menu.id} className="group bg-white border border-neutral-100 rounded-[36px] overflow-hidden shadow-sm hover:shadow-premium-layered hover:-translate-y-2 transition-all duration-500 flex flex-col">
                            {/* Preview Area */}
                            <div className="relative h-48 bg-neutral-50 flex items-center justify-center border-b border-neutral-50 overflow-hidden">
                                <div className="text-7xl group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-700">
                                    {MENU_TEMPLATES.find(t => t.id === menu.template_id)?.preview || '📋'}
                                </div>

                                {menu.is_published && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-green-500/30 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        Live Now
                                    </div>
                                )}

                                <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />
                            </div>

                            {/* Info Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h3 className="text-xl font-black text-neutral-900 tracking-tight group-hover:text-primary-600 transition-colors truncate">
                                        {menu.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-bold rounded-full border border-neutral-100">
                                        <Eye size={12} />
                                        {menu.view_count || 0}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {MENU_TEMPLATES.find(t => t.id === menu.template_id)?.name || 'Classic'}
                                    </span>
                                    <span className="px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Updated {formatDate(menu.updated_at)}
                                    </span>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center gap-3">
                                    {canAccess && (
                                        <Link
                                            href={`/dashboard/menu-maker/${menu.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-neutral-900/10 hover:bg-primary-600 hover:shadow-primary-600/20 transition-all active:scale-95"
                                        >
                                            <Edit size={14} />
                                            Open Studio
                                        </Link>
                                    )}
                                    {menu.is_published && (
                                        <Link
                                            href={`/menu/${menu.slug}`}
                                            target="_blank"
                                            className="w-12 h-12 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-2xl hover:bg-neutral-50 hover:text-primary-600 transition-all active:scale-95"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => setDeleteId(menu.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white border border-dashed border-neutral-200 rounded-[48px]">
                    <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                        <Utensils size={48} />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-2xl font-black text-neutral-900">Your Menu Catalog is Empty</h3>
                        <p className="text-neutral-400 font-medium italic">Transform your paper menus into professional digital experiences today.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-premium flex items-center gap-3 px-10 py-4 bg-primary-600 text-white rounded-full font-black text-sm shadow-xl shadow-primary-600/20"
                    >
                        Initialize First Menu
                    </button>
                </div>
            )}

            {/* Create Modal: OneKit 3.0 Standard */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-neutral-100 h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-10 py-8 border-b border-neutral-50">
                            <div>
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter italic">Studio Initialize</h1>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Configure your hospitality infrastructure</p>
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors" onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] block ml-1">Entity Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Tony's Pizzeria"
                                    autoFocus
                                    className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[28px] text-xl font-black focus:bg-white focus:border-primary-500 focus:shadow-xl focus:shadow-primary-600/5 transition-all outline-none placeholder:text-neutral-200"
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Select Blueprint</label>
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] bg-primary-50 px-3 py-1 rounded-full">18 Templates Available</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                    {MENU_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            className={`relative flex flex-col items-center gap-4 p-8 border-2 rounded-[36px] transition-all cursor-pointer group active:scale-95 ${selectedTemplate === template.id
                                                ? 'border-primary-600 bg-primary-50/30'
                                                : 'border-neutral-50 hover:border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{template.preview}</div>
                                            <div className="text-center">
                                                <div className="text-sm font-black text-neutral-900">{template.name}</div>
                                                <div className="text-[10px] font-medium text-neutral-400 mt-1 line-clamp-1">{template.description}</div>
                                            </div>

                                            {selectedTemplate === template.id && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-in zoom-in duration-300">
                                                    <Sparkles size={14} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between gap-6">
                            <button className="flex-1 py-5 rounded-[24px] font-black text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest text-[11px]" onClick={() => setShowCreateModal(false)}>
                                Cancel Initialize
                            </button>
                            <button
                                className="flex-[2] py-5 bg-primary-950 text-white rounded-[24px] font-black text-sm shadow-premium-layered hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                            >
                                {saving ? 'Initializing Cloud Sync...' : 'Confirm & Deploy Prototype'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation: Premium Alert */}
            {deleteId && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setDeleteId(null)} />
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 border border-neutral-100">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 size={40} />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Permanent Deletion</h2>
                            <p className="text-neutral-400 font-medium text-sm px-4 leading-relaxed">
                                Are you certain? This action will incinerate all categories, items, and view data associated with this menu.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all" onClick={handleDelete}>
                                Confirm Incineration
                            </button>
                            <button className="w-full py-4 bg-neutral-50 text-neutral-400 rounded-2xl font-black text-sm hover:text-neutral-900 transition-all" onClick={() => setDeleteId(null)}>
                                Abort
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
