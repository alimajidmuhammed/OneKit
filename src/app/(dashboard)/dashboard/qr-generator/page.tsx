// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQRCode } from '@/lib/hooks/useQRCode';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { formatDate, getWhatsAppLink } from '@/lib/utils/helpers';
import { APP_CONFIG } from '@/lib/utils/constants';
import { Plus, QrCode, Clock, Edit, Trash2, X, Sparkles, Loader2, Zap, AlertTriangle, Scan, ExternalLink } from 'lucide-react';

const QR_TEMPLATES = [
    { id: 'modern', name: 'Modern', preview: '🔳', colors: ['#5B6EF2', '#7C3AED'] },
    { id: 'gradient', name: 'Gradient', preview: '🌈', colors: ['#EC4899', '#8B5CF6'] },
    { id: 'ocean', name: 'Ocean', preview: '🌊', colors: ['#0EA5E9', '#06B6D4'] },
    { id: 'forest', name: 'Forest', preview: '🌲', colors: ['#22C55E', '#10B981'] },
    { id: 'neon', name: 'Neon', preview: '💡', colors: ['#00FF88', '#00D4FF'] },
    { id: 'sunset', name: 'Sunset', preview: '🌅', colors: ['#F97316', '#EF4444'] },
    { id: 'candy', name: 'Candy', preview: '🍬', colors: ['#F472B6', '#FB7185'] },
    { id: 'aurora', name: 'Aurora', preview: '🌌', colors: ['#A855F7', '#2DD4BF'] },
    { id: 'corporate', name: 'Corporate', preview: '🏢', colors: ['#1E40AF', '#075985'] },
    { id: 'elegant', name: 'Elegant', preview: '💎', colors: ['#6366F1', '#4F46E5'] },
    { id: 'business', name: 'Business', preview: '👔', colors: ['#334155', '#1E293B'] },
    { id: 'minimal', name: 'Minimal', preview: '⬜', colors: ['#000000', '#000000'] },
];

/**
 * QRGeneratorPage - OneKit 3.0 Link Intelligence
 * Rebuilt with pure Tailwind v4. High-fidelity scan tracking and premium card architecture.
 */
