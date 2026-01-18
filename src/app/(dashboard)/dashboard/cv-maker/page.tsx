// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCV } from '@/lib/hooks/useCV';
import { formatDate } from '@/lib/utils/helpers';
import { Plus, FileText, Clock, Edit, Trash2, X, Sparkles, Loader2, Briefcase, GraduationCap, Palette, Zap } from 'lucide-react';

const CV_TEMPLATES = [
    { id: 'professional', name: 'Professional', preview: '📄', description: 'Clean and modern' },
    { id: 'executive', name: 'Executive', preview: '💼', description: 'For senior positions' },
    { id: 'corporate', name: 'Corporate', preview: '🏢', description: 'Business formal style' },
    { id: 'creative', name: 'Creative', preview: '🎨', description: 'Stand out from the crowd' },
    { id: 'designer', name: 'Designer', preview: '🖌️', description: 'Visual & artistic' },
    { id: 'portfolio', name: 'Portfolio', preview: '📷', description: 'Showcase your work' },
    { id: 'minimal', name: 'Minimal', preview: '✨', description: 'Simple and elegant' },
    { id: 'clean', name: 'Clean', preview: '🤍', description: 'Whitespace focused' },
    { id: 'simple', name: 'Simple', preview: '📑', description: 'No frills, just facts' },
    { id: 'tech', name: 'Tech', preview: '💻', description: 'Perfect for developers' },
    { id: 'data', name: 'Data Science', preview: '📊', description: 'Analytics focused' },
    { id: 'engineering', name: 'Engineering', preview: '⚙️', description: 'Technical roles' },
    { id: 'academic', name: 'Academic', preview: '🎓', description: 'For researchers & educators' },
    { id: 'medical', name: 'Medical', preview: '🏥', description: 'Healthcare professionals' },
    { id: 'modern', name: 'Modern', preview: '🚀', description: 'Contemporary design' },
];

/**
 * CVMakerPage - OneKit 3.0 Career Suite
 * Rebuilt with pure Tailwind v4, high-density typography, and premium grid architecture.
 */
