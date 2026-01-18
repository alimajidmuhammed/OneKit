// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBusinessCard } from '@/lib/hooks/useBusinessCard';
import { formatDate } from '@/lib/utils/helpers';
import { Plus } from 'lucide-react';

const CARD_TEMPLATES = [
    { id: 'modern', name: 'Modern', preview: '📇', description: 'Clean and professional' },
    { id: 'minimal', name: 'Minimal', preview: '✨', description: 'Simple & Elegant' },
    { id: 'creative', name: 'Creative', preview: '🎨', description: 'Bold & Artistic' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Formal business style' },
];

/**
 * BusinessCardDashboard - OneKit 3.0 Premium Edition
 * Migrated to pure Tailwind v4 with high-end modal experiences.
 */
export default function BusinessCardDashboard() {
    const { cards, loading, createCard, deleteCard, saving } = useBusinessCard();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createCard(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/card-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteCard(deleteId);
        setDeleteId(null);
    };

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-8 animate-reveal">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-3">
                    <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-200/50">
                        Design Suite
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none">
                        Business <span className="bg-brand-gradient bg-clip-text text-transparent italic">Card Maker</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Design professional networking cards for free
                    </p>
                </div>
                <button
                    className="btn-premium flex items-center gap-2 px-8 py-4 bg-primary-950 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-premium-layered hover:shadow-xl hover:-translate-y-1"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} />
                    Create New Card
                </button>
            </div>

            {/* Free Banner */}
            <div className="flex items-center gap-5 bg-primary-50 border border-primary-100 p-6 rounded-[32px]">
                <div className="text-4xl">✨</div>
                <div>
                    <strong className="text-primary-900 text-lg font-black">Now Free Forever!</strong>
                    <p className="text-primary-700 mt-1">Business Card Maker is now a free service. Design and export unlimited cards.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="spinner" />
                    <span className="text-neutral-400 font-medium">Loading your designs...</span>
                </div>
            ) : cards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {cards.map((card) => (
                        <div key={card.id} className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-premium-layered hover:-translate-y-1 group">
                            <div className="h-48 bg-neutral-50 flex items-center justify-center border-b border-neutral-100">
                                <div className="text-6xl">
                                    {CARD_TEMPLATES.find(t => t.id === card.template_id)?.preview || '📇'}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-black text-neutral-900 mb-1">{card.name}</h3>
                                <span className="text-sm text-neutral-400">Updated {formatDate(card.updated_at)}</span>
                            </div>
                            <div className="px-6 pb-6 pt-0 flex gap-3 border-t border-neutral-50 bg-neutral-50/50">
                                <Link
                                    href={`/dashboard/card-maker/${card.id}`}
                                    className="flex-1 text-center bg-white text-neutral-900 px-5 py-3 rounded-2xl font-bold text-sm border border-neutral-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
                                >
                                    Edit
                                </Link>
                                <button
                                    className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                                    onClick={() => setDeleteId(card.id)}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-7xl mb-6">📇</div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-2">No designs yet</h3>
                    <p className="text-neutral-400 mb-8">Create your first high-end business card today</p>
                    <button
                        className="btn-premium inline-flex items-center gap-2 px-8 py-4 bg-primary-950 text-white rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-premium-layered hover:shadow-xl hover:-translate-y-1"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} />
                        Get Started
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[1000] animate-fade-in p-4">
                    <div className="bg-white p-10 rounded-[40px] w-full max-w-lg flex flex-col gap-6 shadow-premium-layered animate-fade-in-up">
                        <h2 className="text-2xl font-black text-neutral-900">New Business Card</h2>
                        <input
                            type="text"
                            placeholder="Card Name (e.g. My Personal Card)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border border-neutral-200 text-base font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            {CARD_TEMPLATES.map(t => (
                                <div
                                    key={t.id}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all duration-300 ${selectedTemplate === t.id
                                            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-lg'
                                            : 'border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-neutral-200 hover:bg-white'
                                        }`}
                                    onClick={() => setSelectedTemplate(t.id)}
                                >
                                    <span className="text-3xl block mb-2">{t.preview}</span>
                                    <p className="text-xs font-black uppercase tracking-wider">{t.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm border-2 border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                                className="btn-premium flex-1 px-6 py-4 bg-primary-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                {saving ? 'Creating...' : 'Create design'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[1000] animate-fade-in p-4">
                    <div className="bg-white p-10 rounded-[40px] w-full max-w-md flex flex-col gap-6 shadow-premium-layered animate-fade-in-up">
                        <h2 className="text-2xl font-black text-neutral-900">Delete Card?</h2>
                        <p className="text-neutral-500">This will permanently remove your design.</p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm border-2 border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-red-700 hover:shadow-xl transition-all active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