export default function QRGeneratorPage() {
    const { qrCodes, loading, createQRCode, deleteQRCode, saving } = useQRCode();
    const {
        hasAccess,
        getAccessStatus,
        trialDaysRemaining,
        trialHoursRemaining,
    } = useSubscription();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [deleteId, setDeleteId] = useState(null);

    const accessStatus = getAccessStatus('qr-generator');
    const canAccess = hasAccess('qr-generator');
    const isTrialActive = accessStatus?.type === 'trial';
    const isTrialExpired = accessStatus?.type === 'expired';

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { data, error } = await createQRCode(newName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewName('');
            window.location.href = `/dashboard/qr-generator/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteQRCode(deleteId);
        setDeleteId(null);
    };

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-12 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary-200/50">
                        Link Infusion
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none italic">
                        QR <span className="text-primary-600">Forge</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Convert digital protocols into scannable physical access points.
                    </p>
                </div>
                {canAccess && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-premium group flex items-center gap-3 px-8 py-4 bg-primary-950 text-white rounded-[24px] font-black text-sm shadow-premium-layered hover:scale-105 transition-all active:scale-95"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        Create New Forge
                    </button>
                )}
            </div>

            {/* Trial/Status Banners */}
            {isTrialActive && (
                <div className="p-8 rounded-[40px] bg-orange-50 border border-orange-100/50 text-orange-950 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-orange-900/5 relative overflow-hidden group">
                    <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />
                    <div className="w-20 h-20 rounded-[30px] bg-white flex items-center justify-center shrink-0 shadow-lg text-orange-600">
                        <Zap size={40} className="animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-xl font-black tracking-tight italic uppercase lg:text-2xl">Forge Trial Active</h3>
                        <p className="text-orange-900/60 font-semibold mt-1 italic">
                            Unrestricted creation enabled for {trialDaysRemaining > 0
                                ? `${trialDaysRemaining} day${trialDaysRemaining > 1 ? 's' : ''}`
                                : `${trialHoursRemaining} hour${trialHoursRemaining > 1 ? 's' : ''}`
                            } remaining.
                        </p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to QR Generator')}
                        target="_blank"
                        className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-105 transition-all"
                    >
                        Unlock Permanent Forge
                    </a>
                </div>
            )}

            {isTrialExpired && (
                <div className="p-8 rounded-[40px] bg-red-50 border border-red-100/50 text-red-950 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-red-900/5 relative overflow-hidden group">
                    <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />
                    <div className="w-20 h-20 rounded-[30px] bg-white flex items-center justify-center shrink-0 shadow-lg text-red-600">
                        <AlertTriangle size={40} className="animate-bounce" />
                    </div>
                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h3 className="text-xl font-black tracking-tight italic uppercase lg:text-2xl">Protocol Expired</h3>
                        <p className="text-red-900/60 font-semibold mt-1 italic">
                            Archive remains accessible, but forge capabilities are now offline.
                        </p>
                    </div>
                    <a
                        href={getWhatsAppLink(APP_CONFIG.whatsapp.number, 'Hi! I want to subscribe to QR Generator')}
                        target="_blank"
                        className="px-8 py-4 bg-red-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-900/20 hover:scale-105 transition-all"
                    >
                        Restore Forge Access
                    </a>
                </div>
            )}

            {/* QR Codes Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                    <span className="font-black text-sm uppercase tracking-[0.3em] text-neutral-400">Syncing Link Nodes...</span>
                </div>
            ) : qrCodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {qrCodes.map((qr) => {
                        const template = QR_TEMPLATES.find(t => t.id === qr.template_id);
                        return (
                            <div key={qr.id} className="group bg-white border border-neutral-100 rounded-[36px] overflow-hidden shadow-sm hover:shadow-premium-layered hover:-translate-y-2 transition-all duration-500 flex flex-col">
                                {/* QR Display Area */}
                                <div className="relative h-64 bg-neutral-900 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-1000" style={{
                                        background: `radial-gradient(circle at center, ${template?.colors[0] || '#5B6EF2'}44 0%, transparent 70%)`
                                    }} />

                                    <div className="z-10 bg-white p-6 rounded-[24px] shadow-2xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                        <QrCode size={96} className="text-neutral-950" />
                                    </div>

                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Scan size={12} /> Live Node
                                    </div>

                                    <div className="texture-noise absolute inset-0 opacity-[0.05] pointer-events-none" />
                                </div>

                                {/* Info Area */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-xl font-black text-neutral-900 tracking-tight group-hover:text-primary-600 transition-colors truncate italic">
                                            {qr.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-primary-600 font-black text-lg italic">
                                            {qr.view_count || 0}
                                            <span className="text-[10px] text-neutral-400 uppercase not-italic tracking-widest">Scans</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {template?.name || 'Modern'} Protocol
                                        </span>
                                        <span className="px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                            <Clock size={10} /> {formatDate(qr.created_at)}
                                        </span>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center gap-3">
                                        {canAccess && (
                                            <Link
                                                href={`/dashboard/qr-generator/${qr.id}`}
                                                className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary-950 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-neutral-900/10 hover:bg-primary-600 hover:shadow-primary-600/20 transition-all active:scale-95"
                                            >
                                                <Edit size={16} />
                                                Edit Forge
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setDeleteId(qr.id)}
                                            className="w-14 h-14 flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 rounded-[20px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white border border-dashed border-neutral-200 rounded-[48px]">
                    <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200 shadow-inner">
                        <QrCode size={48} />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-2xl font-black text-neutral-900 italic">No Links Forged</h3>
                        <p className="text-neutral-400 font-medium italic">Transform your digital identifiers into physical gateways today.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-premium flex items-center gap-3 px-12 py-4 bg-primary-600 text-white rounded-full font-black text-sm shadow-xl shadow-primary-600/20"
                    >
                        Initialize First Forge
                    </button>
                </div>
            )}

            {/* Create Modal: OneKit 3.0 Standard */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowCreateModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-neutral-100 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-10 py-8 border-b border-neutral-50">
                            <div>
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter italic uppercase">Forge Initialization</h1>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Configure your scan destination protocol</p>
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors" onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] block ml-1">Forge Designation</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g., Main Reception Display"
                                    autoFocus
                                    className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[28px] text-xl font-black focus:bg-white focus:border-primary-500 focus:shadow-xl focus:shadow-primary-600/5 transition-all outline-none placeholder:text-neutral-200"
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-1">Select Visual Archetype</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {QR_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            className={`relative flex flex-col items-center gap-4 p-8 border-2 rounded-[36px] transition-all cursor-pointer group active:scale-95 ${selectedTemplate === template.id
                                                    ? 'border-primary-600 bg-primary-50/30'
                                                    : 'border-neutral-50 hover:border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" style={{
                                                background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`,
                                                boxShadow: selectedTemplate === template.id ? `0 10px 30px ${template.colors[0]}44` : 'none'
                                            }}>
                                                <QrCode size={28} className="text-white" />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[11px] font-black text-neutral-900 uppercase tracking-tighter">{template.name}</div>
                                            </div>

                                            {selectedTemplate === template.id && (
                                                <div className="absolute top-4 right-4 text-primary-600 animate-in zoom-in duration-300">
                                                    <Sparkles size={16} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between gap-6">
                            <button className="flex-1 py-5 rounded-[24px] font-black text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-widest text-[11px]" onClick={() => setShowCreateModal(false)}>
                                Abort Forge
                            </button>
                            <button
                                className="flex-[2] py-5 bg-primary-950 text-white rounded-[24px] font-black text-sm shadow-premium-layered hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleCreate}
                                disabled={saving || !newName.trim()}
                            >
                                {saving ? 'Forging Link...' : 'Confirm & Initialize'}
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
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic uppercase">Dismantle Forge?</h2>
                            <p className="text-neutral-400 font-medium text-sm px-4 leading-relaxed italic">
                                Dismantling this forge will permanently sever the link and incinerate all scan telemetry.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all" onClick={handleDelete}>
                                Dismantle Permanently
                            </button>
                            <button className="w-full py-4 bg-neutral-50 text-neutral-400 rounded-2xl font-black text-sm hover:text-neutral-900 transition-all" onClick={() => setDeleteId(null)}>
                                Maintain Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