export default function CVMakerPage() {
    const { cvs, loading, createCV, deleteCV, saving } = useCV();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCVName, setNewCVName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('professional');
    const [deleteId, setDeleteId] = useState(null);

    const handleCreate = async () => {
        if (!newCVName.trim()) return;
        const { data, error } = await createCV(newCVName, selectedTemplate);
        if (!error && data) {
            setShowCreateModal(false);
            setNewCVName('');
            window.location.href = `/dashboard/cv-maker/${data.id}`;
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteCV(deleteId);
        setDeleteId(null);
    };

    return (
        <div className="p-6 md:p-10 lg:p-16 max-w-7xl mx-auto space-y-12 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <span className="inline-block px-4 py-1 bg-secondary-100 text-secondary-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-secondary-200/50">
                        Career Infrastructure
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none italic">
                        CV <span className="text-secondary-600">Architect</span>
                    </h1>
                    <p className="text-lg text-neutral-400 font-medium max-w-lg">
                        Build your professional legacy with world-class resume blueprints.
                    </p>
                </div>
                <Link
                    href="/dashboard/cv-maker/new"
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary-500/25 hover:shadow-2xl transition-all active:scale-95"
                >
                    <Plus size={16} /> New Asset
                </Link>
            </div>

            {/* Free Status Banner: OneKit 3.0 Edition */}
            <div className="p-8 rounded-[40px] bg-brand-gradient text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                <div className="texture-noise absolute inset-0 opacity-20 pointer-events-none" />
                <div className="w-20 h-20 rounded-[30px] bg-white/10 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                    <Sparkles size={44} className="animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                    <h3 className="text-2xl font-black tracking-tight italic">Always Unrestricted.</h3>
                    <p className="text-lg font-medium opacity-80 mt-1 max-w-xl">
                        Our career suite is a gift to the professional community. Create unlimited, high-resolution CVs with no restricted protocols.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} /> Total Access
                    </div>
                </div>
            </div>

            {/* CVs Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                    <span className="font-black text-sm uppercase tracking-[0.3em] text-neutral-400">Querying Career Vault...</span>
                </div>
            ) : cvs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {cvs.map((cv) => (
                        <div key={cv.id} className="group bg-white border border-neutral-100 rounded-[36px] overflow-hidden shadow-sm hover:shadow-premium-layered hover:-translate-y-2 transition-all duration-500 flex flex-col">
                            {/* Preview Area */}
                            <div className="relative h-64 bg-neutral-50 flex items-center justify-center border-b border-neutral-50 overflow-hidden">
                                <div className="text-8xl group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700 opacity-80">
                                    {CV_TEMPLATES.find(t => t.id === cv.template_id)?.preview || '📄'}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-100/50 to-transparent pointer-events-none" />
                                <div className="texture-noise absolute inset-0 opacity-[0.03] pointer-events-none" />
                            </div>

                            {/* Info Area */}
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-neutral-900 tracking-tight group-hover:text-primary-600 transition-colors truncate mb-2 italic">
                                    {cv.name}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-8">
                                    <span className="px-3 py-1 bg-secondary-50 text-secondary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {CV_TEMPLATES.find(t => t.id === cv.template_id)?.name || 'Professional'} Blueprint
                                    </span>
                                    <span className="px-3 py-1 bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                        <Clock size={10} /> {formatDate(cv.updated_at)}
                                    </span>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-auto pt-6 border-t border-neutral-50 flex items-center gap-3">
                                    <Link
                                        href={`/dashboard/cv-maker/${cv.id}`}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary-950 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-lg shadow-neutral-900/10 hover:bg-secondary-600 hover:shadow-secondary-600/20 transition-all active:scale-95"
                                    >
                                        <Edit size={16} />
                                        Launch Architect
                                    </Link>
                                    <button
                                        onClick={() => setDeleteId(cv.id)}
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
                        <FileText size={48} />
                    </div>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <h3 className="text-2xl font-black text-neutral-900 italic">Resume Repository Empty</h3>
                        <p className="text-neutral-400 font-medium italic">Begin your professional evolution by initializing your first career blueprint.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-premium flex items-center gap-3 px-12 py-4 bg-primary-600 text-white rounded-full font-black text-sm shadow-xl shadow-primary-600/20"
                    >
                        Initialize Career Path
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
                                <h1 className="text-2xl font-black text-neutral-900 tracking-tighter italic">Career Build Protocol</h1>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Configure your professional identity anchor</p>
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors" onClick={() => setShowCreateModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-secondary-600 uppercase tracking-[0.3em] block ml-1">Asset Designation</label>
                                <input
                                    type="text"
                                    value={newCVName}
                                    onChange={(e) => setNewCVName(e.target.value)}
                                    placeholder="e.g., Executive Portfolio 2024"
                                    autoFocus
                                    className="w-full p-6 bg-neutral-50 border border-neutral-100 rounded-[28px] text-xl font-black focus:bg-white focus:border-secondary-500 focus:shadow-xl focus:shadow-secondary-600/5 transition-all outline-none placeholder:text-neutral-200"
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Select Architecture</label>
                                    <span className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.3em] bg-secondary-50 px-3 py-1 rounded-full">15 Blueprints Available</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6 pb-4">
                                    {CV_TEMPLATES.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            className={`relative flex flex-col items-center gap-4 p-8 border-2 rounded-[36px] transition-all cursor-pointer group active:scale-95 ${selectedTemplate === template.id
                                                ? 'border-secondary-600 bg-secondary-50/30'
                                                : 'border-neutral-50 hover:border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{template.preview}</div>
                                            <div className="text-center">
                                                <div className="text-sm font-black text-neutral-900">{template.name}</div>
                                                <div className="text-[10px] font-medium text-neutral-400 mt-1 line-clamp-1">{template.description}</div>
                                            </div>

                                            {selectedTemplate === template.id && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-in zoom-in duration-300">
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
                                Abort Build
                            </button>
                            <button
                                className="flex-[2] py-5 bg-primary-950 text-white rounded-[24px] font-black text-sm shadow-premium-layered hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                onClick={handleCreate}
                                disabled={saving || !newCVName.trim()}
                            >
                                {saving ? 'Initializing Architecture...' : 'Confirm & Deploy Prototype'}
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
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic">Permanent Erasure</h2>
                            <p className="text-neutral-400 font-medium text-sm px-4 leading-relaxed italic">
                                Are you certain? This action will incinerate all career data, experience nodes, and education history in this blueprint.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                            <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all" onClick={handleDelete}>
                                Confirm Incineration
                            </button>
                            <button className="w-full py-4 bg-neutral-50 text-neutral-400 rounded-2xl font-black text-sm hover:text-neutral-900 transition-all" onClick={() => setDeleteId(null)}>
                                Abort Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
