// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInvoice } from '@/lib/hooks/useInvoice';
import { formatDate } from '@/lib/utils/helpers';
import { Plus, Receipt, Clock, Edit, Trash2, X, Sparkles, Loader2, FileText, BadgeCheck, Zap, DollarSign } from 'lucide-react';

const INVOICE_TEMPLATES = [
    { id: 'classic', name: 'Classic Receipt', preview: '📄', description: 'Standard business' },
    { id: 'modern', name: 'Modern', preview: '✨', description: 'Clean & professional' },
    { id: 'minimal', name: 'Minimalist', preview: '⬜', description: 'Simple & direct' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Business oriented' },
    { id: 'luxury', name: 'Luxury', preview: '💎', description: 'Elegant & high-end' },
    { id: 'compact', name: 'Compact', preview: '📏', description: 'Efficient & small' }
];

/**
 * InvoiceMakerPage - OneKit 3.0 Financial Suite
 * Rebuilt with pure Tailwind v4. High-fidelity document management and premium financial visuals.
 */
export default function InvoiceMakerPage() {
    const { invoices, loading, createInvoice, deleteInvoice, saving } = useInvoice();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createInvoice(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/invoice-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteInvoice(deleteId);
        setDeleteId(null);
    };

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-12 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-green-200/50">
                        Financial Engine
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none italic uppercase">
                        Invoice <span className="text-green-600">Terminal</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Standardize your revenue documentation with professional financial blueprints.
                    </p>
                </div>
                <Link
                    href="/dashboard/invoice-maker/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-2xl transition-all active:scale-95"
                >
                    <Plus size={16} /> New Asset
                </Link>
            </div>

            {/* Premium Stats/Banner Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-[40px] bg-secondary-950 text-white relative overflow-hidden group">
                    <div className="texture-noise absolute inset-0 opacity-[0.05] pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center text-secondary-400 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <BadgeCheck size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Verified Templates</h3>
                            <p className="text-secondary-400 text-sm font-medium mt-1">All blueprints are legal-ready and VAT compliant.</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 rounded-[40px] bg-green-950 text-white relative overflow-hidden group">
                    <div className="texture-noise absolute inset-0 opacity-[0.05] pointer-events-none" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center text-green-400 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Rapid Export</h3>
                            <p className="text-green-400 text-sm font-medium mt-1">Generate high-fidelity PDFs in milliseconds.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                    <span className="font-black text-sm uppercase tracking-[0.3em] text-neutral-400">Loading Ledger Nodes...</span>
                </div>
            ) : invoices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {invoices.map((invoice) => (
                        <div key={invoice.id} className="group bg-white border border-neutral-100 rounded-[36px] overflow-hidden shadow-sm hover:shadow-premium-layered hover:-translate-y-2 transition-all duration-500 flex flex-col">
                            {/* Document Preview Area */}
                            <div className="relative h-64 bg-neutral-50 flex items-center justify-center overflow-hidden border-b border-neutral-50">
                                <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-1000 bg-brand-gradient" />

                                <div className="z-10 bg-white p-10 rounded-[28px] shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500">
                                    <Receipt size={72} className="text-neutral-900" />
                                </div>

                                <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={12} /> Financial Node
                                </div>

                                <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />
                            </div>

                            {/* Info Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-neutral-900 tracking-tight group-hover:text-green-600 transition-colors truncate mb-2 italic uppercase">
                                    {invoice.name}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {INVOICE_TEMPLATES.find(t => t.id === invoice.template_id)?.name || 'Classic'} Protocol
                                    </span>
                                    <span className="px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                        <Clock size={10} /> {formatDate(invoice.updated_at)}
                                    </span>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/invoice-maker/${invoice.id}`}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary-950 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-neutral-900/10 hover:bg-green-600 hover:shadow-green-600/20 transition-all active:scale-95"
                                    >
                                        <Edit size={16} />
                                        Launch Terminal
                                    </Link>
                                    <button
                                        onClick={() => setDeleteId(invoice.id)}
                                        className="w-14 h-14 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-[20px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white border border-dashed border-neutral-200 rounded-[48px]">
                    <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 shadow-inner">
                        <Receipt size={48} />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-2xl font-black text-neutral-900 italic uppercase">Ledger Is Clear</h3>
                        <p className="text-neutral-400 font-medium italic">Initialize your first professional revenue protocol to begin tracking.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-premium flex items-center gap-3 px-12 py-4 bg-green-600 text-white rounded-full font-black text-sm shadow-xl shadow-green-600/20"
                    >
                        Initialize First Ledger
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
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter italic uppercase">Document Initialization</h1>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Configure your financial identity blueprint</p>
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors" onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-green-600 uppercase tracking-[0.3em] block ml-1">Internal Designation</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Client Alpha Receipt - Q3"
                                    autoFocus
                                    className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[28px] text-xl font-black focus:bg-white focus:border-green-500 focus:shadow-xl focus:shadow-green-600/5 transition-all outline-none placeholder:text-neutral-200"
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-1">Select Document Architecture</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pb-4">
                                    {INVOICE_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            className={`relative flex flex-col items-center gap-4 p-8 border-2 rounded-[36px] transition-all cursor-pointer group active:scale-95 ${selectedTemplate === template.id
                                                ? 'border-green-600 bg-green-50/30'
                                                : 'border-neutral-50 hover:border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="text-4xl group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0">{template.preview}</div>
                                            <div className="text-center">
                                                <div className="text-[11px] font-black text-neutral-900 uppercase tracking-tighter">{template.name}</div>
                                                <div className="text-[9px] font-medium text-neutral-400 mt-1 line-clamp-1 italic uppercase">{template.description}</div>
                                            </div>

                                            {selectedTemplate === template.id && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-in zoom-in duration-300">
                                                    <BadgeCheck size={14} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between gap-6">
                            <button className="flex-1 py-5 rounded-[24px] font-black text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest text-[11px]" onClick={() => setShowCreateModal(false)}>
                                Abort Build
                            </button>
                            <button
                                className="flex-[2] py-5 bg-primary-950 text-white rounded-[24px] font-black text-sm shadow-premium-layered hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                            >
                                {saving ? 'Initializing Architecture...' : 'Confirm & Deploy Document'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation: Premium Alert */}
            {deleteId && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setDeleteId(null)} />
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border border-neutral-100">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <Trash2 size={40} />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic uppercase">Destroy Document?</h2>
                            <p className="text-neutral-400 font-medium text-sm px-4 leading-relaxed italic">
                                This action will permanently incinerate this financial record. This protocol cannot be reversed.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all" onClick={handleDelete}>
                                Confirm Destruction
                            </button>
                            <button className="w-full py-4 bg-neutral-50 text-neutral-400 rounded-2xl font-black text-sm hover:text-neutral-900 transition-all" onClick={() => setDeleteId(null)}>
                                Maintain Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
